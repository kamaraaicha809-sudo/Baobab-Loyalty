/**
 * Plan tier helpers
 * price_id on the profile stores the plan slug (e.g. "starter", "pro", "premium")
 */

const PREMIUM_SLUGS = ["premium"];

// Messages d'anniversaire automatiques : plan Pro et au-dessus (Afrique) ou
// Professional et au-dessus (Europe) — Starter exclu.
const BIRTHDAY_ACCESS_SLUGS = ["pro", "premium", "professional", "business"];

export function isPremiumPlan(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return PREMIUM_SLUGS.includes(priceId.toLowerCase());
}

export function hasBirthdayAccess(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return BIRTHDAY_ACCESS_SLUGS.includes(priceId.toLowerCase());
}
