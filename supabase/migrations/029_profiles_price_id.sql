-- Migration 029: Add price_id (plan slug) to profiles table
-- Required by billing-webhook to record which plan a customer is on,
-- and by the Premium-only feature gating (e.g. LinkedIn).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS price_id TEXT;
