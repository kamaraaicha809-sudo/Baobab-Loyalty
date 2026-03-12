-- ============================================
-- App Configuration Table
-- Stores dynamic AI configuration only
-- ============================================

CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);

-- RLS Policies
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read config (public data)
CREATE POLICY "Public can read app_config" ON app_config
  FOR SELECT USING (true);

-- Only service role can modify (via Edge Functions)
CREATE POLICY "Service role can manage app_config" ON app_config
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Add role column to profiles for admin access
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- Initial Configuration Data (AI only)
-- ============================================

INSERT INTO app_config (key, value, category, description) VALUES
('default_model', '"openai/gpt-4o-mini"', 'ai', 'Modele IA par defaut (OpenRouter)')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Function to update timestamp on changes
-- ============================================

CREATE OR REPLACE FUNCTION update_app_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_app_config_timestamp
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_app_config_timestamp();
