-- Migration 032: Connecteur FNE (Facture Normalisee Electronique - DGI Cote d'Ivoire)
-- Facturation fiscale de l'abonnement Baobab Loyalty envers les hoteliers (paiement Moneroo).
--
-- Tout ce schema est concu pour rester inerte tant que fne_config.is_active = false
-- (l'inscription DGI de Baobab Loyalty n'est pas encore terminee). Aucune donnee ici
-- n'est visible par les hoteliers : RLS active sans policy = service_role uniquement.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- Configuration emetteur (une seule ligne active a la fois)
-- ============================================

CREATE TABLE IF NOT EXISTS fne_config (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment             text NOT NULL CHECK (environment IN ('test', 'production')),
  base_url                text NOT NULL,
  api_key_ref             text NOT NULL, -- nom du secret dans Supabase Vault, jamais la cle en clair
  issuer_ncc              text NOT NULL,
  default_establishment   text NOT NULL,
  default_point_of_sale   text NOT NULL,
  vat_registered          boolean NOT NULL DEFAULT false, -- false = TVAD (exonere), true = TVA 18%
  sticker_threshold       int NOT NULL DEFAULT 200,
  is_active               boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS fne_config_one_active
  ON fne_config (is_active) WHERE is_active;

-- Ligne placeholder, inactive : a completer avec les vraies infos legales
-- une fois l'inscription DGI validee (section 1 de la spec).
INSERT INTO fne_config (
  environment, base_url, api_key_ref, issuer_ncc,
  default_establishment, default_point_of_sale, vat_registered, is_active
) VALUES (
  'test', 'http://54.247.95.108/ws', 'fne_api_key', 'A_CONFIRMER',
  'A_CONFIRMER', 'WEB', false, false
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Facture interne (referentiel commercial Baobab Loyalty)
-- ============================================

DO $$ BEGIN
  CREATE TYPE invoice_state AS ENUM (
    'DRAFT',
    'PAYMENT_CONFIRMED',
    'QUEUED',
    'SENDING',
    'CERTIFIED',
    'NEEDS_VERIFICATION', -- etat indetermine : verification humaine au portail FNE
    'NEEDS_FIX',          -- rejet 400 ou payload invalide localement
    'AMOUNT_MISMATCH',    -- totaux FNE != totaux locaux
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_number        text NOT NULL UNIQUE,   -- numerotation Baobab Loyalty, distincte de la reference FNE
  moneroo_payment_id     text UNIQUE,            -- dedup si Moneroo renvoie le webhook plusieurs fois
  product                text NOT NULL DEFAULT 'baobab_loyalty_subscription',
  plan_slug              text,
  profile_id             uuid NOT NULL REFERENCES profiles(id),
  template               text CHECK (template IN ('B2B', 'B2C', 'B2G', 'B2F')),
  payment_method         text CHECK (payment_method IN ('cash', 'card', 'check', 'mobile-money', 'transfer', 'deferred')),
  currency               text NOT NULL DEFAULT 'XOF',
  foreign_currency       text,
  foreign_currency_rate  numeric,
  period_start           date,
  period_end             date,
  total_ht_local         bigint NOT NULL, -- entier XOF, jamais de float
  total_ttc_local        bigint NOT NULL,
  vat_local              bigint NOT NULL,
  state                  invoice_state NOT NULL DEFAULT 'DRAFT',
  attempt_count          int NOT NULL DEFAULT 0,
  next_attempt_at        timestamptz NOT NULL DEFAULT now(),
  last_error             text, -- diagnostic humain (absent de la spec DGI, utile en interne)
  paid_at                timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_state_idx ON invoices (state) WHERE state <> 'CERTIFIED';
CREATE INDEX IF NOT EXISTS invoices_next_attempt_idx ON invoices (next_attempt_at) WHERE state = 'QUEUED';

CREATE OR REPLACE FUNCTION update_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoices_timestamp ON invoices;
CREATE TRIGGER trigger_invoices_timestamp
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_timestamp();

CREATE TABLE IF NOT EXISTS invoice_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id       uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_no          int NOT NULL,
  reference        text,
  description      text NOT NULL,
  quantity         numeric NOT NULL,
  unit_amount_ht   bigint NOT NULL,
  discount_pct     numeric NOT NULL DEFAULT 0,
  measurement_unit text,
  tax_code         text NOT NULL CHECK (tax_code IN ('TVA', 'TVAB', 'TVAC', 'TVAD')),
  fne_item_id      uuid, -- rempli avec invoice.items[].id de la reponse FNE apres certification
  UNIQUE (invoice_id, line_no)
);

-- ============================================
-- Journal des tentatives (audit + garde d'idempotence)
-- ============================================

CREATE TABLE IF NOT EXISTS fne_submissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        uuid NOT NULL REFERENCES invoices(id),
  kind              text NOT NULL CHECK (kind IN ('sign', 'refund')),
  attempt_no        int NOT NULL,
  request_body      jsonb NOT NULL,
  request_sent_at   timestamptz, -- horodatage du depart effectif de la requete HTTP
  response_status   int,
  response_body     jsonb,
  error_class       text, -- 'connect_timeout' | 'read_timeout' | 'http_4xx' | 'http_5xx' | ...
  outcome           text CHECK (outcome IN ('success', 'retryable', 'permanent', 'indeterminate')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fne_submissions_invoice_idx ON fne_submissions (invoice_id, created_at DESC);

-- Verrou d'unicite : une seule tentative en vol par facture
CREATE UNIQUE INDEX IF NOT EXISTS fne_submission_inflight
  ON fne_submissions (invoice_id)
  WHERE response_status IS NULL AND outcome IS NULL;

-- ============================================
-- Certification (resultat fiscal - immuable)
-- ============================================

CREATE TABLE IF NOT EXISTS fne_certifications (
  invoice_id         uuid PRIMARY KEY REFERENCES invoices(id),
  fne_invoice_id     uuid NOT NULL,        -- 'invoice.id' de la reponse FNE - cle pour les avoirs
  fne_reference      text NOT NULL UNIQUE, -- ex. 9606123E25000000019
  verification_url   text NOT NULL,        -- champ 'token' de la reponse FNE
  issuer_ncc         text NOT NULL,
  amount_fne         bigint NOT NULL,
  vat_amount_fne     bigint NOT NULL,
  fiscal_stamp       bigint NOT NULL DEFAULT 0,
  balance_sticker    int,
  warning            boolean NOT NULL DEFAULT false,
  raw_response       jsonb NOT NULL, -- conservation integrale, piece fiscale (>= 10 ans, pas de purge)
  certified_at       timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION fne_certifications_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'fne_certifications est append-only : UPDATE/DELETE interdits (piece fiscale)';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fne_certifications_no_update ON fne_certifications;
CREATE TRIGGER trigger_fne_certifications_no_update
  BEFORE UPDATE OR DELETE ON fne_certifications
  FOR EACH ROW
  EXECUTE FUNCTION fne_certifications_append_only();

-- ============================================
-- Avoirs
-- ============================================

CREATE TABLE IF NOT EXISTS fne_credit_notes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_invoice_id  uuid NOT NULL REFERENCES invoices(id),
  reason             text NOT NULL,
  items              jsonb NOT NULL, -- [{ id: <fne_item_id>, quantity }]
  fne_reference      text UNIQUE,    -- prefixe 'A' (ex. A9606123E25000000019)
  verification_url   text,
  balance_sticker    int,
  raw_response       jsonb,
  state              text NOT NULL DEFAULT 'PENDING',
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- Suivi de consommation des stickers
-- ============================================

CREATE TABLE IF NOT EXISTS fne_sticker_log (
  id              bigserial PRIMARY KEY,
  observed_at     timestamptz NOT NULL DEFAULT now(),
  balance         int NOT NULL,
  warning         boolean NOT NULL,
  source_invoice  uuid
);

-- ============================================
-- RLS : service_role uniquement (aucune policy = deny pour anon/authenticated)
-- ============================================

ALTER TABLE fne_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fne_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fne_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fne_credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fne_sticker_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Cron : appelle fne-worker chaque minute (no-op tant que fne_config.is_active = false)
-- Le worker verifie lui-meme le header x-fne-worker-secret (voir Vault : fne_worker_secret)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fne-worker-tick') THEN
    PERFORM cron.unschedule('fne-worker-tick');
  END IF;

  PERFORM cron.schedule(
    'fne-worker-tick',
    '* * * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://nsohqxohmxeklejdltip.supabase.co/functions/v1/fne-worker',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-fne-worker-secret', COALESCE(
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'fne_worker_secret'),
          ''
        )
      ),
      body := '{}'::jsonb
    );
    $cron$
  );
END $$;
