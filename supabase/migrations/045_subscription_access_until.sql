-- Ajoute une date d'expiration explicite a l'acces payant.
-- Avant cette migration, has_access=true restait vrai indefiniment apres un
-- seul paiement Moneroo (pas d'abonnement recurrent reel cote Moneroo) :
-- un client qui ne renouvelait jamais gardait donc l'acces payant a vie.
-- access_until est desormais la source de verite pour la duree de l'acces
-- (voir hasActiveAccess() dans _shared/access.ts et src/lib/access.ts).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS access_until TIMESTAMPTZ;
