-- Durcissement de set_communication_preference (001_rgpd_foundation.sql) :
-- la fonction est SECURITY DEFINER mais n'exigeait aucune verification
-- d'appartenance -- n'importe quel utilisateur authentifie (ou meme anon,
-- Postgres accorde EXECUTE a PUBLIC par defaut) pouvait forger un
-- consentement pour n'importe quel profile_id/client_id. Trouve pendant le
-- chantier consentement par canal (P0 campaign-send), corrige ici avant
-- toute utilisation reelle. Meme convention que get_segment_counts()/
-- get_reservations_chart() (migration 038 Afrique) : verification
-- is_team_member() a l'interieur de la fonction, pas seulement au niveau GRANT,
-- pour rester appelable directement par le frontend sous sa propre session.

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

  INSERT INTO public.consent_records (profile_id, client_id, channel, action, method, policy_version, ip_address, user_agent)
  VALUES (p_profile_id, p_client_id, p_channel, CASE WHEN p_opted_in THEN 'opt_in' ELSE 'opt_out' END, p_method, p_policy_version, p_ip, p_user_agent);

  INSERT INTO public.consent_log (profile_id, client_id, channel, previous_state, new_state, source)
  VALUES (p_profile_id, p_client_id, p_channel, v_previous, p_opted_in, p_method);
END;
$$;

COMMENT ON FUNCTION public.set_communication_preference IS
  'Point d''entree unique pour tout changement de consentement. Verifie is_team_member(p_profile_id) en interne (sauf appel service_role) : appelable directement par le frontend sous session utilisateur, mais jamais pour le compte d''un autre hotel.';

-- La désinscription en libre-service (lien public, sans session -- voir
-- clients-unsubscribe) doit pouvoir écrire malgré tout : elle passe déjà par
-- une Edge Function avec service_role, donc couverte par le contournement
-- ci-dessus (auth.role() = 'service_role'). Rien à ajouter ici.
