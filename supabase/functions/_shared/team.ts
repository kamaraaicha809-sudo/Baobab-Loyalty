/**
 * Team resolution helpers for Edge Functions
 *
 * profiles.id used to always equal auth.users.id (1-pour-1). Since the
 * multi-user feature, a user can also access a profile as an invited
 * team_members row. resolveProfile() centralizes that lookup so Edge
 * Functions stop assuming "the profile" is just `.eq("id", user.id)`.
 */

import type { SupabaseClient } from "./deps.ts";

// Doit rester synchronisé avec config.js (billing.plans[premium].maxTeamMembers)
export const MAX_TEAM_MEMBERS = 2;

export type TeamRole = "owner" | "admin" | "member";

export interface ResolvedProfile<T = Record<string, unknown>> {
  profile: T | null;
  teamRole: TeamRole | null;
}

export async function resolveProfile<T = Record<string, unknown>>(
  userClient: SupabaseClient,
  userId: string,
  select = "*"
): Promise<ResolvedProfile<T>> {
  const { data: owned } = await userClient
    .from("profiles")
    .select(select)
    .eq("id", userId)
    .maybeSingle();

  if (owned) return { profile: owned as T, teamRole: "owner" };

  const { data: membership } = await userClient
    .from("team_members")
    .select("profile_id, team_role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return { profile: null, teamRole: null };

  const { data: profile } = await userClient
    .from("profiles")
    .select(select)
    .eq("id", membership.profile_id)
    .maybeSingle();

  return { profile: profile as T | null, teamRole: membership.team_role as TeamRole };
}
