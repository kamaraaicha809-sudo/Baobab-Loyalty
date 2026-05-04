-- Migration 025: BSP (Business Solution Provider) credentials for simplified WhatsApp onboarding
-- Hoteliers connect via Meta Embedded Signup (5 minutes) instead of manual Meta Developer setup (1 hour)
-- campaign-send checks bsp_api_key first (BSP path), falls back to whatsapp_access_token (legacy Meta path)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bsp_api_key TEXT,
  ADD COLUMN IF NOT EXISTS bsp_phone_number TEXT,
  ADD COLUMN IF NOT EXISTS bsp_waba_id TEXT,
  ADD COLUMN IF NOT EXISTS bsp_channel_id TEXT,
  ADD COLUMN IF NOT EXISTS bsp_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS bsp_connected_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.bsp_api_key IS 'BSP API key (360dialog, WATI, etc.) — never exposed to frontend';
COMMENT ON COLUMN profiles.bsp_phone_number IS 'WhatsApp phone number E.164 without + prefix (BSP format)';
COMMENT ON COLUMN profiles.bsp_waba_id IS 'WhatsApp Business Account ID from Meta Embedded Signup';
COMMENT ON COLUMN profiles.bsp_channel_id IS 'BSP channel/namespace identifier';
COMMENT ON COLUMN profiles.bsp_status IS 'BSP connection status: active | inactive | error';
COMMENT ON COLUMN profiles.bsp_connected_at IS 'Timestamp of last successful BSP connection';

-- Legacy columns (023_whatsapp_credentials.sql) remain for backward compatibility:
-- whatsapp_phone_number_id — Meta Cloud API Phone Number ID
-- whatsapp_access_token    — Meta Cloud API permanent access token
