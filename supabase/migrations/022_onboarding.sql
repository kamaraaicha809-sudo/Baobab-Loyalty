-- Migration 022 : Onboarding utilisateur
-- Ajoute les colonnes de suivi de l'onboarding dans la table profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Les utilisateurs existants qui ont déjà configuré leur compte
-- n'ont pas besoin de repasser par l'onboarding
UPDATE public.profiles
  SET onboarding_completed = true
  WHERE config_complete = true;

-- Politique RLS : l'utilisateur peut mettre à jour son propre onboarding
-- (les politiques existantes couvrent déjà UPDATE sur profiles)
