-- Migration 019: Add beta tester flag to profiles

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.is_beta_tester IS 'true si l utilisateur s est inscrit via /signup?ref=beta';
