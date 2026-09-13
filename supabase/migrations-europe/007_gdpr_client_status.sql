-- Statuts RGPD portes par chaque client : limitation du traitement (Art. 18)
-- et anonymisation (distincte d'une suppression completes -- voir workflow
-- d'effacement, qui choisit entre suppression et anonymisation selon la
-- presence de donnees liees a conserver : sent_messages, redemptions,
-- reservations).

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS processing_restricted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS processing_restricted_at TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS anonymized BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_clients_processing_restricted
  ON public.clients(profile_id, processing_restricted) WHERE processing_restricted = true;

COMMENT ON COLUMN public.clients.processing_restricted IS
  'Art. 18 RGPD : le traitement est limite, ce client ne doit plus etre utilise normalement (campagnes marketing incluses) sans etre supprime du CRM.';
COMMENT ON COLUMN public.clients.anonymized IS
  'true si ce client a fait l objet d une anonymisation (droit a l effacement, mais donnees liees -- sent_messages/redemptions/reservations -- conservees pour les statistiques). nom/email/telephone/whatsapp sont alors NULL.';
