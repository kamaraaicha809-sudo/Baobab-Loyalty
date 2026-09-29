-- Migration 058: Consentement WhatsApp prealable (opt-in) — projet Afrique
--
-- Loi ivoirienne n° 2013-546 (transactions electroniques), art. 14 : la
-- prospection par SMS, messagerie ou tout moyen electronique est interdite
-- sans le consentement PREALABLE de la personne. L'exception "clients
-- existants" ne vaut que pour l'email. La migration 050 marquait tout client
-- comme consentant par defaut (DEFAULT true) : un client importe ou saisi
-- sans accord pouvait recevoir des campagnes WhatsApp et d'anniversaire.
--
-- Etat constate en production avant ce correctif (2026-09-29) : 5 clients,
-- 1 hotel, tous a true sans aucune trace d'accord. Ils repassent a false :
-- l'hotel devra enregistrer leur accord (registre, import avec attestation ou
-- bascule manuelle) avant tout envoi.
--
-- Campagnes (campaign-send) et anniversaires (birthday-worker) filtrent deja
-- sur marketing_consent : aucun changement d'Edge Function necessaire.
-- Projet Europe non concerne (migrations-europe, modele channel_rgpd).

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marketing_consent_source TEXT;

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_marketing_consent_source_length;
ALTER TABLE public.clients ADD CONSTRAINT clients_marketing_consent_source_length
  CHECK (marketing_consent_source IS NULL OR char_length(marketing_consent_source) <= 100);

ALTER TABLE public.clients ALTER COLUMN marketing_consent SET DEFAULT false;

UPDATE public.clients
SET marketing_consent = false
WHERE marketing_consent = true
  AND marketing_consent_at IS NULL;

-- Horodatage serveur de chaque nouvel accord : une date deja fournie (date
-- d'origine indiquee dans un fichier importe) est conservee, sinon now().
-- Sur un UPDATE, une date identique a l'ancienne signifie "non fournie".
CREATE OR REPLACE FUNCTION public.stamp_marketing_consent()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.marketing_consent AND (TG_OP = 'INSERT' OR NOT OLD.marketing_consent) THEN
    IF NEW.marketing_consent_at IS NULL
       OR (TG_OP = 'UPDATE' AND NEW.marketing_consent_at IS NOT DISTINCT FROM OLD.marketing_consent_at) THEN
      NEW.marketing_consent_at := now();
    END IF;
    IF NULLIF(btrim(COALESCE(NEW.marketing_consent_source, '')), '') IS NULL THEN
      NEW.marketing_consent_source := 'non_precise';
    END IF;
    NEW.opted_out_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_stamp_marketing_consent ON public.clients;
CREATE TRIGGER trg_clients_stamp_marketing_consent
  BEFORE INSERT OR UPDATE OF marketing_consent ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_marketing_consent();
