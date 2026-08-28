-- Migration 053 — Horodatage de confirmation des réservations
-- Nécessaire pour le "Flux en direct" du dashboard : reservations.created_at
-- correspond au moment où le CLIENT a soumis la demande via /offre, pas au
-- moment où l'hôtelier l'a confirmée. Sans cette colonne, on ne peut pas
-- trier les réservations confirmées par ordre chronologique de confirmation.

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reservations_confirmed_at
  ON public.reservations(profile_id, confirmed_at DESC)
  WHERE status = 'confirmed';
