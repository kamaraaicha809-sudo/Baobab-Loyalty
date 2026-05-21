-- Migration 027 — Anti-overbooking
-- Ajoute statut de validation, infos client et contacts réception

-- 1. Étendre la table reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS nights INTEGER,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT;

DO $$ BEGIN
  ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_status_check
    CHECK (status IN ('pending_validation', 'confirmed', 'cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Étendre la table profiles avec les contacts réception
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reception_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS reception_email TEXT;

CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON public.reservations(profile_id, status)
  WHERE status = 'pending_validation';
