/**
 * team-remove-member
 * Removes a team member or revokes a pending invitation
 *
 * Auth: Required (owner or admin team role)
 * Method: POST
 * Body: { memberId } or { invitationId }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Indisponible en mode démo.");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const body = await req.json();
    const memberId = typeof body.memberId === "string" ? body.memberId : null;
    const invitationId = typeof body.invitationId === "string" ? body.invitationId : null;
    if (!memberId && !invitationId) {
      return errors.badRequest("memberId ou invitationId requis.");
    }

    const { profile, teamRole: callerRole } = await resolveProfile<{ id: string }>(
      userClient,
      user.id,
      "id"
    );
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (callerRole !== "owner" && callerRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut retirer un membre.");
    }

    const serviceClient = getServiceClient();

    // Pas de fenêtre d'accès résiduelle aux données : is_team_member() (utilisée
    // par toutes les policies RLS) interroge team_members à chaque requête, donc
    // la suppression ci-dessous coupe l'accès aux données dès la ligne supprimée.
    // Seul le jeton JWT du membre retiré reste valide jusqu'à son expiration
    // (~1h, durée par défaut Supabase Auth) : il reste "connecté" mais toute
    // requête vers les données de cet hôtel renvoie déjà 0 résultat.
    if (memberId) {
      const { error } = await serviceClient
        .from("team_members")
        .delete()
        .eq("id", memberId)
        .eq("profile_id", profile.id);
      if (error) return errors.internal("Échec de la suppression du membre.");
    } else if (invitationId) {
      const { error } = await serviceClient
        .from("team_invitations")
        .update({ status: "revoked" })
        .eq("id", invitationId)
        .eq("profile_id", profile.id);
      if (error) return errors.internal("Échec de l'annulation de l'invitation.");
    }

    return success({ removed: true });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
