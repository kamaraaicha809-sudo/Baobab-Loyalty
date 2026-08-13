/**
 * SDK module for team (multi-user access, Premium plan)
 */

import { callEdgeFunction } from "./_core";

export interface TeamMember {
  id: string;
  user_id: string;
  team_role: "admin" | "member";
  email: string | null;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  team_role: "admin" | "member";
  status: "pending" | "accepted" | "revoked";
  expires_at: string;
  created_at: string;
}

export interface TeamListResponse {
  members: TeamMember[];
  invitations: TeamInvitation[];
  maxMembers: number;
  callerRole: "owner" | "admin" | "member" | null;
  pricePlan: string | null;
}

export interface InviteParams {
  email: string;
  teamRole?: "admin" | "member";
}

const list = async (): Promise<TeamListResponse> => {
  return callEdgeFunction<TeamListResponse>("team-list", {
    method: "GET",
    requireAuth: true,
  });
};

const invite = async (params: InviteParams): Promise<{ invited: boolean; email: string; teamRole: string }> => {
  return callEdgeFunction("team-invite", {
    method: "POST",
    body: params,
    requireAuth: true,
  });
};

const acceptInvite = async (token: string): Promise<{ joined: boolean; profileId: string; teamRole: string }> => {
  return callEdgeFunction("team-accept-invite", {
    method: "POST",
    body: { token },
    requireAuth: true,
  });
};

const removeMember = async (memberId: string): Promise<{ removed: boolean }> => {
  return callEdgeFunction("team-remove-member", {
    method: "POST",
    body: { memberId },
    requireAuth: true,
  });
};

const revokeInvitation = async (invitationId: string): Promise<{ removed: boolean }> => {
  return callEdgeFunction("team-remove-member", {
    method: "POST",
    body: { invitationId },
    requireAuth: true,
  });
};

export const team = {
  list,
  invite,
  acceptInvite,
  removeMember,
  revokeInvitation,
};
