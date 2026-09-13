/**
 * gdpr-rectify
 * Droit de rectification (Art. 16) : corrige nom/email/téléphone/whatsapp
 * d'un client. La modification est journalisée (quels champs ont changé),
 * jamais les valeurs elles-mêmes (pas de donnée personnelle inutile dans
 * audit_log).
 *
 * Auth: Required (owner/admin)
 * Method: POST
 * Body: { clientId, updates: { nom?, email?, telephone?, whatsapp? }, requestId? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

const ALLOWED_FIELDS = ["nom", "email", "telephone", "whatsapp"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const clientId = typeof body?.clientId === "string" ? body.clientId : "";
    const requestId = typeof body?.requestId === "string" ? body.requestId : null;
    const rawUpdates = body?.updates && typeof body.updates === "object" ? body.updates : {};
    if (!clientId) return errors.badRequest("clientId requis.");

    // deno-lint-ignore no-explicit-any
    const updates: Record<string, any> = {};
    for (const field of ALLOWED_FIELDS) {
      if (typeof rawUpdates[field] === "string") updates[field] = rawUpdates[field].trim();
    }
    if (Object.keys(updates).length === 0) return errors.badRequest("Aucun champ à corriger fourni.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut traiter une demande de rectification.");
    }

    const serviceClient = getServiceClient();
    const { data: client } = await serviceClient.from("clients").select("id").eq("id", clientId).eq("profile_id", profile.id).maybeSingle();
    if (!client) return errors.notFound("Client introuvable pour cet hôtel.");

    const { error } = await serviceClient.from("clients").update(updates).eq("id", clientId);
    if (error) return errors.internal(error.message);

    await logAudit(serviceClient, {
      profileId: profile.id,
      actorUserId: user.id,
      action: "gdpr_client_rectified",
      // Uniquement la LISTE des champs modifiés, jamais les valeurs (avant/après).
      details: { clientId, requestId, fieldsChanged: Object.keys(updates) },
    });

    if (requestId) {
      await serviceClient
        .from("data_subject_requests")
        .update({ status: "completed", completed_at: new Date().toISOString(), closed_at: new Date().toISOString(), actions_taken: `Champs corrigés : ${Object.keys(updates).join(", ")}` })
        .eq("id", requestId)
        .eq("profile_id", profile.id);
    }

    return success({ updated: true, fieldsChanged: Object.keys(updates) });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
