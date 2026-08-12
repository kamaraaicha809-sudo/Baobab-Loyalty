/**
 * Plan quota helpers shared across Edge Functions
 * price_id on the profile stores the plan slug (e.g. "starter", "pro", "premium")
 *
 * Une "relance" = une campagne WhatsApp envoyée (peu importe la taille du
 * segment ciblé). Quota mensuel, non reporté d'un mois à l'autre — voir
 * config.js (billing.plans[].monthlyRelances) pour les valeurs affichées
 * côté marketing, qui doivent rester synchronisées avec cette table.
 */

import { hasActiveAccess } from "./access.ts";

const MONTHLY_RELANCE_QUOTAS: Record<string, number> = {
  starter: 5,
  pro: 10,
  premium: 20,
  // Anciens slugs, conservés pour les comptes créés avant le renommage
  essentiel: 5,
  croissance: 10,
};

export function getMonthlyRelanceQuota(profile: {
  price_id?: string | null;
  has_access?: boolean | null;
  trial_ends_at?: string | null;
}): number {
  const slug = profile.price_id?.toLowerCase();
  if (slug && MONTHLY_RELANCE_QUOTAS[slug] != null) {
    return MONTHLY_RELANCE_QUOTAS[slug];
  }
  // Pas encore de plan payant : quota Pro pendant l'essai gratuit
  // (20 réservé aux comptes qui payent réellement le plan Premium), sinon aucun accès.
  return hasActiveAccess(profile) ? MONTHLY_RELANCE_QUOTAS.pro : 0;
}

export function startOfCurrentMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}
