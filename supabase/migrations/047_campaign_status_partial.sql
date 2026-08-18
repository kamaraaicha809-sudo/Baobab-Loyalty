-- Ajoute un statut "completed_with_errors" aux campagnes.
-- Avant, campaign-send ne marquait "failed" que si TOUS les envois avaient
-- echoue : une campagne a 500 destinataires avec 490 echecs et 10 succes
-- etait affichee "completed", comme si tout s'etait bien passe.

ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('draft', 'sending', 'completed', 'completed_with_errors', 'failed'));
