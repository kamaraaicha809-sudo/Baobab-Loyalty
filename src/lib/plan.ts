/**
 * Plan tier helpers
 * price_id on the profile stores the plan slug (e.g. "starter", "pro", "premium"
 * pour l'Afrique ; "starter", "professional", "business" pour l'Europe)
 */

const PREMIUM_SLUGS = ["premium"];

// IA personnalisée : plan Premium (Afrique) ou Business (Europe).
const PERSONALIZED_AI_SLUGS = ["premium", "business"];

// Messages d'anniversaire automatiques : plan Pro et au-dessus (Afrique,
// voir commit 8e0f189) ou Professional et au-dessus (Europe) -- Starter
// exclu dans les deux régions. Aucune branche isEurope nécessaire : les
// slugs des deux régions ne se recoupent jamais.
const BIRTHDAY_ACCESS_SLUGS = ["pro", "premium", "professional", "business"];

export function isPremiumPlan(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return PREMIUM_SLUGS.includes(priceId.toLowerCase());
}

export function hasPersonalizedAiAccess(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return PERSONALIZED_AI_SLUGS.includes(priceId.toLowerCase());
}

export function hasBirthdayAccess(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return BIRTHDAY_ACCESS_SLUGS.includes(priceId.toLowerCase());
}
