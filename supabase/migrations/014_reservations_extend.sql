-- ============================================
-- Reservations : extension pour le flux WhatsApp
-- client_id, offer_id, redemption_id, room_type_id, check_in/out, number_of_rooms
-- Les réservations existantes (performance) gardent ces champs à NULL
-- ============================================

ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS redemption_id UUID REFERENCES public.redemptions(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS room_type_id UUID REFERENCES public.room_types(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS check_in_date DATE;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS check_out_date DATE;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS number_of_rooms INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_reservations_client ON public.reservations(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_offer ON public.reservations(offer_id) WHERE offer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_redemption ON public.reservations(redemption_id) WHERE redemption_id IS NOT NULL;
