-- Historique des actions sensibles (R6) : confirmation/annulation de
-- réservation, envoi de campagne, retrait d'un membre d'équipe. Écriture
-- réservée au service_role (les Edge Functions écrivent via getServiceClient,
-- jamais depuis le frontend) ; lecture réservée au propriétaire de l'hôtel
-- et aux membres avec le rôle "admin" (pas un simple "member").

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_profile_created
  ON public.audit_log(profile_id, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Même pattern SECURITY DEFINER que is_team_member() (migration 037), mais
-- restreint au rôle admin — un simple "member" ne doit pas voir l'historique
-- des actions de tout l'hôtel.
CREATE OR REPLACE FUNCTION public.is_team_admin(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT target_profile_id = auth.uid()
     OR EXISTS (
       SELECT 1 FROM public.team_members
       WHERE profile_id = target_profile_id AND user_id = auth.uid() AND team_role = 'admin'
     );
$$;

COMMENT ON FUNCTION public.is_team_admin(UUID) IS
  'Vrai si auth.uid() est le propriétaire du profil ou un membre invité avec le rôle admin (pas un simple member).';

DROP POLICY IF EXISTS "Team admins can view audit log" ON public.audit_log;
CREATE POLICY "Team admins can view audit log" ON public.audit_log
  FOR SELECT USING (public.is_team_admin(profile_id));

DROP POLICY IF EXISTS "Service role writes audit log" ON public.audit_log;
CREATE POLICY "Service role writes audit log" ON public.audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.audit_log IS
  'Historique des actions sensibles par hôtel (R6). Écrit uniquement par les Edge Functions via service_role, jamais depuis le frontend.';
