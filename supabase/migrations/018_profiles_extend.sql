-- Migration 018: Add establishment details to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS adresse_physique TEXT,
  ADD COLUMN IF NOT EXISTS adresse_postale TEXT,
  ADD COLUMN IF NOT EXISTS email_principal TEXT,
  ADD COLUMN IF NOT EXISTS telephone_officiel TEXT,
  ADD COLUMN IF NOT EXISTS nom_responsable TEXT,
  ADD COLUMN IF NOT EXISTS telephone_responsable TEXT,
  ADD COLUMN IF NOT EXISTS email_responsable TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
