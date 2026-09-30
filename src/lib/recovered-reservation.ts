/**
 * Règle unique qui décide si un changement de réservation reçu en direct est
 * une « réservation récupérée grâce à Baobab » : une réservation venue du lien
 * d'une campagne (source "baobab", page /offre) que l'hôtel vient de
 * confirmer. Une demande encore en attente, une réservation importée ou saisie
 * autrement, ou une ancienne confirmation modifiée plus tard ne comptent pas.
 *
 * Sans dépendance : partagée par le dashboard et par le test de régression.
 */

export interface ReservationChange {
  id?: string;
  status?: string | null;
  source?: string | null;
  confirmed_at?: string | null;
}

// Marge large pour absorber un décalage d'horloge entre le navigateur et le
// serveur ; les doublons (plusieurs mises à jour d'une même réservation) sont
// écartés par identifiant dans le composant.
export const RECENT_CONFIRMATION_WINDOW_MS = 10 * 60 * 1000;

export function isRecoveredReservation(row: ReservationChange, nowMs: number = Date.now()): boolean {
  if (!row.id || row.status !== "confirmed" || row.source !== "baobab" || !row.confirmed_at) return false;
  const confirmedMs = new Date(row.confirmed_at).getTime();
  if (Number.isNaN(confirmedMs)) return false;
  return Math.abs(nowMs - confirmedMs) <= RECENT_CONFIRMATION_WINDOW_MS;
}
