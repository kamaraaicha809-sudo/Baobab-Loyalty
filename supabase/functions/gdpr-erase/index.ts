/**
 * gdpr-erase
 * Droit à l'effacement (Art. 17) : supprime complètement si rien à
 * préserver, sinon anonymise (voir anonymize_or_erase_client() en base —
 * jamais de suppression aveugle qui casserait les statistiques/l'historique
 * de campagnes d'un autre client).
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
      return errors.forbidden("Seul le propriétaire ou un administrateur peut traiter une demande d'effacement.");
    }

    const serviceClient = getServiceClient();
    const { data: result, error } = await serviceClient.rpc("anonymize_or_erase_client", {
      p_profile_id: profile.id,
      p_client_id: clientId,
    });
    if (error) return errors.internal(error.message);

    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: "gdpr_erasure",
      details: { clientId, requestId, result },
    });

    if (requestId) {
      await serviceClient
        .from("data_subject_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          closed_at: new Date().toISOString(),
          actions_taken: result === "deleted" ? "Client supprimé (aucune donnée liée à préserver)" : "Client anonymisé (données liées conservées pour les statistiques)",
        })
        .eq("id", requestId)
        .eq("profile_id", profile.id);
    }

    return success({ result });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
