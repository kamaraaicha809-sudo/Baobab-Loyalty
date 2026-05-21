-- ============================================
-- MIGRATION 016 — Segments par tranches
-- Remplace 3mois/6mois/9mois par des plages :
--   3-6mois  : 90  à 179 jours d'inactivité
--   6-9mois  : 180 à 269 jours
--   9-12mois : 270 à 364 jours
--   1an+     : 365+ jours
--   tous     : tous les clients (événements spéciaux)
-- ============================================

-- 1. Insérer les nouveaux segments (ON CONFLICT garde l'ancien "tous")
INSERT INTO public.segments (code, name, description, months) VALUES
  ('3-6mois',  'Clients 3 à 6 mois',    'Clients inactifs depuis 3 à moins de 6 mois',  NULL),
  ('6-9mois',  'Clients 6 à 9 mois',    'Clients inactifs depuis 6 à moins de 9 mois',  NULL),
  ('9-12mois', 'Clients 9 à 12 mois',   'Clients inactifs depuis 9 à moins de 12 mois', NULL),
  ('1an+',     'Plus d''un an',          'Clients inactifs depuis plus d''un an',          NULL)
ON CONFLICT (code) DO NOTHING;

-- 2. Mettre à jour la description de "tous"
UPDATE public.segments
  SET description = 'Idéal pour les événements spéciaux et fêtes'
  WHERE code = 'tous';

-- ============================================
-- 3. Nouvelle fonction get_segment_counts
-- Retourne les comptages par plage d'inactivité
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
  v_3_6mois  INT;
  v_6_9mois  INT;
  v_9_12mois INT;
  v_1an_plus INT;
  v_tous     INT;
  result     JSONB;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 90  AND (today_date - derniere_visite) < 180),
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 180 AND (today_date - derniere_visite) < 270),
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 270 AND (today_date - derniere_visite) < 365),
    COUNT(*) FILTER (WHERE (today_date - derniere_visite) >= 365),
    COUNT(*)
  INTO v_3_6mois, v_6_9mois, v_9_12mois, v_1an_plus, v_tous
  FROM public.clients
  WHERE profile_id = p_profile_id;

  result := jsonb_build_object(
    '3-6mois',  COALESCE(v_3_6mois,  0),
    '6-9mois',  COALESCE(v_6_9mois,  0),
    '9-12mois', COALESCE(v_9_12mois, 0),
    '1an+',     COALESCE(v_1an_plus, 0),
    'tous',     COALESCE(v_tous,     0)
  );
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_segment_counts(UUID) IS
  'Retourne les comptages par plage d''inactivité (3-6, 6-9, 9-12 mois, 1an+, tous) en une requête optimisée';
