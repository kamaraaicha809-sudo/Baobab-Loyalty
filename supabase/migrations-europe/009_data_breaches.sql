-- Registre des violations de donnees (Art. 33-34 RGPD) : notification a la
-- CNIL/autorite competente sous 72h si risque pour les droits et libertes,
-- documentation interne dans tous les cas (meme sans notification requise).
-- profile_id nullable : un incident peut concerner un hotel precis ou etre
-- transverse a la plateforme Baobab Europe.

CREATE TABLE IF NOT EXISTS public.data_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  incident_at TIMESTAMPTZ,
  description TEXT NOT NULL,
  data_categories TEXT[] NOT NULL DEFAULT '{}',
  approx_affected_count INTEGER,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  measures_taken TEXT,
  subprocessor_involved TEXT,
  notification_required BOOLEAN,
  authority_notified_at TIMESTAMPTZ,
  decision_maker TEXT,
  related_documents TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'contained', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_breaches_profile ON public.data_breaches(profile_id) WHERE profile_id IS NOT NULL;

ALTER TABLE public.data_breaches ENABLE ROW LEVEL SECURITY;

-- Un hotel peut voir les incidents qui LE concernent (transparence envers un
-- responsable de traitement co-implique), jamais ceux d un autre hotel ni les
-- incidents transverses a la plateforme (profile_id NULL, reserves a Baobab).
DROP POLICY IF EXISTS "Team admins can view their breach records" ON public.data_breaches;
CREATE POLICY "Team admins can view their breach records" ON public.data_breaches
  FOR SELECT USING (profile_id IS NOT NULL AND public.is_team_admin(profile_id));

DROP POLICY IF EXISTS "Service role manages breach records" ON public.data_breaches;
CREATE POLICY "Service role manages breach records" ON public.data_breaches
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.data_breaches IS
  'Registre des violations de donnees (Art. 33-34). notification_required et authority_notified_at documentent la decision de notifier (ou non) l''autorite sous 72h -- la decision elle-meme reste humaine, jamais automatisee.';
