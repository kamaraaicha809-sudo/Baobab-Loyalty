-- Migration 034: Durcissement securite du schema FNE (retours du linter Supabase)
-- search_path fixe sur les fonctions ajoutees en 032, pour eviter le detournement
-- de search_path (recommandation Supabase, meme pattern que handle_new_user).
--
-- Note : pg_net reste dans le schema public par choix de la plateforme Supabase
-- (extension non "relocatable" : ALTER EXTENSION ... SET SCHEMA echoue). C'est un
-- avertissement mineur du linter, pas corrigeable depuis une migration.

ALTER FUNCTION update_invoices_timestamp() SET search_path = public;
ALTER FUNCTION fne_certifications_append_only() SET search_path = public;
