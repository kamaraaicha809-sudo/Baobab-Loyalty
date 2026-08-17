-- Migration 043: Un utilisateur ne peut appartenir qu'a une seule equipe
--
-- resolveProfile() (supabase/functions/_shared/team.ts) suppose qu'un
-- user_id n'a au plus une ligne dans team_members (.maybeSingle()). Si un
-- meme compte etait invite dans 2 hotels differents, .maybeSingle()
-- echouerait silencieusement (erreur ignoree, membership traite comme
-- null) et bloquerait l'acces de ce compte aux DEUX equipes sans aucun
-- message d'erreur explicite. Aucune violation en production au moment de
-- cette migration (verifie), mais rien n'empechait techniquement que cela
-- arrive. Cette contrainte transforme le futur echec silencieux en un rejet
-- explicite (23505), gere proprement par team-accept-invite.

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_user_id_key UNIQUE (user_id);
