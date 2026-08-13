/**
 * team-invite
 * Invites a team member to the caller's hotel (Premium plan only, 2 max)
 *
 * Auth: Required (owner or admin team role)
 * Method: POST
 * Body: { email, teamRole?: "admin" | "member" }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile, MAX_TEAM_MEMBERS } from "../_shared/team.ts";

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
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const teamRole = body.teamRole === "admin" ? "admin" : "member";

    if (!email || !email.includes("@")) {
      return errors.badRequest("Email invalide.");
    }

    const { profile, teamRole: callerRole } = await resolveProfile<{
      id: string;
      price_id: string | null;
      hotel_name: string | null;
    }>(userClient, user.id, "id, price_id, hotel_name");

    if (!profile) return errors.forbidden("Profil introuvable.");
    if (callerRole !== "owner" && callerRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut inviter un membre.");
    }
    if ((profile.price_id || "").toLowerCase() !== "premium") {
      return errors.forbidden("L'accès multi-utilisateurs est réservé au plan Premium.");
    }
    if (email === (user.email || "").toLowerCase()) {
      return errors.badRequest("Vous ne pouvez pas vous inviter vous-même.");
    }

    const serviceClient = getServiceClient();

    const { count: memberCount } = await serviceClient
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id);

    const { count: pendingCount } = await serviceClient
      .from("team_invitations")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("status", "pending");

    if ((memberCount || 0) + (pendingCount || 0) >= MAX_TEAM_MEMBERS) {
      return errors.forbidden(`Limite de ${MAX_TEAM_MEMBERS} membres invités atteinte pour le plan Premium.`);
    }

    const { data: invitation, error: insertError } = await serviceClient
      .from("team_invitations")
      .upsert(
        {
          profile_id: profile.id,
          email,
          team_role: teamRole,
          status: "pending",
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "profile_id,email" }
      )
      .select("id, token")
      .single();

    if (insertError || !invitation) {
      return errors.internal("Échec de la création de l'invitation.");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "https://baobabloyalty.com";
    const inviteUrl = `${siteUrl}/auth/accept-invite?token=${invitation.token}`;

    if (resendApiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Baobab Loyalty <noreply@baobabloyalty.com>",
          to: email,
          subject: `Invitation à rejoindre ${profile.hotel_name || "votre hôtel"} sur Baobab Loyalty`,
          html: `<p>Vous avez été invité(e) à rejoindre l'espace Baobab Loyalty de <strong>${profile.hotel_name || "votre hôtel"}</strong>.</p><p><a href="${inviteUrl}">Accepter l'invitation</a></p><p>Ce lien expire dans 7 jours.</p>`,
        }),
      });
    }

    return success({ invited: true, email, teamRole });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
