-- Migration 023: Add per-profile WhatsApp Business API credentials
-- Each hotelier stores their own Phone Number ID and Access Token

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;

COMMENT ON COLUMN profiles.whatsapp_phone_number_id IS 'Meta WhatsApp Business Phone Number ID';
COMMENT ON COLUMN profiles.whatsapp_access_token IS 'Meta WhatsApp Business Access Token (permanent system user token)';
