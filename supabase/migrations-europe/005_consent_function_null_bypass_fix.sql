-- Corrige un contournement decouvert en testant le durcissement de la
-- migration 003 : is_team_member() retourne NULL (pas false) quand
-- auth.uid() est NULL (appel anonyme, sans session) -- `target_profile_id =
-- auth.uid()` vaut alors NULL, et `NULL OR EXISTS(...)` reste NULL des que
-- l'EXISTS est false. C'est sans consequence dans une clause RLS USING()
-- (NULL y exclut la ligne, comme false), mais dans un `IF NOT ... THEN
-- RAISE` explicite, `IF NULL THEN` ne declenche PAS l'exception -- un appel
-- anonyme pouvait donc passer ce garde-fou (bloque ensuite, par coincidence,
-- par la verification d'existence du client -- pas une protection fiable).
-- Corrige ici en forcant le resultat a false quand il est indetermine,
-- sans toucher a is_team_member() elle-meme (utilisee ailleurs en RLS,
-- ou son comportement actuel est correct -- la modifier serait hors
-- perimetre et risquerait une regression Afrique si jamais partagee).

CREATE OR REPLACE FUNCTION public.set_communication_preference(
  p_profile_id UUID,
  p_client_id UUID,
  p_channel TEXT,
  p_opted_in BOOLEAN,
  p_method TEXT,
  p_policy_version TEXT,
  p_ip TEXT,
  p_user_agent TEXT,
  p_original_consent_date DATE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous BOOLEAN;
BEGIN
  IF auth.role() <> 'service_role' AND COALESCE(public.is_team_member(p_profile_id), false) = false THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = p_client_id AND profile_id = p_profile_id) THEN
    RAISE EXCEPTION 'Client introuvable pour ce profil';
  END IF;

  SELECT opted_in INTO v_previous
  FROM public.communication_preferences
  WHERE client_id = p_client_id AND channel = p_channel;

  INSERT INTO public.communication_preferences (profile_id, client_id, channel, opted_in, updated_at)
  VALUES (p_profile_id, p_client_id, p_channel, p_opted_in, now())
  ON CONFLICT (client_id, channel)
  DO UPDATE SET opted_in = EXCLUDED.opted_in, updated_at = now();

  INSERT INTO public.consent_records (profile_id, client_id, channel, action, method, policy_version, ip_address, user_agent, original_consent_date)
  VALUES (p_profile_id, p_client_id, p_channel, CASE WHEN p_opted_in THEN 'opt_in' ELSE 'opt_out' END, p_method, p_policy_version, p_ip, p_user_agent, p_original_consent_date);

  INSERT INTO public.consent_log (profile_id, client_id, channel, previous_state, new_state, source)
  VALUES (p_profile_id, p_client_id, p_channel, v_previous, p_opted_in, p_method);
END;
$$;
