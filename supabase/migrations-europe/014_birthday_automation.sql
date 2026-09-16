-- Migration 014 (Europe) : portage de l'automatisation anniversaire WhatsApp
-- (V1), deja en production sur Baobab Loyalty Afrique (migration 057) et
-- gatee au plan Pro/Premium (Afrique) ou Professional/Business (Europe) --
-- voir src/lib/plan.ts (hasBirthdayAccess). Adaptation 1:1 du contenu de
-- supabase/migrations/057_birthday_automation.sql, seule l'URL du cron
-- differe (projet Europe hqtqxjxorvhkdhgozdai au lieu du projet Afrique).
--
-- Limite connue V1 (identique Afrique) : un client ne le 29 fevrier n'est
-- pas detecte les annees non bissextiles. Accepte pour la V1, non traite.

-- ============================================
-- Extensions requises pour le cron quotidien (absentes du projet Europe
-- avant cette migration -- seul supabase_vault etait deja active)
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- Clients : date de naissance + anti-doublon d'envoi
-- ============================================

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS date_naissance DATE,
  ADD COLUMN IF NOT EXISTS last_birthday_sent_year INTEGER;

-- ============================================
-- Profiles : activation + choix du template, par hotel
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birthday_automation_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS birthday_template_key TEXT NOT NULL DEFAULT 'chaleureux';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birthday_template_key_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_birthday_template_key_check
  CHECK (birthday_template_key IN ('chaleureux', 'court', 'fidelisation'));

-- GRANTs colonne par colonne (meme principe que le reste des preferences
-- hotelieres deja ouvertes en Europe, ex. hotel_name) : ces deux colonnes
-- n'ont aucun impact facturation/role.
GRANT SELECT (birthday_automation_enabled, birthday_template_key) ON public.profiles TO authenticated;
GRANT UPDATE (birthday_automation_enabled, birthday_template_key) ON public.profiles TO authenticated;

-- ============================================
-- Campagnes : distinguer manuel / anniversaire (hors quota mensuel)
-- ============================================

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS campaign_type TEXT NOT NULL DEFAULT 'manual';

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_campaign_type_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_campaign_type_check
  CHECK (campaign_type IN ('manual', 'birthday'));

-- Segment dedie pour rattacher les campagnes anniversaire a la FK existante
-- (campaigns.segment_code -> segments.code) sans modifier cette contrainte.
INSERT INTO public.segments (code, name, description, months) VALUES
  ('anniversaire', 'Anniversaire', 'Clients dont c''est l''anniversaire aujourd''hui', NULL)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Cron : appelle birthday-worker une fois par jour a 7h UTC (projet Europe)
-- Le worker verifie lui-meme le header x-birthday-worker-secret
-- (secret Vault DB : birthday_worker_secret, cree le 2026-09-16 ;
-- secret Edge Function : BIRTHDAY_WORKER_SECRET, meme valeur, cree le 2026-09-16)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'birthday-worker-daily') THEN
    PERFORM cron.unschedule('birthday-worker-daily');
  END IF;

  PERFORM cron.schedule(
    'birthday-worker-daily',
    '0 7 * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://hqtqxjxorvhkdhgozdai.supabase.co/functions/v1/birthday-worker',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-birthday-worker-secret', COALESCE(
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'birthday_worker_secret'),
          ''
        )
      ),
      body := '{}'::jsonb
    );
    $cron$
  );
END $$;
