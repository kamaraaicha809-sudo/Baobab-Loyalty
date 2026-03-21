-- Migration 016: Message Templates
-- Stocke les templates de messages WhatsApp générés (manuellement ou depuis LinkedIn)

CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual',
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT source_check CHECK (source IN ('manual', 'linkedin'))
);

-- RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON public.message_templates
  FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Demo mode access" ON public.message_templates
  FOR ALL USING (profile_id = 'demo-user-id'::uuid);

CREATE POLICY "Service role bypass" ON public.message_templates
  FOR ALL TO service_role USING (true);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_message_templates_profile
  ON public.message_templates(profile_id, created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_message_templates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_message_templates_timestamp();

-- Prompt système par défaut pour la conversion LinkedIn → template
-- (configurable depuis /admin/ia)
INSERT INTO public.ai_prompts (name, description, content)
VALUES (
  'linkedin_to_template',
  'Convertit un post LinkedIn en template WhatsApp avec variables de personnalisation',
  'Tu es un expert en marketing hôtelier spécialisé dans les messages WhatsApp pour l''Afrique francophone.

Ton rôle : convertir le contenu d''un post LinkedIn en un template de message WhatsApp chaleureux et incitatif.

Règles OBLIGATOIRES :
1. Longueur : maximum 200 mots
2. Ton : chaleureux, personnel, professionnel (tu vouvoies le client)
3. Intègre EXACTEMENT ces variables là où elles sont pertinentes :
   - {{client_name}} : prénom du client
   - {{hotel_name}} : nom de l''hôtel
   - {{offer_discount}} : valeur de la réduction/avantage
   - {{valid_until}} : date limite de l''offre
4. Structure recommandée :
   - Accroche personnalisée avec {{client_name}}
   - Corps du message avec l''offre adaptée
   - Appel à l''action clair
5. NE PAS copier mot pour mot le post LinkedIn — adapter au format WhatsApp
6. Commencer directement par le message (pas de titre, pas d''explication)

Réponds UNIQUEMENT avec le template WhatsApp, rien d''autre.'
)
ON CONFLICT (name) DO NOTHING;
