-- ============================================
-- Table segment_offers : liaison segment ↔ offre
-- Quelles offres peuvent être envoyées à quels segments
-- ============================================

CREATE TABLE IF NOT EXISTS public.segment_offers (
  segment_code TEXT REFERENCES public.segments(code) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (segment_code, offer_id)
);

CREATE INDEX IF NOT EXISTS idx_segment_offers_offer ON public.segment_offers(offer_id);
