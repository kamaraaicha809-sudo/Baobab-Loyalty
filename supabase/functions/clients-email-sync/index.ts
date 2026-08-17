/**
 * clients-email-sync
 * Reçoit le webhook Resend email.received, télécharge la pièce jointe CSV via API,
 * fait un upsert des clients et envoie une confirmation à l'hôtelier.
 *
 * Auth: Aucune (appelé par Resend)
 * Method: POST
 * Body: Resend email.received webhook payload
 */

import { getServiceClient } from "../_shared/auth.ts";
import type { SupabaseClient } from "../_shared/deps.ts";
import { success, errors } from "../_shared/response.ts";

interface ResendAttachmentMeta {
  id: string;
  filename: string;
  content_type: string;
  download_url?: string;
}

interface ClientRow {
  profile_id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  whatsapp: string | null;
  derniere_visite: string;
}

// --- Helpers CSV ---

function parseDate(input: string): string {
  if (!input?.trim()) return new Date().toISOString().split("T")[0];
  const trimmed = input.trim();
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  const fr = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (fr) {
    const year = fr[3].length === 2 ? 2000 + parseInt(fr[3]) : parseInt(fr[3]);
    const d2 = new Date(year, parseInt(fr[2]) - 1, parseInt(fr[1]));
    if (!isNaN(d2.getTime())) return d2.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

function parseCsvRows(csvText: string): Omit<ClientRow, "profile_id">[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  const colNom = headers.findIndex((h) => /^(nom|name|client|prénom|prenom)$/i.test(h));
  const colEmail = headers.findIndex((h) => /^email$/i.test(h));
  const colTel = headers.findIndex((h) => /^(tel|telephone|phone|téléphone)$/i.test(h));
  const colWhatsapp = headers.findIndex((h) => /^whatsapp$/i.test(h));
  const colDate = headers.findIndex((h) =>
    /^(derniere|dernière|date|visite|last|sejour|séjour)$/i.test(h)
  );

  const fallbackNom = colNom < 0 ? 0 : colNom;
  const fallbackDate = colDate < 0 ? headers.length - 1 : colDate;
  const rows: Omit<ClientRow, "profile_id">[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/[,;]/).map((p) => p.trim());
    const nom = (colNom >= 0 ? parts[colNom] : parts[fallbackNom]) || "";
    if (!nom) continue;
    rows.push({
      nom,
      email: colEmail >= 0 && parts[colEmail] ? parts[colEmail] : null,
      telephone: colTel >= 0 && parts[colTel] ? parts[colTel] : null,
      whatsapp: colWhatsapp >= 0 && parts[colWhatsapp] ? parts[colWhatsapp] : null,
      derniere_visite: parseDate(colDate >= 0 ? parts[colDate] : parts[fallbackDate]),
    });
  }

  return rows;
}

// --- Helpers Resend API ---

function extractProfileId(toAddresses: string[]): string | null {
  for (const addr of toAddresses) {
    const match = addr.match(/sync\+([a-f0-9-]{36})@/i);
    if (match) return match[1];
  }
  return null;
}

async function fetchEmailFull(
  emailId: string,
  apiKey: string
): Promise<{ text: string; to: string[] }> {
  const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  return {
    text: String(data.text ?? ""),
    to: Array.isArray(data.to) ? data.to : [String(data.to ?? "")],
  };
}

async function fetchCsvFromAttachments(
  emailId: string,
  apiKey: string,
  attachmentsMeta: ResendAttachmentMeta[]
): Promise<string | null> {
  const csvMeta = attachmentsMeta.find(
    (a) =>
      a.filename?.toLowerCase().endsWith(".csv") ||
      a.content_type === "text/csv" ||
      a.content_type === "text/plain"
  );
  if (!csvMeta) return null;

  let downloadUrl = csvMeta.download_url;
  if (!downloadUrl) {
    const res = await fetch(
      `https://api.resend.com/emails/receiving/${emailId}/attachments`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const { data } = await res.json() as { data: ResendAttachmentMeta[] };
    const found = data.find((a) => a.id === csvMeta.id);
    downloadUrl = found?.download_url;
  }

  if (!downloadUrl) return null;

  const dlRes = await fetch(downloadUrl);
  return dlRes.text();
}

// --- DB Helpers ---

async function upsertClients(
  db: SupabaseClient,
  profileId: string,
  rows: Omit<ClientRow, "profile_id">[]
): Promise<{ inserted: number; errorCount: number }> {
  const validRows: ClientRow[] = rows.map((r) => ({ ...r, profile_id: profileId }));
  const BATCH = 100;
  let inserted = 0;
  let errorCount = 0;

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH);
    const { data, error } = await db
      .from("clients")
      .upsert(batch, { onConflict: "profile_id,telephone", ignoreDuplicates: false })
      .select("id");
    if (error) errorCount += batch.length;
    else inserted += data?.length ?? 0;
  }

  return { inserted, errorCount };
}

async function logSync(
  db: SupabaseClient,
  profileId: string,
  statut: string,
  clientsAjoutes: number,
  clientsEnErreur: number,
  messageErreur: string | null
) {
  await db.from("sync_logs").insert({
    profile_id: profileId,
    source: "email",
    statut,
    clients_ajoutes: clientsAjoutes,
    clients_en_erreur: clientsEnErreur,
    message_erreur: messageErreur,
  });
}

async function sendConfirmationEmail(
  to: string,
  inserted: number,
  errorCount: number,
  resendApiKey: string,
  fromEmail: string
) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#1e293b;margin-bottom:8px;">Synchronisation clients effectuée</h2>
      <p style="color:#475569;">Votre base de données a été mise à jour automatiquement via Baobab Loyalty.</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #e2e8f0;">
        <p style="margin:0;color:#334155;font-size:16px;">
          <strong>${inserted}</strong> client(s) ajouté(s) ou mis à jour
          ${errorCount > 0 ? `<br/><span style="color:#dc2626;font-size:14px;">${errorCount} ligne(s) ignorée(s)</span>` : ""}
        </p>
      </div>
      <p style="color:#94a3b8;font-size:12px;">Baobab Loyalty — Synchronisation automatique par email</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: `Baobab Loyalty — ${inserted} client(s) synchronisé(s)`,
      html,
    }),
  });
}

// --- Handler principal ---

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await req.json() as {
      type?: string;
      data?: {
        email_id?: string;
        to?: string[];
        attachments?: ResendAttachmentMeta[];
      };
    };

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return errors.internal("RESEND_API_KEY manquante");

    const emailId = body.data?.email_id;
    if (!emailId) return errors.badRequest("email_id manquant dans le payload");

    const webhookTo = body.data?.to ?? [];
    const webhookAttachments: ResendAttachmentMeta[] = body.data?.attachments ?? [];

    const { text: emailText, to: fullTo } = await fetchEmailFull(emailId, resendApiKey);
    const toAddresses = fullTo.length > 0 ? fullTo : webhookTo;

    const profileId = extractProfileId(toAddresses);
    if (!profileId) return errors.badRequest("Format destinataire invalide. Attendu: sync+{profileId}@...");

    const db = getServiceClient();

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, email_principal")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) return errors.notFound("Profil introuvable");

    let csvText = "";

    if (webhookAttachments.length > 0) {
      csvText = (await fetchCsvFromAttachments(emailId, resendApiKey, webhookAttachments)) ?? "";
    }

    if (!csvText && (emailText.includes(",") || emailText.includes(";"))) {
      csvText = emailText;
    }

    if (!csvText) {
      await logSync(db, profileId, "error", 0, 0, "Aucun fichier CSV trouvé");
      return errors.badRequest("Aucun fichier CSV trouvé");
    }

    const rows = parseCsvRows(csvText);
    if (rows.length === 0) {
      await logSync(db, profileId, "error", 0, 0, "CSV vide ou format non reconnu");
      return errors.badRequest("CSV vide ou format non reconnu");
    }

    const { inserted, errorCount } = await upsertClients(db, profileId, rows);
    await logSync(db, profileId, "success", inserted, errorCount, null);

    const fromEmail = Deno.env.get("EMAIL_FROM") ?? "Baobab Loyalty <noreply@baobab-loyalty.com>";
    if (profile.email_principal) {
      await sendConfirmationEmail(profile.email_principal, inserted, errorCount, resendApiKey, fromEmail);
    }

    return success({ profileId, inserted, errors: errorCount });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
