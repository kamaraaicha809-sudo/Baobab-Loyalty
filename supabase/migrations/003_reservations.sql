-- Table des réservations pour le graphique de performance
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reservation_date DATE NOT NULL,
  type_reservation TEXT NOT NULL CHECK (type_reservation IN ('directe', 'autre')),
  montant_fcfa INTEGER DEFAULT 0,
  hotel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_profile_date ON public.reservations(profile_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservations;
CREATE POLICY "Users can insert own reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role can manage reservations" ON public.reservations;
CREATE POLICY "Service role can manage reservations" ON public.reservations FOR ALL USING (auth.role() = 'service_role');
