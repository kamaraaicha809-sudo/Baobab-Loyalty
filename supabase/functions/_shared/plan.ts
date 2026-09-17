/**
 * Plan quota helpers shared across Edge Functions
 * price_id on the profile stores the plan slug (e.g. "starter", "pro", "premium")
 *
 * Une "relance" = une campagne WhatsApp envoyée (peu importe la taille du
 * segment ciblé). Quota mensuel, non reporté d'un mois à l'autre — voir
 * config.js (billing.plans[].monthlyRelances pour l'Afrique,
 * billing.plansEurope[].monthlyRelances pour l'Europe) pour les valeurs
 * affichées côté marketing, qui doivent rester synchronisées avec ces tables.
 */

import { hasActiveAccess } from "./access.ts";

// Le slug "starter" est partagé entre Afrique et Europe (voir config.js
// billing.plans / billing.plansEurope) mais leurs quotas divergent depuis le
// 17/09/2026 : deux tables distinctes, sélectionnées via APP_BRAND (secret
// Vault Europe uniquement, même convention que email-send/contact-send).
const MONTHLY_RELANCE_QUOTAS_AFRICA: Record<string, number> = {
  starter: 5,
  pro: 10,
  premium: 30,
  // Anciens slugs, conservés pour les comptes créés avant le renommage
  essentiel: 5,
  croissance: 10,
};

const MONTHLY_RELANCE_QUOTAS_EUROPE: Record<string, number> = {
  starter: 8,
  professional: 16,
  business: 32,
};

/**
 * Prix FCFA par plan — source de vérité unique côté serveur.
 * Doit rester synchronisé avec config.js (billing.plans), qui n'est pas
 * importable depuis une Edge Function Deno (fichier frontend).
 * Utilisé pour recalculer le montant du checkout côté serveur : on ne fait
 * jamais confiance au montant envoyé par le client.
 */
export const PLAN_PRICES_XOF: Record<string, number> = {
  starter: 39000,
  pro: 69000,
  premium: 189000,
};

/**
 * Frais d'integration unique (digitalisation cahier papier + registre
 * numerique) - voir config.js (billing.onboardingFee), qui doit rester
 * synchronise avec cette valeur pour l'affichage cote marketing.
 * Ce n'est pas un plan d'abonnement : paiement one-time, jamais recurrent.
 */
export const ONBOARDING_FEE_XOF = 49000;

export function getMonthlyRelanceQuota(profile: {
  price_id?: string | null;
  has_access?: boolean | null;
  access_until?: string | null;
  trial_ends_at?: string | null;
}): number {
  const isEurope = !!Deno.env.get("APP_BRAND");
  const quotas = isEurope ? MONTHLY_RELANCE_QUOTAS_EUROPE : MONTHLY_RELANCE_QUOTAS_AFRICA;
  const slug = profile.price_id?.toLowerCase();
  if (slug && quotas[slug] != null) {
    return quotas[slug];
  }
  // Pas encore de plan payant : quota du plan intermédiaire pendant l'essai
  // gratuit (Pro en Afrique, Professional en Europe), sinon aucun accès.
  if (!hasActiveAccess(profile)) return 0;
  return isEurope ? MONTHLY_RELANCE_QUOTAS_EUROPE.professional : MONTHLY_RELANCE_QUOTAS_AFRICA.pro;
}

export function startOfCurrentMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}
