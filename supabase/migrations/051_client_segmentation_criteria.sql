-- ============================================
-- Nouveaux criteres de segmentation (P5)
-- Point de depart : import CSV. Mis a jour automatiquement pour
-- nombre_reservations / montant_total_depense / derniere_visite a chaque
-- confirmation de reservation (voir reservations-confirm). type_chambre_preferee
-- et saison_habituelle restent uniquement renseignes par CSV : le formulaire
-- de reservation /offre ne collecte ni type de chambre ni saison aujourd'hui.
-- ============================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nombre_reservations INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS montant_total_depense INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS type_chambre_preferee TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS saison_habituelle TEXT;

CREATE INDEX IF NOT EXISTS idx_clients_montant_depense ON public.clients(profile_id, montant_total_depense);
CREATE INDEX IF NOT EXISTS idx_clients_nombre_reservations ON public.clients(profile_id, nombre_reservations);
