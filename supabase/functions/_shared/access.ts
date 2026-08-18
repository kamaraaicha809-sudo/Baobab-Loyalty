/**
 * Access helpers shared across Edge Functions
 * A profile has active access if it has paid for the current period
 * (has_access ET access_until dans le futur) ou si son essai de 30 jours
 * (trial_ends_at) n'est pas encore expire.
 *
 * access_until est fixe par billing-webhook a chaque paiement reussi (fin
 * de periode = +1 mois). Sans nouveau paiement, l'acces expire de lui-meme :
 * il n'y a pas d'acces "a vie" apres un seul paiement.
 */

export function hasActiveAccess(profile: {
  has_access?: boolean | null;
  access_until?: string | null;
  trial_ends_at?: string | null;
}): boolean {
  if (profile.has_access && profile.access_until) {
    return new Date(profile.access_until).getTime() > Date.now();
  }
  if (!profile.trial_ends_at) return false;
  return new Date(profile.trial_ends_at).getTime() > Date.now();
}
