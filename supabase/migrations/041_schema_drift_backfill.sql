-- Migration 041: Comble la dérive entre migrations locales et schéma réel
-- + corrige une faille RLS découverte en écrivant cette migration
--
-- L'audit base de données a trouvé un objet créé hors du flux de migrations
-- (probablement via le SQL Editor du dashboard) :
--   - table sync_logs (référencée dans une policy à la migration 037, mais
--     jamais créée par aucune migration)
--   - room_types.nombre_chambres (colonne vivante en production, absente de
--     007_room_types.sql)
--
-- En reconstituant sync_logs, la policy réellement en place en production
-- s'est avérée dangereuse : "Service role full access sync_logs" était
-- FOR ALL USING (true) SANS restriction TO service_role (roles: {public}).
-- Combiné au GRANT SELECT/INSERT/UPDATE/DELETE par défaut accordé à anon
-- (migration 026), n'importe qui pouvait lire/modifier/supprimer n'importe
-- quelle ligne de sync_logs sans authentification — confirmé par un test en
-- lecture (SET ROLE anon) qui a bien renvoyé une ligne insérée par un autre
-- rôle. Cette migration remplace cette policy par une version correctement
-- restreinte à service_role.

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'email',
  statut TEXT NOT NULL DEFAULT 'success',
  clients_ajoutes INTEGER DEFAULT 0,
  clients_en_erreur INTEGER DEFAULT 0,
  message_erreur TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_profile_id ON public.sync_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can read own sync_logs" ON public.sync_logs
  FOR SELECT USING (public.is_team_member(profile_id));

-- Remplace la policy dangereuse "Service role full access sync_logs"
-- (USING (true), roles: {public}) par une version restreinte.
DROP POLICY IF EXISTS "Service role full access sync_logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Service role sync_logs" ON public.sync_logs;
CREATE POLICY "Service role sync_logs" ON public.sync_logs
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE public.room_types ADD COLUMN IF NOT EXISTS nombre_chambres INTEGER DEFAULT 0;

-- sync_logs est un journal interne (import CSV) : anon n'a besoin d'aucun
-- accès. Les GRANT larges observés en production (INSERT/UPDATE/DELETE)
-- dépassaient déjà ce que les autres tables publiques reçoivent.
REVOKE ALL ON public.sync_logs FROM anon;
