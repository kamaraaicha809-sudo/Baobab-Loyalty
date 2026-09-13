-- Journal de generation IA (AI Gateway) - Baobab Europe uniquement.
-- Aucune donnee personnelle : ni prompt complet, ni contenu genere, ni
-- identite du client final. Sert a la tracabilite (EU AI Act, support,
-- controle de cout), pas au contenu.

CREATE TABLE IF NOT EXISTS public.ai_gateway_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  model_used TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  campaign_id UUID,
  prompt_version TEXT NOT NULL,
  request_id TEXT NOT NULL,
  estimated_cost_eur NUMERIC(10, 4),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_gateway_log_profile
  ON public.ai_gateway_log(profile_id, created_at DESC);

ALTER TABLE public.ai_gateway_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team admins can view AI gateway log" ON public.ai_gateway_log;
CREATE POLICY "Team admins can view AI gateway log" ON public.ai_gateway_log
  FOR SELECT USING (public.is_team_admin(profile_id));

DROP POLICY IF EXISTS "Service role writes AI gateway log" ON public.ai_gateway_log;
CREATE POLICY "Service role writes AI gateway log" ON public.ai_gateway_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.ai_gateway_log IS
  'Tracabilite de chaque appel au Baobab AI Gateway (fournisseur, modele, cout estime, statut). Ne contient jamais le contenu du prompt, le contenu genere, ni aucune donnee identifiant un client final -- seulement des metadonnees techniques.';
