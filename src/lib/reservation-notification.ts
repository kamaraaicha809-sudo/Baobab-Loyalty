/**
 * Règle pure (sans affichage) : quelle réservation déclenche la notification
 * "nouvelle réservation" du dashboard. Utilisée par ReservationNotifier et
 * testée par scripts/regression-tests/europe-reservation-notification.mjs.
 */

export interface ReservationRow {
  id: string;
  status: string | null;
  source: string | null;
  offer_id: string | null;
  redemption_id: string | null;
  created_at: string | null;
}

// Au-delà, une mise à jour concerne une réservation ancienne : jamais de son.
const MAX_AGE_MS = 10 * 60 * 1000;

/**
 * Une réservation "récupérée par une campagne" : créée depuis la page publique
 * d'une offre (source "baobab"), encore à valider par l'hôtel, rattachée à une
 * campagne (offre ou clic suivi) et récente. Les imports et saisies manuelles
 * ne comptent pas. Le rattachement est posé par /api/reservations/create juste
 * APRÈS l'insertion (UPDATE) : c'est donc généralement une mise à jour qui
 * remplit ces conditions, pas l'insertion elle-même.
 */
export function isCampaignReservation(row: ReservationRow, now = Date.now()): boolean {
  if (row.status !== "pending_validation" || row.source !== "baobab") return false;
  if (!row.offer_id && !row.redemption_id) return false;
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : NaN;
  return Number.isFinite(createdAt) && now - createdAt < MAX_AGE_MS;
}
