-- Socle RGPD Baobab Europe (Phase 3/Phase 4 blueprint) : consentement par canal,
-- historique immuable, centre de préférences, demandes d'accès/effacement,
-- politique de conservation. Ce fichier est spécifique à Baobab Europe :
-- il vit dans supabase/migrations-europe/ (jamais supabase/migrations/) afin
-- de ne jamais pouvoir être rejoué sur le projet Afrique par erreur.
--
-- Convention réutilisée d'Afrique : is_team_member()/is_team_admin() (037/052),
-- écriture des journaux réservée au service_role, lecture réservée au propriétaire
-- ou à un membre admin de l'hôtel.

-- 1. Consentement courant par client et par canal (lecture rapide, ex: avant envoi campagne)
CREATE TABLE IF NOT EXISTS public.communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  opted_in BOOLEAN NOT NULL DEFAULT false,
  language TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_communication_preferences_profile
  ON public.communication_preferences(profile_id);

ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view preferences" ON public.communication_preferences;
CREATE POLICY "Team members can view preferences" ON public.communication_preferences
  FOR SELECT USING (public.is_team_member(profile_id));

DROP POLICY IF EXISTS "Service role manages preferences" ON public.communication_preferences;
CREATE POLICY "Service role manages preferences" ON public.communication_preferences
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.communication_preferences IS
  'Etat courant opt-in/opt-out par client et par canal. Ecrit uniquement par les Edge Functions (jamais directement par le frontend), lu par le centre de preferences et avant tout envoi de campagne.';

-- 2. Preuve de consentement (une ligne par evenement de consentement)
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  action TEXT NOT NULL CHECK (action IN ('opt_in', 'opt_out')),
  method TEXT NOT NULL,
  policy_version TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_client
  ON public.consent_records(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_records_profile
  ON public.consent_records(profile_id, created_at DESC);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team admins can view consent proof" ON public.consent_records;
CREATE POLICY "Team admins can view consent proof" ON public.consent_records
  FOR SELECT USING (public.is_team_admin(profile_id));

DROP POLICY IF EXISTS "Service role writes consent proof" ON public.consent_records;
CREATE POLICY "Service role writes consent proof" ON public.consent_records
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.consent_records IS
  'Preuve de consentement RGPD (Art. 7) : une ligne immuable par evenement opt-in/opt-out, avec methode, version de la politique, IP et user-agent au moment de l''action. Jamais modifie ni supprime (sauf demande d''effacement du client concerne).';

-- 3. Journal d'audit consentement, distinct de audit_log (actions hotel) :
--    trace specifiquement chaque changement d'etat de communication_preferences.
CREATE TABLE IF NOT EXISTS public.consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  previous_state BOOLEAN,
  new_state BOOLEAN NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_client
  ON public.consent_log(client_id, created_at DESC);

ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team admins can view consent log" ON public.consent_log;
CREATE POLICY "Team admins can view consent log" ON public.consent_log
  FOR SELECT USING (public.is_team_admin(profile_id));

DROP POLICY IF EXISTS "Service role writes consent log" ON public.consent_log;
CREATE POLICY "Service role writes consent log" ON public.consent_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.consent_log IS
  'Historique immuable de chaque changement d''etat de communication_preferences (avant/apres, source : formulaire, import CSV, lien de desinscription, demande RGPD). Ne remplace pas consent_records (preuve juridique) : sert a l''audit technique et au support.';

-- 4. Demandes RGPD (acces / rectification / effacement / portabilite)
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  requester_email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  notes TEXT,
  handled_by UUID,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_profile
  ON public.data_subject_requests(profile_id, status);

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team admins manage RGPD requests" ON public.data_subject_requests;
CREATE POLICY "Team admins manage RGPD requests" ON public.data_subject_requests
  FOR ALL USING (public.is_team_admin(profile_id)) WITH CHECK (public.is_team_admin(profile_id));

DROP POLICY IF EXISTS "Service role manages RGPD requests" ON public.data_subject_requests;
CREATE POLICY "Service role manages RGPD requests" ON public.data_subject_requests
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.data_subject_requests IS
  'Demandes d''exercice des droits RGPD (Art. 15-20) : acces, rectification, effacement, portabilite. delai legal de reponse : 1 mois (Art. 12.3). handled_by = user_id du membre d''equipe ayant traite la demande.';

-- 5. Politique de conservation (documentation technique, une ligne par categorie de donnee)
CREATE TABLE IF NOT EXISTS public.retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_category TEXT NOT NULL UNIQUE,
  retention_period_months INTEGER NOT NULL,
  legal_basis TEXT NOT NULL,
  deletion_method TEXT NOT NULL CHECK (deletion_method IN ('hard_delete', 'anonymize')),
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read retention policy" ON public.retention_policies;
CREATE POLICY "Authenticated users can read retention policy" ON public.retention_policies
  FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));

DROP POLICY IF EXISTS "Service role manages retention policy" ON public.retention_policies;
CREATE POLICY "Service role manages retention policy" ON public.retention_policies
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role updates retention policy" ON public.retention_policies;
CREATE POLICY "Service role updates retention policy" ON public.retention_policies
  FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.retention_policies IS
  'Table de configuration (pas de donnee personnelle) : duree de conservation par categorie de donnee et base legale associee. Valeurs de depart inserees ci-dessous, a valider avec le DPO/conseil juridique avant mise en production.';

-- Valeurs de depart, a valider juridiquement avant toute mise en production (voir regle : pas de decision juridique sans validation utilisateur).
INSERT INTO public.retention_policies (data_category, retention_period_months, legal_basis, deletion_method)
VALUES
  ('clients_inactifs', 36, 'Interet legitime marketing, duree recommandee CNIL/EDPB pour prospection', 'anonymize'),
  ('consent_records', 60, 'Preuve juridique du consentement (Art. 7.1 RGPD), duree de prescription civile', 'hard_delete'),
  ('audit_log', 36, 'Obligation de tracabilite interne', 'hard_delete'),
  ('ai_gateway_log', 24, 'Tracabilite IA (EU AI Act, transparence), aucune donnee personnelle stockee', 'hard_delete')
ON CONFLICT (data_category) DO NOTHING;

-- 6. Fonction service_role pour appliquer un opt-out et tracer consent_log + communication_preferences
--    en une seule transaction (utilisee par clients-unsubscribe et le futur centre de preferences).
CREATE OR REPLACE FUNCTION public.set_communication_preference(
  p_profile_id UUID,
  p_client_id UUID,
  p_channel TEXT,
  p_opted_in BOOLEAN,
  p_method TEXT,
  p_policy_version TEXT,
  p_ip TEXT,
  p_user_agent TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous BOOLEAN;
BEGIN
  SELECT opted_in INTO v_previous
  FROM public.communication_preferences
  WHERE client_id = p_client_id AND channel = p_channel;

  INSERT INTO public.communication_preferences (profile_id, client_id, channel, opted_in, updated_at)
  VALUES (p_profile_id, p_client_id, p_channel, p_opted_in, now())
  ON CONFLICT (client_id, channel)
  DO UPDATE SET opted_in = EXCLUDED.opted_in, updated_at = now();

  INSERT INTO public.consent_records (profile_id, client_id, channel, action, method, policy_version, ip_address, user_agent)
  VALUES (p_profile_id, p_client_id, p_channel, CASE WHEN p_opted_in THEN 'opt_in' ELSE 'opt_out' END, p_method, p_policy_version, p_ip, p_user_agent);

  INSERT INTO public.consent_log (profile_id, client_id, channel, previous_state, new_state, source)
  VALUES (p_profile_id, p_client_id, p_channel, v_previous, p_opted_in, p_method);
END;
$$;

COMMENT ON FUNCTION public.set_communication_preference IS
  'Point d''entree unique pour tout changement de consentement : met a jour communication_preferences, ecrit la preuve dans consent_records et la trace dans consent_log en une seule transaction. Appele uniquement par les Edge Functions via service_role (jamais par le frontend directement).';
