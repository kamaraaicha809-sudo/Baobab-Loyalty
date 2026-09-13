/**
 * gdpr-request-create
 * Enregistre une nouvelle demande RGPD (Art. 15-21) dans le registre
 * data_subject_requests. due_at est calculé automatiquement (1 mois,
 * Art. 12.3) par un trigger côté base.
 *
 * Auth: Required (owner/admin)
 * Method: POST
 * Body: { requesterEmail, requestType, clientId? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

const REQUEST_TYPES = ["access", "rectification", "erasure", "portability", "restriction", "objection"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const requesterEmail = typeof body?.requesterEmail === "string" ? body.requesterEmail.trim() : "";
    const requestType = typeof body?.requestType === "string" ? body.requestType : "";
    const clientId = typeof body?.clientId === "string" ? body.clientId : null;

    if (!requesterEmail) return errors.badRequest("L'email du demandeur est requis.");
    if (!REQUEST_TYPES.includes(requestType)) return errors.badRequest("Type de demande invalide.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut enregistrer une demande RGPD.");
    }

    if (clientId) {
      const { data: client } = await userClient.from("clients").select("id").eq("id", clientId).eq("profile_id", profile.id).maybeSingle();
      if (!client) return errors.badRequest("Client introuvable pour cet hôtel.");
    }

    const serviceClient = getServiceClient();
    const { data, error } = await serviceClient
      .from("data_subject_requests")
      .insert({
        profile_id: profile.id,
        client_id: clientId,
        requester_email: requesterEmail,
        request_type: requestType,
      })
      .select("id, status, due_at")
      .single();

    if (error) return errors.internal(error.message);

    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: "gdpr_request_created",
      details: { requestId: data.id, requestType },
    });

    return success(data);
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
