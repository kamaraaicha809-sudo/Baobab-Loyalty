/**
 * Plan tier helpers
 * price_id on the profile stores the plan slug (e.g. "starter", "pro", "premium")
 */

const PREMIUM_SLUGS = ["premium"];

export function isPremiumPlan(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return PREMIUM_SLUGS.includes(priceId.toLowerCase());
}
