-- ============================================
-- Table clients : base de données clients des hôtels
-- Permet la segmentation 3, 6, 9 mois et tous
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  derniere_visite DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_profile ON public.clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_derniere_visite ON public.clients(profile_id, derniere_visite);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role can manage clients" ON public.clients;
CREATE POLICY "Service role can manage clients" ON public.clients FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Colonnes configuration du compte (profiles)
-- ============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hotel_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS config_complete BOOLEAN DEFAULT false;

-- ============================================
-- Colonne source pour les réservations (via app ou import)
-- ============================================
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'baobab';
UPDATE public.reservations SET source = 'baobab' WHERE source IS NULL;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_source_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_source_check 
  CHECK (source IS NULL OR source IN ('baobab', 'import', 'autre'));

CREATE INDEX IF NOT EXISTS idx_reservations_source ON public.reservations(profile_id, source);
