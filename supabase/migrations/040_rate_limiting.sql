-- Migration 040: Rate limiting pour les endpoints publics
--
-- /api/reservations/create, newsletter-subscribe et /api/survey sont
-- accessibles sans authentification (normal, ce sont des formulaires publics)
-- mais n'avaient aucune limite de débit — un attaquant pouvait les spammer en
-- boucle. check_rate_limit() est une fenêtre glissante simple basée sur une
-- clé arbitraire (ex: "reservations:<ip>"), appelée avec la clé service_role
-- depuis les endpoints concernés.

CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  bucket_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_key_time
  ON public.rate_limit_hits(bucket_key, created_at);

ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role rate_limit_hits" ON public.rate_limit_hits;
CREATE POLICY "Service role rate_limit_hits" ON public.rate_limit_hits
  FOR ALL USING (auth.role() = 'service_role');

-- Nettoyage périodique implicite : chaque appel purge ses propres entrées
-- expirées pour sa bucket_key, donc la table ne grossit pas indéfiniment.

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_hits INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM public.rate_limit_hits
  WHERE bucket_key = p_key
    AND created_at < now() - (p_window_seconds || ' seconds')::interval;

  SELECT COUNT(*) INTO v_count
  FROM public.rate_limit_hits
  WHERE bucket_key = p_key
    AND created_at >= now() - (p_window_seconds || ' seconds')::interval;

  IF v_count >= p_max_hits THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_hits (bucket_key) VALUES (p_key);
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.check_rate_limit(TEXT, INT, INT) IS
  'Fenêtre glissante : retourne false si plus de p_max_hits appels pour p_key durant les p_window_seconds dernières secondes. Réservé au service_role (appelé uniquement depuis des endpoints serveur).';

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;
