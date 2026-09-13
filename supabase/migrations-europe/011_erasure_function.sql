-- Fonction centrale du droit a l effacement (Art. 17) : ne supprime jamais
-- aveuglement. Si le client a des donnees liees necessaires aux statistiques
-- /comptabilite (sent_messages, redemptions, reservations), anonymise au lieu
-- de supprimer -- sinon, suppression complete (rien a preserver).
--
-- service_role uniquement : action destructive/irreversible, jamais appelee
-- directement par le frontend -- toujours via une Edge Function qui journalise
-- et met a jour la demande RGPD associee (voir supabase/functions/gdpr-erase-client).

CREATE OR REPLACE FUNCTION public.anonymize_or_erase_client(
  p_profile_id UUID,
  p_client_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_related_count INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = p_client_id AND profile_id = p_profile_id) THEN
    RAISE EXCEPTION 'Client introuvable pour ce profil';
  END IF;

  SELECT
    (SELECT count(*) FROM public.sent_messages WHERE client_id = p_client_id)
    + (SELECT count(*) FROM public.redemptions WHERE client_id = p_client_id)
    + (SELECT count(*) FROM public.reservations WHERE client_id = p_client_id)
  INTO v_related_count;

  IF v_related_count = 0 THEN
    -- Rien a preserver : suppression complete. consent_records n'a pas de
    -- ON DELETE CASCADE depuis clients (colonne independante, voir
    -- 001_rgpd_foundation.sql) -- la preuve de consentement passee est
    -- conservee pour sa propre duree legale meme apres suppression du client.
    DELETE FROM public.communication_preferences WHERE client_id = p_client_id;
    DELETE FROM public.clients WHERE id = p_client_id AND profile_id = p_profile_id;
    RETURN 'deleted';
  END IF;

  -- Anonymisation : identifiants directs supprimes, statistiques conservees
  -- (nombre_reservations, montant_total_depense, type/saison preferee,
  -- derniere_visite -- aucun de ces champs n identifie la personne seul).
  UPDATE public.clients SET
    nom = 'Client anonymisé',
    email = NULL,
    telephone = NULL,
    whatsapp = NULL,
    notes = NULL,
    anonymized = true,
    anonymized_at = now()
  WHERE id = p_client_id AND profile_id = p_profile_id;

  -- Le contenu personnalise d un message (incluant le prenom du client)
  -- est vide ; canal/statut/dates/campaign_id restent pour les statistiques.
  UPDATE public.sent_messages SET message_content = NULL WHERE client_id = p_client_id;

  -- Les identifiants indirects (IP, user-agent) sont retires de la preuve de
  -- consentement -- action/canal/dates restent comme trace juridique du
  -- consentement passe, sans donnee permettant de re-identifier la personne.
  UPDATE public.consent_records SET ip_address = NULL, user_agent = NULL WHERE client_id = p_client_id;

  -- Un client anonymise ne doit plus jamais etre recontacte : les
  -- preferences de communication n ont plus lieu d etre (voir aussi le
  -- filtre channel_rgpd, qui exclut desormais explicitement anonymized=true).
  DELETE FROM public.communication_preferences WHERE client_id = p_client_id;

  RETURN 'anonymized';
END;
$$;

COMMENT ON FUNCTION public.anonymize_or_erase_client IS
  'Point d''entree unique du droit a l''effacement. Supprime completement si aucune donnee liee a preserver (sent_messages/redemptions/reservations), sinon anonymise (identifiants directs retires, statistiques conservees). service_role uniquement -- toujours appele via une Edge Function qui journalise (audit_log) et cloture la demande RGPD (data_subject_requests).';
