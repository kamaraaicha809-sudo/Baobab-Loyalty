/**
 * Historique des actions sensibles (R6) — écrit dans audit_log via le
 * service client. N'échoue jamais bruyamment : un problème d'écriture de
 * l'audit ne doit jamais faire échouer l'action métier elle-même.
 */

import type { SupabaseClient } from "./deps.ts";

export interface LogAuditParams {
  profileId: string;
  actorUserId: string | null;
  action: string;
  details?: Record<string, unknown> | null;
}

export async function logAudit(serviceClient: SupabaseClient, params: LogAuditParams): Promise<void> {
  try {
    await serviceClient.from("audit_log").insert({
      profile_id: params.profileId,
      actor_user_id: params.actorUserId,
      action: params.action,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error("audit log write failed:", err);
  }
}
