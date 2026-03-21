-- ============================================
-- Table segments : référentiel des segments
-- 3mois, 6mois, 9mois, tous
-- ============================================

CREATE TABLE IF NOT EXISTS public.segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_segments_code ON public.segments(code);

-- RLS : lecture publique, écriture réservée au service role
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read segments" ON public.segments
  FOR SELECT USING (true);

CREATE POLICY "Service role manages segments" ON public.segments
  FOR ALL TO service_role USING (true);

-- Données de référence
INSERT INTO public.segments (code, name, description, months) VALUES
  ('3mois', 'Clients - 3 mois', 'Clients n''ayant pas séjourné depuis 3 mois', 3),
  ('6mois', 'Clients - 6 mois', 'Clients n''ayant pas séjourné depuis 6 mois', 6),
  ('9mois', 'Clients - 9 mois', 'Clients n''ayant pas séjourné depuis 9 mois', 9),
  ('tous', 'Tous les clients', 'Idéal pour les événements spéciaux et fêtes', NULL)
ON CONFLICT (code) DO NOTHING;
