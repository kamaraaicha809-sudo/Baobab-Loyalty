-- Migration 059: Preuve d'acceptation des CGU / CGV / DPA — projet Afrique
--
-- Le DPA indiquait s'appliquer "automatiquement" a tout compte, sans aucune
-- trace d'acceptation. Chaque acceptation est desormais horodatee cote
-- serveur (jamais une date fournie par le navigateur), avec la version des
-- documents acceptes, dans une table en ajout seul.
--
-- Ecriture uniquement via accept_legal_terms() (SECURITY DEFINER) : aucune
-- policy INSERT/UPDATE/DELETE, et aucun GRANT UPDATE sur les nouvelles
-- colonnes de profiles (cf. migrations 044/055).

CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  documents TEXT[] NOT NULL DEFAULT ARRAY['cgu', 'cgv', 'dpa'],
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user
  ON public.legal_acceptances(user_id, accepted_at DESC);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can read own legal acceptances" ON public.legal_acceptances
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version TEXT;

GRANT SELECT (terms_accepted_at, terms_version) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_legal_terms(p_version TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;
  IF p_version IS NULL OR p_version !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'Version des conditions invalide';
  END IF;

  UPDATE public.profiles
  SET terms_accepted_at = v_now, terms_version = p_version
  WHERE id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;

  INSERT INTO public.legal_acceptances (user_id, terms_version, accepted_at)
  VALUES (v_uid, p_version, v_now);

  RETURN v_now;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_legal_terms(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_legal_terms(TEXT) TO authenticated;
