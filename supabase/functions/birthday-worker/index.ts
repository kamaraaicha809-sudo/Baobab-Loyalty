/**
 * birthday-worker
 * Envoie automatiquement un message WhatsApp d'anniversaire aux clients dont
 * c'est le jour, pour chaque hôtel ayant activé l'automatisation.
 *
 * Déclenché par pg_cron une fois par jour (migration 057). Réutilise le
 * template WhatsApp déjà approuvé "baobab_offre_hotel" (2 paramètres :
 * prénom, corps du message) — aucune nouvelle validation Meta/360dialog
 * n'est nécessaire, seul le texte injecté change.
 *
 * Auth: secret partagé x-birthday-worker-secret (pas de JWT, appel interne uniquement).
 * Method: POST
 */

import { getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { logAudit } from "../_shared/audit.ts";
import { filterConsentedClients, isClientStillConsented } from "../_shared/consent-policy.ts";
import { buildUnsubscribeSuffix, formatE164, sendViaBsp, sendViaMeta } from "../_shared/whatsapp-send.ts";
import { renderBirthdayMessage } from "../_shared/birthday-templates.ts";

interface BirthdayProfile {
  id: string;
  hotel_name: string | null;
  birthday_template_key: string;
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token: string | null;
  bsp_api_key: string | null;
  bsp_status: string | null;
}

interface BirthdayClient {
  id: string;
  nom: string;
  whatsapp: string | null;
  telephone: string | null;
  date_naissance: string;
  last_birthday_sent_year: number | null;
  marketing_consent: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  const workerSecret = Deno.env.get("BIRTHDAY_WORKER_SECRET");
  if (!workerSecret || req.headers.get("x-birthday-worker-secret") !== workerSecret) {
    return errors.unauthorized("Secret worker invalide ou manquant");
  }

  try {
    const db = getServiceClient();
    const now = new Date();
    const todayMonth = now.getUTCMonth() + 1;
    const todayDay = now.getUTCDate();
    const currentYear = now.getUTCFullYear();

    const { data: profiles, error: profilesError } = await db
      .from("profiles")
      .select("id, hotel_name, birthday_template_key, whatsapp_phone_number_id, whatsapp_access_token, bsp_api_key, bsp_status")
      .eq("birthday_automation_enabled", true);

    if (profilesError) return errors.internal(profilesError.message);

    let processedProfiles = 0;
    let totalSent = 0;
    let totalFailed = 0;

    for (const profile of (profiles ?? []) as BirthdayProfile[]) {
      const hasBsp = profile.bsp_api_key && profile.bsp_status === "active";
      const hasMeta = profile.whatsapp_phone_number_id && profile.whatsapp_access_token;
      if (!hasBsp && !hasMeta) continue;

      const { data: allClients, error: clientsError } = await db
        .from("clients")
        .select("id, nom, whatsapp, telephone, date_naissance, last_birthday_sent_year, marketing_consent")
        .eq("profile_id", profile.id)
        .not("date_naissance", "is", null);

      if (clientsError) continue;

      const birthdayClients = (allClients ?? []).filter((c: BirthdayClient) => {
        const d = new Date(c.date_naissance);
        return (
          d.getUTCMonth() + 1 === todayMonth &&
          d.getUTCDate() === todayDay &&
          c.last_birthday_sent_year !== currentYear
        );
      });

      if (birthdayClients.length === 0) continue;

      const { eligible: targets } = await filterConsentedClients(db, birthdayClients, "whatsapp");
      if (targets.length === 0) continue;

      const hotelName = profile.hotel_name || "notre hôtel";

      const { data: campaign } = await db
        .from("campaigns")
        .insert({
          profile_id: profile.id,
          name: `Anniversaires — ${now.toLocaleDateString("fr-FR")}`,
          segment_code: "anniversaire",
          campaign_type: "birthday",
          status: "sending",
          recipient_count: targets.length,
        })
        .select("id")
        .single();

      const campaignId = campaign?.id ?? null;

      let sent = 0;
      let failed = 0;

      try {
        for (const client of targets) {
          const stillConsented = await isClientStillConsented(db, client, "whatsapp");
          if (!stillConsented) {
            failed++;
            continue;
          }

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
              profile_id: profile.id,
              channel: "whatsapp",
              message_content: "",
              template_id: profile.birthday_template_key,
              status: "failed",
              error_message: "Numéro de téléphone invalide",
              failed_at: new Date().toISOString(),
            });
            continue;
          }

          const firstName = client.nom.split(" ")[0];
          const personalizedMessage =
            renderBirthdayMessage(profile.birthday_template_key, firstName, hotelName) +
            buildUnsubscribeSuffix(client.id);

          const result = hasBsp
            ? await sendViaBsp(profile.bsp_api_key!, e164, client.nom, "baobab_offre_hotel", personalizedMessage)
            : await sendViaMeta(profile.whatsapp_phone_number_id!, profile.whatsapp_access_token!, e164, client.nom, "baobab_offre_hotel", personalizedMessage);

          await db.from("sent_messages").insert({
            campaign_id: campaignId,
            client_id: client.id,
            profile_id: profile.id,
            channel: "whatsapp",
            message_content: personalizedMessage,
            template_id: profile.birthday_template_key,
            status: result.ok ? "sent" : "failed",
            provider_message_id: result.providerMessageId || null,
            error_code: result.errorCode || null,
            error_message: result.errorMsg || null,
            failed_at: result.ok ? null : new Date().toISOString(),
          });

          if (result.ok) {
            sent++;
            await db.from("clients").update({ last_birthday_sent_year: currentYear }).eq("id", client.id);
          } else {
            failed++;
          }
        }
      } finally {
        if (campaignId) {
          const status = failed === 0 ? "completed" : sent === 0 ? "failed" : "completed_with_errors";
          await db.from("campaigns").update({ status, ended_at: new Date().toISOString() }).eq("id", campaignId);
        }
      }

      await logAudit(db, {
        profileId: profile.id,
        actorUserId: null,
        action: "birthday_message_sent",
        details: { sent, failed, total: targets.length, templateKey: profile.birthday_template_key },
      });

      processedProfiles++;
      totalSent += sent;
      totalFailed += failed;
    }

    return success({ processedProfiles, totalSent, totalFailed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(msg);
  }
});
