/**
 * gdpr-restrict
 * Droit à la limitation du traitement (Art. 18) : un client sous limitation
 * ne doit plus être utilisé normalement (campagnes marketing incluses),
 * sans pour autant être supprimé du CRM. Voir aussi consent-policy.ts, qui
 * exclut désormais processing_restricted=true de toute campagne.
 *
 * Auth: Required (owner/admin)
 * Method: POST
 * Body: { clientId, restricted: boolean, requestId? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const clientId = typeof body?.clientId === "string" ? body.clientId : "";
    const restricted = typeof body?.restricted === "boolean" ? body.restricted : null;
    const requestId = typeof body?.requestId === "string" ? body.requestId : null;
    if (!clientId || restricted === null) return errors.badRequest("clientId et restricted sont requis.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut modifier la limitation du traitement.");
    }

    const serviceClient = getServiceClient();
    const { data: client } = await serviceClient.from("clients").select("id").eq("id", clientId).eq("profile_id", profile.id).maybeSingle();
    if (!client) return errors.notFound("Client introuvable pour cet hôtel.");

    const { error } = await serviceClient
      .from("clients")
      .update({ processing_restricted: restricted, processing_restricted_at: restricted ? new Date().toISOString() : null })
      .eq("id", clientId);
    if (error) return errors.internal(error.message);

    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: restricted ? "gdpr_processing_restricted" : "gdpr_processing_restriction_lifted",
      details: { clientId, requestId },
    });

    if (requestId) {
      await serviceClient
        .from("data_subject_requests")
        .update({ status: "completed", completed_at: new Date().toISOString(), closed_at: new Date().toISOString(), actions_taken: restricted ? "Traitement limité" : "Limitation levée" })
        .eq("id", requestId)
        .eq("profile_id", profile.id);
    }

    return success({ restricted });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
