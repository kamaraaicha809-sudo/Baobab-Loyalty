/**
 * gdpr-oppose
 * Droit d'opposition aux communications marketing (Art. 21) : retire le
 * consentement sur TOUS les canaux marketing d'un coup. Important :
 * opposition marketing ≠ suppression du compte — le client reste dans le
 * CRM, seulement inéligible aux campagnes (voir set_communication_preference,
 * qui journalise chaque canal individuellement pour la preuve).
 *
 * Auth: Required (owner/admin)
 * Method: POST
 * Body: { clientId, requestId? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

const CHANNELS = ["whatsapp", "email", "sms"] as const;

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
      return errors.forbidden("Seul le propriétaire ou un administrateur peut traiter un droit d'opposition.");
    }

    const serviceClient = getServiceClient();
    const { data: client } = await serviceClient.from("clients").select("id").eq("id", clientId).eq("profile_id", profile.id).maybeSingle();
    if (!client) return errors.notFound("Client introuvable pour cet hôtel.");

    for (const channel of CHANNELS) {
      const { error } = await serviceClient.rpc("set_communication_preference", {
        p_profile_id: profile.id,
        p_client_id: clientId,
        p_channel: channel,
        p_opted_in: false,
        p_method: "gdpr_objection",
        p_policy_version: null,
        p_ip: null,
        p_user_agent: null,
      });
      if (error) return errors.internal(error.message);
    }

    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: "gdpr_marketing_objection",
      details: { clientId, requestId, channels: CHANNELS },
    });

    if (requestId) {
      await serviceClient
        .from("data_subject_requests")
        .update({ status: "completed", completed_at: new Date().toISOString(), closed_at: new Date().toISOString(), actions_taken: "Opposition marketing appliquée sur tous les canaux" })
        .eq("id", requestId)
        .eq("profile_id", profile.id);
    }

    return success({ opposed: true, channels: CHANNELS });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
