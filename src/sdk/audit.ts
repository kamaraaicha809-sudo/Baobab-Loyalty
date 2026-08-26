/**
 * Historique des actions sensibles (R6) — lecture seule, protégée par RLS
 * (is_team_admin, migration 052) : seuls le propriétaire et les membres
 * avec le rôle admin peuvent lire cette table. L'écriture se fait
 * uniquement depuis les Edge Functions via le service client.
 */

import { createClient } from "@/libs/supabase/client";

export interface AuditLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  reservation_confirmed: "Réservation confirmée",
  reservation_cancelled: "Réservation annulée",
  campaign_sent: "Campagne envoyée",
  team_member_removed: "Membre retiré de l'équipe",
  team_invitation_revoked: "Invitation annulée",
};

export function auditActionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}

export async function listAuditLog(profileId: string, limit = 50): Promise<AuditLogEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, action, details, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}

export const audit = { listAuditLog, auditActionLabel };
