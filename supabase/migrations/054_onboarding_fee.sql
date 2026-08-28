-- Migration 054: Frais d'integration (digitalisation du cahier papier)
--
-- Nouveaux hotels sans base de donnees electronique : un paiement unique de
-- 49 000 FCFA (ONBOARDING_FEE_XOF, voir _shared/plan.ts) couvre la
-- digitalisation de leur registre papier et la mise a disposition du
-- registre numerique (/dashboard/registre). Ce n'est PAS un plan
-- d'abonnement : ne touche jamais has_access / price_id / access_until,
-- traite separement dans billing-webhook (metadata.type = "onboarding_fee").

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_fee_paid_at timestamptz;

COMMENT ON COLUMN public.profiles.onboarding_fee_paid_at IS
  'Date de paiement du frais d''integration unique (49 000 FCFA). NULL = non paye. '
  'Ecrit uniquement par billing-webhook (service role) : volontairement absent du '
  'GRANT UPDATE colonne par colonne de la migration 044, donc non modifiable par '
  'un utilisateur authentifie via l''API REST.';
