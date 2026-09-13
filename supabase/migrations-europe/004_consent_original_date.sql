-- Ajoute la date de consentement d'origine (telle que declaree dans un
-- fichier importe, potentiellement anterieure a la date d'import elle-meme)
-- sans quoi seule la date d'ENREGISTREMENT (created_at, toujours "now()")
-- serait tracee -- insuffisant pour repondre a "source et date du
-- consentement" lors d'un import CSV documente.

ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS original_consent_date DATE;

COMMENT ON COLUMN public.consent_records.original_consent_date IS
  'Date du consentement telle que declaree par la source (ex: import CSV documentant un consentement recueilli anterieurement). NULL si inconnue -- created_at reste la date d''enregistrement dans Baobab, distincte de cette date d''origine.';

-- Ajouter un parametre cree une surcharge distincte plutot que de remplacer
-- la fonction existante (CREATE OR REPLACE exige une signature identique) --
-- on supprime donc explicitement l'ancienne forme a 8 parametres pour ne
-- jamais laisser deux versions coexister (ambiguite sur set_communication_preference).
DROP FUNCTION IF EXISTS public.set_communication_preference(UUID, UUID, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT);

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
  IF auth.role() <> 'service_role' AND NOT public.is_team_member(p_profile_id) THEN
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

COMMENT ON FUNCTION public.set_communication_preference IS
  'Point d''entree unique pour tout changement de consentement. Verifie is_team_member(p_profile_id) en interne (sauf appel service_role). p_original_consent_date optionnel : date reelle du consentement quand elle differe de la date d''enregistrement (ex: import CSV documentant un consentement anterieur).';
