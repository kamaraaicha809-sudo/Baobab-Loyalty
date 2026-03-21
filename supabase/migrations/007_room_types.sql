-- ============================================
-- Table room_types : types de chambres par hôtel
-- ============================================

CREATE TABLE IF NOT EXISTS public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price_fcfa INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_types_profile ON public.room_types(profile_id);

CREATE OR REPLACE FUNCTION update_room_types_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_room_types_timestamp ON public.room_types;
CREATE TRIGGER trigger_room_types_timestamp
  BEFORE UPDATE ON public.room_types
  FOR EACH ROW
  EXECUTE FUNCTION update_room_types_timestamp();
