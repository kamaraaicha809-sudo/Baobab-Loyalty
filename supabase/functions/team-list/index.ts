/**
 * team-list
 * Returns team members + pending invitations for the caller's hotel
 *
 * Auth: Required (owner or team member)
 * Method: GET
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile, MAX_TEAM_MEMBERS } from "../_shared/team.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) {
      return success({
        members: [
          {
            id: "demo-member-1",
            user_id: "demo-member-1",
            team_role: "member",
            email: "collegue@hotel-baobab.sn",
            created_at: new Date().toISOString(),
          },
        ],
        invitations: [],
        maxMembers: MAX_TEAM_MEMBERS,
        callerRole: "owner",
        pricePlan: "premium",
      });
    }

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const { profile, teamRole: callerRole } = await resolveProfile<{
      id: string;
      price_id: string | null;
    }>(userClient, user.id, "id, price_id");

    if (!profile) return errors.forbidden("Profil introuvable.");

    const { data: members } = await userClient
      .from("team_members")
      .select("id, user_id, team_role, created_at")
      .eq("profile_id", profile.id);

    const { data: invitations } = await userClient
      .from("team_invitations")
      .select("id, email, team_role, status, expires_at, created_at")
      .eq("profile_id", profile.id)
      .eq("status", "pending");

    const serviceClient = getServiceClient();
    const membersWithEmail = await Promise.all(
      (members || []).map(async (m) => {
        const { data } = await serviceClient.auth.admin.getUserById(m.user_id);
        return { ...m, email: data?.user?.email || null };
      })
    );

    return success({
      members: membersWithEmail,
      invitations: invitations || [],
      maxMembers: MAX_TEAM_MEMBERS,
      callerRole,
      pricePlan: profile.price_id,
    });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
