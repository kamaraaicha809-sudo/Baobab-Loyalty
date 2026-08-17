/**
 * Rate limiting pour les routes API publiques (sans authentification).
 * S'appuie sur la fonction SQL check_rate_limit() (migration 040), une
 * fenêtre glissante par clé stockée dans public.rate_limit_hits.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Extrait l'IP du client à partir des en-têtes de la requête (Vercel/proxy).
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Vérifie la limite de débit pour une clé donnée.
 * Retourne true si la requête est autorisée, false si la limite est atteinte.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,
  maxHits: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });

  // En cas d'erreur (ex: RPC indisponible), on laisse passer plutôt que de
  // bloquer un formulaire public légitime sur un problème d'infra.
  if (error) return true;
  return data === true;
}
