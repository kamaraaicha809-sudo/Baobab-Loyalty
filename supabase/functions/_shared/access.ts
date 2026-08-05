/**
 * Access helpers shared across Edge Functions
 * A profile has active access if it has paid (has_access) or its
 * 30-day trial (trial_ends_at) has not expired yet.
 */

export function hasActiveAccess(profile: {
  has_access?: boolean | null;
  trial_ends_at?: string | null;
}): boolean {
  if (profile.has_access) return true;
  if (!profile.trial_ends_at) return false;
  return new Date(profile.trial_ends_at).getTime() > Date.now();
}
