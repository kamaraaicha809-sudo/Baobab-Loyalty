-- Migration 036: Add hotel AI personalization settings (Premium plan only)
-- These fields let a Premium hotelier inject their brand voice into the
-- shared ai_prompts used by ai-generate, without editing raw prompts.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_brand_voice TEXT,
  ADD COLUMN IF NOT EXISTS ai_keywords_use TEXT,
  ADD COLUMN IF NOT EXISTS ai_keywords_avoid TEXT,
  ADD COLUMN IF NOT EXISTS ai_signature TEXT;
