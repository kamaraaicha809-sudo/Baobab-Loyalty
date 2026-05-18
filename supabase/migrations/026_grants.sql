-- Migration 026: GRANTs explicites pour la Data API Supabase
-- A partir du 30 mai 2025, les nouvelles tables ne sont plus accessibles
-- automatiquement sans GRANT explicite.

-- Acces au schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Tables accessibles par les utilisateurs authentifies (RLS contr le les lignes)
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.reservations TO authenticated;
GRANT ALL ON public.room_types TO authenticated;
GRANT ALL ON public.offers TO authenticated;
GRANT ALL ON public.segments TO authenticated;
GRANT ALL ON public.segment_offers TO authenticated;
GRANT ALL ON public.campaigns TO authenticated;
GRANT ALL ON public.sent_messages TO authenticated;
GRANT ALL ON public.redemptions TO authenticated;
GRANT ALL ON public.message_templates TO authenticated;
GRANT ALL ON public.ai_prompts TO authenticated;
GRANT ALL ON public.app_config TO authenticated;
GRANT ALL ON public.sync_logs TO authenticated;

-- Sequences (pour les INSERT avec serial/bigserial)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Acces anonyme minimal (page /offre publique)
GRANT SELECT ON public.offers TO anon;
GRANT SELECT ON public.segments TO anon;

-- Privileges par defaut pour les tables creees APRES le 30 mai
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
