/**
 * Rate limiting pour les Edge Functions (miroir de libs/rate-limit.ts côté
 * frontend). S'appuie sur check_rate_limit() (migration 040), réservée au
 * service_role.
 */

import type { SupabaseClient } from "./deps.ts";

export async function checkRateLimit(
  serviceClient: SupabaseClient,
  key: string,
  maxHits: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await serviceClient.rpc("check_rate_limit", {
    p_key: key,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });

  // En cas d'erreur (ex: RPC indisponible), on laisse passer plutôt que de
  // bloquer une fonctionnalité payante sur un problème d'infra.
  if (error) return true;
  return data === true;
}
