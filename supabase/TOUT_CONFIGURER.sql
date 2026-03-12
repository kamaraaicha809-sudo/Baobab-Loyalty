-- ============================================
-- CONFIGURATION COMPLÈTE SUPABASE - Baobab Loyalty
-- Exécutez ce fichier dans Supabase > SQL Editor > New query
-- ============================================

-- ============================================
-- ÉTAPE 1 : Table profiles (utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  customer_id TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 2 : Table app_config
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

CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read app_config" ON app_config;
CREATE POLICY "Public can read app_config" ON app_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage app_config" ON app_config;
CREATE POLICY "Service role can manage app_config" ON app_config FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

INSERT INTO app_config (key, value, category, description) VALUES
('default_model', '"openai/gpt-4o-mini"', 'ai', 'Modele IA par defaut (OpenRouter)')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION update_app_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_app_config_timestamp ON app_config;
CREATE TRIGGER trigger_app_config_timestamp
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_app_config_timestamp();

-- ============================================
-- ÉTAPE 3 : Table ai_prompts
-- ============================================
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_name ON ai_prompts(name);
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read ai_prompts" ON ai_prompts;
CREATE POLICY "Public can read ai_prompts" ON ai_prompts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage ai_prompts" ON ai_prompts;
CREATE POLICY "Service role can manage ai_prompts" ON ai_prompts FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_ai_prompts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_prompts_timestamp ON ai_prompts;
CREATE TRIGGER trigger_ai_prompts_timestamp
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_timestamp();

-- Nettoyage app_config
DELETE FROM app_config WHERE key NOT IN ('default_model');
INSERT INTO app_config (key, value, category, description)
VALUES ('default_model', '"openai/gpt-4o-mini"', 'ai', 'Modèle IA par défaut (OpenRouter)')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ÉTAPE 4 : Table reservations (performance)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reservation_date DATE NOT NULL,
  type_reservation TEXT NOT NULL CHECK (type_reservation IN ('directe', 'autre')),
  montant_fcfa INTEGER DEFAULT 0,
  hotel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_profile_date ON public.reservations(profile_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservations;
CREATE POLICY "Users can insert own reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role can manage reservations" ON public.reservations;
CREATE POLICY "Service role can manage reservations" ON public.reservations FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ÉTAPE 5 : Table clients et configuration compte
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  derniere_visite DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_profile ON public.clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_derniere_visite ON public.clients(profile_id, derniere_visite);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role can manage clients" ON public.clients;
CREATE POLICY "Service role can manage clients" ON public.clients FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hotel_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS config_complete BOOLEAN DEFAULT false;

ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'baobab';
UPDATE public.reservations SET source = 'baobab' WHERE source IS NULL;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_source_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_source_check 
  CHECK (source IS NULL OR source IN ('baobab', 'import', 'autre'));
CREATE INDEX IF NOT EXISTS idx_reservations_source ON public.reservations(profile_id, source);
