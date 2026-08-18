-- Comble access_until pour les comptes deja payants avant l'introduction de
-- cette colonne (045_subscription_access_until.sql). Sans ce backfill,
-- hasActiveAccess() aurait immediatement coupe l'acces de tous les clients
-- payants existants (has_access=true mais access_until=NULL).
-- On accorde 1 mois a partir de maintenant, equivalent a un paiement recu
-- aujourd'hui : ces clients devront payer normalement au mois suivant.

UPDATE public.profiles
SET access_until = now() + interval '1 month'
WHERE has_access = true
  AND access_until IS NULL;
