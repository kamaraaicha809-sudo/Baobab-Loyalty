-- ============================================
-- Table redemptions : clics sur le bouton Réserver
-- ============================================

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  sent_message_id UUID REFERENCES public.sent_messages(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  redemption_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'clicked' CHECK (status IN ('clicked', 'pending_booking', 'booked', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_client ON public.redemptions(client_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_offer ON public.redemptions(offer_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_profile ON public.redemptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_sent_message ON public.redemptions(sent_message_id);
