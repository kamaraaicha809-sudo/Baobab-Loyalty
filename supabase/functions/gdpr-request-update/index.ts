/**
 * gdpr-request-update
 * Fait progresser une demande RGPD dans son workflow (registre "RGPD →
 * Demandes") : vérification d'identité, statut, responsable assigné,
 * actions effectuées, justification, clôture.
 *
 * Auth: Required (owner/admin)
 * Method: POST
 * Body: {
 *   requestId: string,
 *   status?: "received"|"identity_verification"|"in_progress"|"completed"|"rejected"|"partially_completed",
 *   assignedTo?: string,
 *   actionsTaken?: string,
 *   justification?: string,
 *   verifyIdentity?: { method: string },
 * }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "partially_completed"];
const CLOSED_STATUSES = ["completed", "rejected", "partially_completed"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const requestId = typeof body?.requestId === "string" ? body.requestId : "";
    if (!requestId) return errors.badRequest("requestId requis.");
    if (body.status !== undefined && !STATUSES.includes(body.status)) return errors.badRequest("Statut invalide.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut traiter une demande RGPD.");
    }

    const { data: existing } = await userClient
      .from("data_subject_requests")
      .select("id, status")
      .eq("id", requestId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!existing) return errors.notFound("Demande introuvable pour cet hôtel.");

    // deno-lint-ignore no-explicit-any
    const updates: Record<string, any> = {};
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.assignedTo === "string") updates.assigned_to = body.assignedTo;
    if (typeof body.actionsTaken === "string") updates.actions_taken = body.actionsTaken;
    if (typeof body.justification === "string") updates.justification = body.justification;
    if (body.verifyIdentity?.method) {
      updates.identity_verified_at = new Date().toISOString();
      updates.identity_verification_method = String(body.verifyIdentity.method);
    }
    if (updates.status && CLOSED_STATUSES.includes(updates.status)) {
      updates.closed_at = new Date().toISOString();
      if (updates.status === "completed") updates.completed_at = new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) return errors.badRequest("Aucune modification fournie.");

    const serviceClient = getServiceClient();
    const { data, error } = await serviceClient
      .from("data_subject_requests")
      .update(updates)
      .eq("id", requestId)
      .select("id, status, closed_at")
      .single();

    if (error) return errors.internal(error.message);

    // Le detail de log ne contient que le statut/etapes du workflow, jamais
    // de donnee personnelle du demandeur (email, nom...).
    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: "gdpr_request_updated",
      details: { requestId, newStatus: updates.status ?? existing.status },
    });

    return success(data);
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
