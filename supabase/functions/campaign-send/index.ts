/**
 * campaign-send
 * Envoie des messages WhatsApp aux clients d'un segment via Meta Cloud API
 *
 * Auth: Required (JWT) — bypassed in DEMO_MODE
 * Method: POST
 * Body: { segmentCode, message, templateId, avantage?, customMonths? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

interface Client {
  id: string;
  nom: string;
  whatsapp: string | null;
  telephone: string | null;
  derniere_visite: string;
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
  if (segmentCode === "3mois") return daysDiff >= 90;
  if (segmentCode === "6mois") return daysDiff >= 180;
  if (segmentCode === "9mois") return daysDiff >= 270;

  // Custom segment
  if (segmentCode.startsWith("custom-") && customMonths) {
    return daysDiff >= customMonths * 30;
  }

  return true;
}

async function sendWhatsApp(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string,
): Promise<{ ok: boolean; errorMsg?: string }> {
  try {
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
          type: "text",
          text: { body: message, preview_url: false },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, errorMsg: body };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, errorMsg: err instanceof Error ? err.message : "Network error" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    let profileId: string;

    if (isDemoMode) {
      profileId = "demo-user-id";
    } else {
      const { user, error: authError } = await requireAuth(req);
      if (authError || !user) return errors.unauthorized(authError || "Auth required");
      profileId = user.id;
    }

    const body = await req.json();
    const { segmentCode, message, templateId, avantage, customMonths } = body;

    if (!segmentCode || !message) {
      return errors.badRequest("segmentCode et message sont requis");
    }

    if (isDemoMode) {
      // Simulate success in demo mode
      await new Promise((r) => setTimeout(r, 1500));
      return success({ sent: 3, failed: 0, total: 3, campaignId: null });
    }

    const db = getServiceClient();

    // Fetch WhatsApp credentials from the hotelier's profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("whatsapp_phone_number_id, whatsapp_access_token")
      .eq("id", profileId)
      .single();

    if (profileError) return errors.internal(profileError.message);

    const phoneNumberId = profile?.whatsapp_phone_number_id;
    const accessToken = profile?.whatsapp_access_token;

    if (!phoneNumberId || !accessToken) {
      return errors.badRequest("WhatsApp non configuré. Rendez-vous dans Configuration → WhatsApp Business API pour saisir vos identifiants.");
    }

    // Fetch all clients for this profile
    const { data: allClients, error: clientsError } = await db
      .from("clients")
      .select("id, nom, whatsapp, telephone, derniere_visite")
      .eq("profile_id", profileId);

    if (clientsError) return errors.internal(clientsError.message);

    const clients: Client[] = allClients || [];
    const targets = clients.filter((c) => clientMatchesSegment(c, segmentCode, customMonths));

    // Create campaign record (map custom segments to "tous")
    const dbSegmentCode = ["3mois", "6mois", "9mois", "tous"].includes(segmentCode)
      ? segmentCode
      : "tous";

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
    const sentRows: object[] = [];

    for (const client of targets) {
      const rawNumber = client.whatsapp || client.telephone;
      if (!rawNumber) {
        failed++;
        continue;
      }

      const e164 = formatE164(rawNumber);
      if (!e164) {
        failed++;
        sentRows.push({
          campaign_id: campaignId,
          client_id: client.id,
          profile_id: profileId,
          channel: "whatsapp",
          message_content: message,
          template_id: templateId || null,
          status: "failed",
        });
        continue;
      }

      const result = await sendWhatsApp(phoneNumberId, accessToken, e164, message);

      sentRows.push({
        campaign_id: campaignId,
        client_id: client.id,
        profile_id: profileId,
        channel: "whatsapp",
        message_content: message,
        template_id: templateId || null,
        status: result.ok ? "sent" : "failed",
      });

      if (result.ok) {
        sent++;
      } else {
        failed++;
      }
    }

    // Bulk insert sent_messages logs
    if (sentRows.length > 0) {
      await db.from("sent_messages").insert(sentRows);
    }

    // Update campaign status
    if (campaignId) {
      await db
        .from("campaigns")
        .update({
          status: failed === targets.length ? "failed" : "completed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", campaignId);
    }

    return success({ sent, failed, total: targets.length, campaignId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(msg);
  }
});
