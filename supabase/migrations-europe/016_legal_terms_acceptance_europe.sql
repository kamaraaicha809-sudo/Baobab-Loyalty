-- Migration Europe 016 : preuve d'acceptation des CGU / CGV / DPA (Loyavia)
--
-- Equivalent Europe de la migration Afrique 059, adapte au RGPD (art. 28 :
-- le DPA doit etre accepte par le client hotelier et l'acceptation doit
-- pouvoir etre prouvee) -- PAS une copie :
--   1. Seules les versions publiees dans legal_document_versions (ecrites
--      uniquement par le service role) peuvent etre acceptees : un navigateur
--      ne peut pas "accepter" une version inventee. Aucune version active
--      n'est inseree ici : tant que l'entite, la TVA et le droit applicable
--      ne sont pas fixes, accept_legal_terms() refuse toute acceptation.
--   2. Chaque acceptation garde le compte hotel (profile_id) ET l'utilisateur
--      qui a coche la case (user_id), plus la liste des documents acceptes
--      copiee depuis la version publiee (jamais fournie par le client).
--   3. Journal en ajout seul : aucune policy INSERT/UPDATE/DELETE, privileges
--      d'ecriture retires ; date posee par le serveur (now()).
--
-- La fenetre d'acceptation (components/dashboard/TermsGate.tsx) reste
-- desactivee en Europe (config.legal.requireTermsAcceptance) : rien n'est
-- active par cette migration.

-- 1. Versions publiees des documents contractuels
CREATE TABLE IF NOT EXISTS public.legal_document_versions (
  version TEXT PRIMARY KEY CHECK (version ~ '^\d{4}-\d{2}-\d{2}$'),
  documents TEXT[] NOT NULL CHECK (documents <@ ARRAY['cgu', 'cgv', 'dpa', 'confidentialite']::TEXT[]),
  is_active BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read legal versions" ON public.legal_document_versions;
CREATE POLICY "Authenticated can read legal versions" ON public.legal_document_versions
  FOR SELECT TO authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.legal_document_versions FROM anon, authenticated;

COMMENT ON TABLE public.legal_document_versions IS
  'Versions des CGU/CGV/DPA publiees pour Loyavia. Ecrite uniquement par le service role, au moment ou une version est validee juridiquement.';

-- 2. Journal des acceptations (preuve, ajout seul)
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL REFERENCES public.legal_document_versions(version) ON DELETE RESTRICT,
  documents TEXT[] NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user
  ON public.legal_acceptances(user_id, accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_profile
  ON public.legal_acceptances(profile_id, accepted_at DESC);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and team can read legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users and team can read legal acceptances" ON public.legal_acceptances
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id
    OR COALESCE(public.is_team_member(profile_id), false)
  );

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.legal_acceptances FROM anon, authenticated;

-- 3. Derniere acceptation, lisible sur le profil (lecture seule pour le client)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version TEXT;

GRANT SELECT (terms_accepted_at, terms_version) ON public.profiles TO authenticated;

-- 4. Seul point d'ecriture
CREATE OR REPLACE FUNCTION public.accept_legal_terms(p_version TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_documents TEXT[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  SELECT documents INTO v_documents
  FROM public.legal_document_versions
  WHERE version = p_version AND is_active = true;
  IF v_documents IS NULL THEN
    RAISE EXCEPTION 'Version des conditions inconnue ou non publiée';
  END IF;

  UPDATE public.profiles
  SET terms_accepted_at = v_now, terms_version = p_version
  WHERE id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;

  INSERT INTO public.legal_acceptances (user_id, profile_id, terms_version, documents, accepted_at)
  VALUES (v_uid, v_uid, p_version, v_documents, v_now);

  RETURN v_now;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_legal_terms(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_legal_terms(TEXT) TO authenticated;
