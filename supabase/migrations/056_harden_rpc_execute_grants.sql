-- Migration 056: Durcissement mineur — retire l'exécution anonyme de deux RPC
--
-- L'auditeur de sécurité Supabase signale get_segment_counts() et
-- get_reservations_chart() comme exécutables par le rôle anon (non connecté)
-- via /rest/v1/rpc/... Ces deux fonctions vérifient déjà is_team_member() en
-- interne et rejettent (RAISE EXCEPTION) tout appelant qui n'est pas membre
-- de l'équipe du profil demandé — vérifié par test réel (compte anonyme +
-- JWT d'un autre hôtel -> "Accès refusé" dans les deux cas). Ce n'est donc
-- pas une faille exploitable, mais on retire quand même l'exécution anonyme
-- par défense en profondeur : aucun appel légitime ne vient jamais du rôle
-- anon (uniquement du dashboard, avec un utilisateur connecté).
--
-- is_team_member() et is_team_admin() ne sont PAS touchées ici : elles sont
-- utilisées à l'intérieur même de policies RLS sur des tables lisibles par
-- anon (offers, segments, audit_log via defaults), donc leur retirer
-- l'exécution anonyme risquerait de casser l'évaluation de ces policies
-- pour le rôle anon (erreur de permission au lieu d'un filtrage silencieux).
-- handle_new_user() et enforce_room_types_limit() ne sont pas touchées non
-- plus : ce sont des fonctions TRIGGER (RETURNS trigger), non invocables
-- directement via SQL/RPC quel que soit le GRANT (Postgres l'interdit
-- nativement) — le signalement de l'auditeur est un faux positif inoffensif.

-- Postgres accorde EXECUTE a PUBLIC par defaut a la creation d'une fonction ;
-- un simple "REVOKE ... FROM anon" ne suffit pas tant que ce GRANT implicite
-- a PUBLIC subsiste (anon en herite comme tout le monde) — verifie via
-- information_schema.routine_privileges avant ce correctif. On revoque donc
-- de PUBLIC, puis on re-accorde explicitement a authenticated (seul rôle qui
-- doit garder l'acces, pour le dashboard connecte).
REVOKE EXECUTE ON FUNCTION public.get_segment_counts(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_reservations_chart(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_segment_counts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_reservations_chart(UUID) TO authenticated;
