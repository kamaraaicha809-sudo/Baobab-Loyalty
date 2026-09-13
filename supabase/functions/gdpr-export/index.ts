/**
 * gdpr-export
 * Droit d'accès (Art. 15) et de portabilité (Art. 20) : rassemble toutes les
 * données d'un client (profil CRM, consentements, préférences, historique de
 * campagnes, réservations liées) et produit un export JSON + CSV.
 *
 * Auth: Required (owner/admin). RLS + vérification explicite du profile_id
 * garantissent qu'un hôtel ne peut jamais exporter les données d'un autre.
 *
 * Method: POST
 * Body: { clientId: string, requestId?: string }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const clientId = typeof body?.clientId === "string" ? body.clientId : "";
    const requestId = typeof body?.requestId === "string" ? body.requestId : null;
    if (!clientId) return errors.badRequest("clientId requis.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut exporter les données d'un client.");
    }

    const serviceClient = getServiceClient();

    // Vérification explicite d'appartenance en plus de RLS : un export est
    // une action sensible, elle ne doit jamais dépendre uniquement d'une
    // policy — voir aussi la même double vérification dans anonymize_or_erase_client().
    const { data: client, error: clientError } = await serviceClient
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (clientError) return errors.internal(clientError.message);
    if (!client) return errors.notFound("Client introuvable pour cet hôtel.");

    const [preferences, consentRecords, consentLog, sentMessages, reservations, redemptions] = await Promise.all([
      serviceClient.from("communication_preferences").select("channel, opted_in, updated_at").eq("client_id", clientId),
      serviceClient.from("consent_records").select("channel, action, method, policy_version, original_consent_date, created_at").eq("client_id", clientId),
      serviceClient.from("consent_log").select("channel, previous_state, new_state, source, created_at").eq("client_id", clientId),
      serviceClient.from("sent_messages").select("channel, status, sent_at, template_id, campaign_id").eq("client_id", clientId),
      serviceClient.from("reservations").select("check_in_date, check_out_date, number_of_rooms, created_at").eq("client_id", clientId),
      serviceClient.from("redemptions").select("status, redemption_date").eq("client_id", clientId),
    ]);

    const exportPayload = {
      generated_at: new Date().toISOString(),
      client_profile: client,
      communication_preferences: preferences.data ?? [],
      consent_records: consentRecords.data ?? [],
      consent_log: consentLog.data ?? [],
      campaign_history: sentMessages.data ?? [],
      reservations: reservations.data ?? [],
      redemptions: redemptions.data ?? [],
    };

    const csv = toCSV([
      {
        id: client.id,
        nom: client.nom,
        email: client.email,
        telephone: client.telephone,
        whatsapp: client.whatsapp,
        derniere_visite: client.derniere_visite,
        marketing_consent: client.marketing_consent,
        anonymized: client.anonymized,
        processing_restricted: client.processing_restricted,
      },
    ]);

    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: "gdpr_export_generated",
      // Uniquement des identifiants techniques, jamais les données exportées.
      details: { clientId, requestId },
    });

    if (requestId) {
      await serviceClient
        .from("data_subject_requests")
        .update({ status: "completed", completed_at: new Date().toISOString(), closed_at: new Date().toISOString(), actions_taken: "Export généré (JSON + CSV)" })
        .eq("id", requestId)
        .eq("profile_id", profile.id);
    }

    return success({ json: exportPayload, csv });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
