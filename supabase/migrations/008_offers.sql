-- ============================================
-- Table offers : offres personnalisables par hôtel
-- ============================================

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('remise', 'surclassement', 'cocktail', 'famille', 'evenement', 'autre')),
  value JSONB DEFAULT '{}',
  valid_from DATE,
  valid_until DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_profile ON public.offers(profile_id);
CREATE INDEX IF NOT EXISTS idx_offers_profile_status ON public.offers(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_validity ON public.offers(valid_from, valid_until);

CREATE OR REPLACE FUNCTION update_offers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_offers_timestamp ON public.offers;
CREATE TRIGGER trigger_offers_timestamp
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION update_offers_timestamp();
