-- ============================================
-- AI Prompts Table
-- Stores system prompts for AI automations
-- ============================================

CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for name lookups
CREATE INDEX IF NOT EXISTS idx_ai_prompts_name ON ai_prompts(name);

-- RLS Policies
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone can read prompts (needed by the app)
CREATE POLICY "Public can read ai_prompts" ON ai_prompts
  FOR SELECT USING (true);

-- Only service role can modify (via Edge Functions with admin check)
CREATE POLICY "Service role can manage ai_prompts" ON ai_prompts
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Function to update timestamp on changes
-- ============================================

CREATE OR REPLACE FUNCTION update_ai_prompts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_prompts_timestamp
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_timestamp();

-- ============================================
-- Cleanup app_config: Remove unused keys
-- Keep only default_model
-- ============================================

DELETE FROM app_config WHERE key NOT IN ('default_model');

-- Update default_model if not exists
INSERT INTO app_config (key, value, category, description)
VALUES ('default_model', '"openai/gpt-4o-mini"', 'ai', 'Modèle IA par défaut (OpenRouter)')
ON CONFLICT (key) DO NOTHING;
