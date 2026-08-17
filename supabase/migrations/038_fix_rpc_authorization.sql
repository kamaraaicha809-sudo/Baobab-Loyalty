-- Migration 038: Corrige une IDOR sur get_segment_counts / get_reservations_chart
--
-- Ces deux fonctions sont SECURITY DEFINER (elles contournent RLS) et étaient
-- exécutables par les rôles anon/authenticated sans jamais vérifier que
-- l'appelant a le droit d'accéder au p_profile_id demandé. Comme profile_id
-- circule en clair dans chaque lien d'offre WhatsApp (/offre?pid=...), n'importe
-- qui pouvait lire les statistiques clients de n'importe quel hôtel.
--
-- Fix: réutiliser is_team_member() (migration 037) pour vérifier que
-- l'appelant est bien le propriétaire du profil ou un membre de son équipe.

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
  IF NOT COALESCE(public.is_team_member(p_profile_id), false) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

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
  'Retourne les comptages par plage d''inactivité (3-6, 6-9, 9-12 mois, 1an+, tous). Accès restreint via is_team_member().';

CREATE OR REPLACE FUNCTION public.get_reservations_chart(p_profile_id UUID)
RETURNS TABLE(jour TEXT, directes BIGINT, autres BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT COALESCE(public.is_team_member(p_profile_id), false) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  RETURN QUERY
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
END;
$$;

COMMENT ON FUNCTION public.get_reservations_chart(UUID) IS
  'Retourne les réservations par jour (LUN-DIM) agrégées côté DB. Accès restreint via is_team_member().';
