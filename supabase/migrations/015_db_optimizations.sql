-- ============================================
-- OPTIMISATIONS BASE DE DONNÉES — Baobab Loyalty
-- Performance, RLS, index, fonctions SQL
-- ============================================

-- ============================================
-- 1. FONCTION get_segment_counts — Calcul côté DB
-- Remplace le chargement de tous les clients + calcul JS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_segment_counts(p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  v_3mois INT;
  v_6mois INT;
  v_9mois INT;
  v_tous INT;
  result JSONB;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 90),
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 180),
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 270),
    COUNT(*)
  INTO v_3mois, v_6mois, v_9mois, v_tous
  FROM public.clients
  WHERE profile_id = p_profile_id;

  result := jsonb_build_object(
    '3mois', COALESCE(v_3mois, 0),
    '6mois', COALESCE(v_6mois, 0),
    '9mois', COALESCE(v_9mois, 0),
    'tous', COALESCE(v_tous, 0)
  );
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_segment_counts(UUID) IS 'Retourne les comptages par segment (3, 6, 9 mois, tous) en une requête optimisée';

-- ============================================
-- 2. FONCTION get_reservations_chart — Agrégation côté DB
-- Remplace le chargement de toutes les résa + calcul JS
-- ISODOW: 1=Lun, 2=Mar, ..., 7=Dim
-- ============================================

CREATE OR REPLACE FUNCTION public.get_reservations_chart(p_profile_id UUID)
RETURNS TABLE(jour TEXT, directes BIGINT, autres BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH jours AS (
    SELECT i, (ARRAY['LUN','MAR','MER','JEU','VEN','SAM','DIM'])[i] AS jour
    FROM generate_series(1, 7) i
  ),
  agg AS (
    SELECT
      EXTRACT(ISODOW FROM reservation_date)::int AS dow,
      COUNT(*) FILTER (WHERE type_reservation = 'directe') AS dir,
      COUNT(*) FILTER (WHERE type_reservation != 'directe') AS aut
    FROM public.reservations
    WHERE profile_id = p_profile_id
      AND reservation_date >= date_trunc('week', CURRENT_DATE)::date
      AND reservation_date < date_trunc('week', CURRENT_DATE)::date + 7
    GROUP BY EXTRACT(ISODOW FROM reservation_date)
  )
  SELECT j.jour, COALESCE(a.dir, 0)::bigint AS directes, COALESCE(a.aut, 0)::bigint AS autres
  FROM jours j
  LEFT JOIN agg a ON a.dow = j.i
  ORDER BY j.i;
$$;

COMMENT ON FUNCTION public.get_reservations_chart(UUID) IS 'Retourne les réservations par jour (LUN-DIM) agrégées côté DB';

-- ============================================
-- 3. INDEX SUPPLÉMENTAIRES — Requêtes fréquentes
-- ============================================

-- profiles: lookup par email (billing, auth)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;

-- clients: priorité whatsapp pour envoi
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp_not_null ON public.clients(profile_id) WHERE whatsapp IS NOT NULL AND whatsapp != '';

-- sent_messages: dashboard campagnes (tri par date)
CREATE INDEX IF NOT EXISTS idx_sent_messages_profile_sent ON public.sent_messages(profile_id, sent_at DESC);

-- campaigns: liste par hôtel + statut
CREATE INDEX IF NOT EXISTS idx_campaigns_profile_status ON public.campaigns(profile_id, status);

-- offers: offres actives par hôtel (requête fréquente)
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(profile_id) WHERE status = 'active';

-- ============================================
-- 4. CONTRAINTES — Intégrité des données
-- ============================================

-- Offres: valid_until >= valid_from si les deux sont renseignés
ALTER TABLE public.offers DROP CONSTRAINT IF EXISTS offers_validity_check;
ALTER TABLE public.offers ADD CONSTRAINT offers_validity_check
  CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_until >= valid_from);

-- ============================================
-- 5. RLS — Tables nouvelles (sécurité)
-- ============================================

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- room_types: l'hôtel gère ses propres types
DROP POLICY IF EXISTS "Users can manage own room_types" ON public.room_types;
CREATE POLICY "Users can manage own room_types" ON public.room_types
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role room_types" ON public.room_types;
CREATE POLICY "Service role room_types" ON public.room_types FOR ALL USING (auth.role() = 'service_role');

-- offers: idem
DROP POLICY IF EXISTS "Users can manage own offers" ON public.offers;
CREATE POLICY "Users can manage own offers" ON public.offers
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role offers" ON public.offers;
CREATE POLICY "Service role offers" ON public.offers FOR ALL USING (auth.role() = 'service_role');

-- segment_offers: accès via offre (profile_id)
DROP POLICY IF EXISTS "Users can manage segment_offers via offers" ON public.segment_offers;
CREATE POLICY "Users can manage segment_offers via offers" ON public.segment_offers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.offers o WHERE o.id = segment_offers.offer_id AND o.profile_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.offers o WHERE o.id = segment_offers.offer_id AND o.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role segment_offers" ON public.segment_offers;
CREATE POLICY "Service role segment_offers" ON public.segment_offers FOR ALL USING (auth.role() = 'service_role');

-- campaigns
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role campaigns" ON public.campaigns;
CREATE POLICY "Service role campaigns" ON public.campaigns FOR ALL USING (auth.role() = 'service_role');

-- sent_messages (via clients → profile)
DROP POLICY IF EXISTS "Users can manage own sent_messages" ON public.sent_messages;
CREATE POLICY "Users can manage own sent_messages" ON public.sent_messages
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role sent_messages" ON public.sent_messages;
CREATE POLICY "Service role sent_messages" ON public.sent_messages FOR ALL USING (auth.role() = 'service_role');

-- redemptions
DROP POLICY IF EXISTS "Users can manage own redemptions" ON public.redemptions;
CREATE POLICY "Users can manage own redemptions" ON public.redemptions
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role redemptions" ON public.redemptions;
CREATE POLICY "Service role redemptions" ON public.redemptions FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 6. ANALYZE — Mise à jour des statistiques
-- ============================================

ANALYZE public.clients;
ANALYZE public.reservations;
ANALYZE public.offers;
ANALYZE public.campaigns;
ANALYZE public.sent_messages;
ANALYZE public.redemptions;
