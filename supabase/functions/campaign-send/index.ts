/**
 * campaign-send
 * Envoie des messages WhatsApp aux clients d'un segment via Meta Cloud API
 *
 * Auth: Required (JWT) — bypassed in DEMO_MODE
 * Method: POST
 * Body: { segmentCode, message, templateId, avantage?, customMonths?,
 *          minMontantDepense?, minNombreReservations?, typeChambreContains?, saisonContains? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { getMonthlyRelanceQuota, startOfCurrentMonthIso } from "../_shared/plan.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

interface Client {
  id: string;
  nom: string;
  whatsapp: string | null;
  telephone: string | null;
  derniere_visite: string;
  marketing_consent: boolean;
  nombre_reservations: number;
  montant_total_depense: number;
  type_chambre_preferee: string | null;
  saison_habituelle: string | null;
}

interface AdvancedFilters {
  minMontantDepense?: number;
  minNombreReservations?: number;
  typeChambreContains?: string;
  saisonContains?: string;
}

// Duplique src/sdk/clients.ts::matchesAdvancedFilters (pas d'import
// cross-runtime possible entre le frontend et une Edge Function Deno) —
// garder les deux synchronisées.
function clientMatchesAdvancedFilters(client: Client, filters: AdvancedFilters): boolean {
  if (filters.minMontantDepense != null && (client.montant_total_depense ?? 0) < filters.minMontantDepense) return false;
  if (filters.minNombreReservations != null && (client.nombre_reservations ?? 0) < filters.minNombreReservations) return false;
  if (filters.typeChambreContains?.trim()) {
    const needle = filters.typeChambreContains.trim().toLowerCase();
    if (!(client.type_chambre_preferee ?? "").toLowerCase().includes(needle)) return false;
  }
  if (filters.saisonContains?.trim()) {
    const needle = filters.saisonContains.trim().toLowerCase();
    if (!(client.saison_habituelle ?? "").toLowerCase().includes(needle)) return false;
  }
  return true;
}

// Lien de desinscription individuel ajoute a la fin de chaque message envoye
// (audit juridique 2026-08 : consentement/desinscription WhatsApp). L'UUID du
// client (122 bits aleatoires) sert de jeton non devinable, sans colonne
// dediee ni infrastructure de signature supplementaire.
function buildUnsubscribeSuffix(clientId: string): string {
  const siteUrl = Deno.env.get("SITE_URL") || "https://baobabloyalty.com";
  return `\n\nPour ne plus recevoir nos offres : ${siteUrl}/desinscription?c=${clientId}`;
}

function formatE164(raw: string): string | null {
  // Remove spaces and special chars except leading +
  let cleaned = raw.replace(/[\s\-().]/g, "");

  // "00" prefix → "+"
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }

  // Ensure starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // Keep only digits after +
  const digits = cleaned.slice(1).replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) return null;

  return "+" + digits;
}

function clientMatchesSegment(client: Client, segmentCode: string, customMonths?: number): boolean {
  const now = Date.now();
  const last = new Date(client.derniere_visite).getTime();
  if (isNaN(last)) return segmentCode === "tous";

  const daysDiff = (now - last) / (1000 * 60 * 60 * 24);

  if (segmentCode === "tous") return true;
  if (segmentCode === "3-6mois")  return daysDiff >= 90  && daysDiff < 180;
  if (segmentCode === "6-9mois")  return daysDiff >= 180 && daysDiff < 270;
  if (segmentCode === "9-12mois") return daysDiff >= 270 && daysDiff < 365;
  if (segmentCode === "1an+")     return daysDiff >= 365;

  // Segment personnalisé
  if (segmentCode.startsWith("custom-") && customMonths) {
    return daysDiff >= customMonths * 30;
  }

  return true;
}

// Extrait un message d'erreur lisible depuis une reponse d'echec Meta/360dialog.
// Les deux APIs renvoient un corps JSON de la forme { error: { message, code } }
// en cas de rejet (template refuse, numero invalide, quota depasse...). Si le
// corps n'est pas du JSON exploitable, on garde le texte brut (tronque).
function extractErrorInfo(rawBody: string): { code?: string; message: string } {
  try {
    const parsed = JSON.parse(rawBody);
    const apiError = parsed?.error;
    if (apiError?.message) {
      return {
        code: apiError.code !== undefined ? String(apiError.code) : undefined,
        message: String(apiError.error_data?.details || apiError.message).slice(0, 500),
      };
    }
  } catch {
    // Corps non-JSON, on retombe sur le texte brut ci-dessous
  }
  return { message: rawBody.slice(0, 500) || "Erreur inconnue du fournisseur WhatsApp" };
}

interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMsg?: string;
}

async function sendViaMeta(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  clientName: string,
  templateName: string,
  messageBody: string,
): Promise<SendResult> {
  try {
    const firstName = clientName.split(" ")[0];
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: "fr" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: firstName },
                  { type: "text", text: messageBody },
                ],
              },
            ],
          },
        }),
      },
    );

    const body = await res.text();

    if (!res.ok) {
      const { code, message } = extractErrorInfo(body);
      return { ok: false, errorCode: code, errorMsg: message };
    }

    let providerMessageId: string | undefined;
    try {
      providerMessageId = JSON.parse(body)?.messages?.[0]?.id;
    } catch {
      // Reponse succes non-JSON (improbable) : on garde providerMessageId undefined
    }

    return { ok: true, providerMessageId };
  } catch (err) {
    return { ok: false, errorMsg: err instanceof Error ? err.message : "Network error" };
  }
}

// BSP path: 360dialog v2 API
// Header: D360-API-KEY (not Bearer)
// Phone format: digits only, no + prefix
async function sendViaBsp(
  bspApiKey: string,
  to: string,
  clientName: string,
  templateName: string,
  messageBody: string,
): Promise<SendResult> {
  try {
    const firstName = clientName.split(" ")[0];
    // 360dialog v2 requires phone without + prefix
    const toDigits = to.startsWith("+") ? to.slice(1) : to;

    const res = await fetch("https://waba-v2.360dialog.io/messages", {
      method: "POST",
      headers: {
        "D360-API-KEY": bspApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toDigits,
        type: "template",
        template: {
          name: templateName,
          language: { code: "fr" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: messageBody },
              ],
            },
          ],
        },
      }),
    });

    const body = await res.text();

    if (!res.ok) {
      const { code, message } = extractErrorInfo(body);
      return { ok: false, errorCode: code, errorMsg: message };
    }

    let providerMessageId: string | undefined;
    try {
      providerMessageId = JSON.parse(body)?.messages?.[0]?.id;
    } catch {
      // Reponse succes non-JSON (improbable) : on garde providerMessageId undefined
    }

    return { ok: true, providerMessageId };
  } catch (err) {
    return { ok: false, errorMsg: err instanceof Error ? err.message : "Network error" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    let profileId: string;
    let actorUserId: string | null = null;

    if (isDemoMode) {
      profileId = "demo-user-id";
    } else {
      const { user, userClient, error: authError } = await requireAuth(req);
      if (authError || !user || !userClient) return errors.unauthorized(authError || "Auth required");

      const { profile } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
      if (!profile) return errors.forbidden("Profil introuvable.");
      profileId = profile.id;
      actorUserId = user.id;
    }

    const body = await req.json();
    const {
      segmentCode,
      message,
      templateId,
      avantage,
      customMonths,
      minMontantDepense,
      minNombreReservations,
      typeChambreContains,
      saisonContains,
    } = body;
    const advancedFilters: AdvancedFilters = {
      minMontantDepense: typeof minMontantDepense === "number" ? minMontantDepense : undefined,
      minNombreReservations: typeof minNombreReservations === "number" ? minNombreReservations : undefined,
      typeChambreContains: typeof typeChambreContains === "string" ? typeChambreContains : undefined,
      saisonContains: typeof saisonContains === "string" ? saisonContains : undefined,
    };

    if (!segmentCode || !message) {
      return errors.badRequest("segmentCode et message sont requis");
    }

    if (isDemoMode) {
      // Simulate success in demo mode
      await new Promise((r) => setTimeout(r, 1500));
      return success({ sent: 3, failed: 0, total: 3, campaignId: null });
    }

    const db = getServiceClient();

    // Fetch WhatsApp credentials — BSP path takes priority over legacy Meta direct path
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("whatsapp_phone_number_id, whatsapp_access_token, bsp_api_key, bsp_status, price_id, has_access, access_until, trial_ends_at")
      .eq("id", profileId)
      .single();

    if (profileError) return errors.internal(profileError.message);

    const hasBsp = profile?.bsp_api_key && profile?.bsp_status === "active";
    const hasMeta = profile?.whatsapp_phone_number_id && profile?.whatsapp_access_token;

    if (!hasBsp && !hasMeta) {
      return errors.badRequest("WhatsApp non configuré. Rendez-vous dans Configuration pour connecter votre compte WhatsApp.");
    }

    // Quota mensuel de relances (une relance = une campagne envoyée), non reporté d'un mois à l'autre
    const relanceQuota = getMonthlyRelanceQuota(profile);
    const { count: relancesUsed, error: quotaError } = await db
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .gte("created_at", startOfCurrentMonthIso());

    if (quotaError) return errors.internal(quotaError.message);

    if ((relancesUsed ?? 0) >= relanceQuota) {
      return errors.badRequest(
        `Quota de campagnes WhatsApp atteint pour ce mois (${relanceQuota}/${relanceQuota}). Passez à un plan supérieur ou attendez le mois prochain.`
      );
    }

    // Fetch all clients for this profile
    const { data: allClients, error: clientsError } = await db
      .from("clients")
      .select(
        "id, nom, whatsapp, telephone, derniere_visite, marketing_consent, nombre_reservations, montant_total_depense, type_chambre_preferee, saison_habituelle"
      )
      .eq("profile_id", profileId);

    if (clientsError) return errors.internal(clientsError.message);

    const clients: Client[] = allClients || [];
    const segmentTargets = clients
      .filter((c) => clientMatchesSegment(c, segmentCode, customMonths))
      .filter((c) => clientMatchesAdvancedFilters(c, advancedFilters));

    // Un client peut correspondre au segment mais avoir demande a ne plus
    // recevoir de messages marketing (STOP recu via le webhook, ou opt-out
    // manuel) : on ne doit jamais lui envoyer une campagne, meme par erreur.
    const targets = segmentTargets.filter((c) => c.marketing_consent);
    const excludedOptOut = segmentTargets.length - targets.length;

    // Create campaign record (map custom segments to "tous")
    const dbSegmentCode = ["3-6mois", "6-9mois", "9-12mois", "1an+", "tous"].includes(segmentCode)
      ? segmentCode
      : "tous";

    // Garde anti double-envoi : un double-clic ou un rafraîchissement de la
    // page d'envoi relance cette fonction depuis zéro. Sans ce contrôle, le
    // même segment est réenvoyé et consomme deux fois le quota mensuel.
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: recentDuplicate } = await db
      .from("campaigns")
      .select("id")
      .eq("profile_id", profileId)
      .eq("segment_code", dbSegmentCode)
      .eq("status", "sending")
      .gte("created_at", thirtySecondsAgo)
      .limit(1)
      .maybeSingle();

    if (recentDuplicate) {
      return errors.badRequest("Un envoi identique est déjà en cours. Patientez quelques instants avant de réessayer.");
    }

    const { data: campaign } = await db
      .from("campaigns")
      .insert({
        profile_id: profileId,
        name: `Campagne ${templateId || "whatsapp"} — ${new Date().toLocaleDateString("fr-FR")}`,
        segment_code: dbSegmentCode,
        status: "sending",
        recipient_count: targets.length,
      })
      .select("id")
      .single();

    const campaignId = campaign?.id ?? null;

    let sent = 0;
    let failed = 0;

    // Chaque sent_messages est inséré immédiatement (pas en un seul lot à la
    // fin) : si la fonction plante ou est tuée par un timeout au milieu de
    // l'envoi (beaucoup de destinataires), les messages déjà traités restent
    // journalisés au lieu d'être perdus.
    try {
      for (const client of targets) {
        const personalizedMessage = message + buildUnsubscribeSuffix(client.id);
        const rawNumber = client.whatsapp || client.telephone;
        if (!rawNumber) {
          failed++;
          continue;
        }

        const e164 = formatE164(rawNumber);
        if (!e164) {
          failed++;
          await db.from("sent_messages").insert({
            campaign_id: campaignId,
            client_id: client.id,
            profile_id: profileId,
            channel: "whatsapp",
            message_content: personalizedMessage,
            template_id: templateId || null,
            status: "failed",
            error_message: "Numéro de téléphone invalide",
            failed_at: new Date().toISOString(),
          });
          continue;
        }

        const result = hasBsp
          ? await sendViaBsp(
              profile.bsp_api_key!,
              e164,
              client.nom,
              "baobab_offre_hotel",
              personalizedMessage,
            )
          : await sendViaMeta(
              profile.whatsapp_phone_number_id!,
              profile.whatsapp_access_token!,
              e164,
              client.nom,
              "baobab_offre_hotel",
              personalizedMessage,
            );

        await db.from("sent_messages").insert({
          campaign_id: campaignId,
          client_id: client.id,
          profile_id: profileId,
          channel: "whatsapp",
          message_content: personalizedMessage,
          template_id: templateId || null,
          status: result.ok ? "sent" : "failed",
          provider_message_id: result.providerMessageId || null,
          error_code: result.errorCode || null,
          error_message: result.errorMsg || null,
          failed_at: result.ok ? null : new Date().toISOString(),
        });

        if (result.ok) {
          sent++;
        } else {
          failed++;
        }
      }
    } finally {
      // Toujours mettre à jour le statut de la campagne, même si la boucle
      // ci-dessus a été interrompue par une exception : une campagne ne doit
      // jamais rester bloquée sur "sending" indéfiniment. Le statut reflète
      // désormais un échec partiel plutôt que de dire "completed" quand la
      // majorité des envois a échoué.
      if (campaignId) {
        const status =
          failed === 0 ? "completed" : sent === 0 ? "failed" : "completed_with_errors";
        await db
          .from("campaigns")
          .update({ status, ended_at: new Date().toISOString() })
          .eq("id", campaignId);
      }
    }

    await logAudit(db, {
      profileId,
      actorUserId,
      action: "campaign_sent",
      details: { campaignId, segmentCode, sent, failed, total: targets.length },
    });

    return success({ sent, failed, total: targets.length, campaignId, excludedOptOut });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(msg);
  }
});
