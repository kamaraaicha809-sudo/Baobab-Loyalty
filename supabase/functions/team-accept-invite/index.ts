/**
 * team-accept-invite
 * Accepts a pending team invitation for the authenticated user
 *
 * Auth: Required (the invitee must already have a Baobab Loyalty account)
 * Method: POST
 * Body: { token }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Indisponible en mode démo.");

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    if (!token) return errors.badRequest("Token requis.");

    const serviceClient = getServiceClient();

    const { data: invitation } = await serviceClient
      .from("team_invitations")
      .select("id, profile_id, email, team_role, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!invitation) return errors.notFound("Invitation introuvable.");
    if (invitation.status !== "pending") {
      return errors.badRequest("Cette invitation n'est plus valide.");
    }
    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      return errors.badRequest("Cette invitation a expiré.");
    }
    if ((user.email || "").toLowerCase() !== invitation.email.toLowerCase()) {
      return errors.forbidden("Cette invitation a été envoyée à une autre adresse email.");
    }

    const { error: memberError } = await serviceClient
      .from("team_members")
      .upsert(
        { profile_id: invitation.profile_id, user_id: user.id, team_role: invitation.team_role },
        { onConflict: "profile_id,user_id" }
      );

    if (memberError) {
      if (memberError.code === "23505") {
        return errors.badRequest("Vous faites déjà partie d'une autre équipe. Un compte ne peut rejoindre qu'un seul hôtel.");
      }
      return errors.internal("Échec de l'ajout à l'équipe.");
    }

    await serviceClient
      .from("team_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    return success({ joined: true, profileId: invitation.profile_id, teamRole: invitation.team_role });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
