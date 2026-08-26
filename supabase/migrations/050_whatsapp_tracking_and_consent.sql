-- ============================================
-- Suivi reel des statuts WhatsApp (webhook Meta/360dialog)
-- + Gestion du consentement marketing (opt-in / opt-out)
-- ============================================

-- sent_messages : on garde l'ID du message cote fournisseur (Meta/360dialog)
-- pour pouvoir faire correspondre les callbacks de statut du webhook a la
-- bonne ligne, et on enregistre la raison d'un echec au lieu de la perdre.
ALTER TABLE public.sent_messages ADD COLUMN IF NOT EXISTS provider_message_id TEXT;
ALTER TABLE public.sent_messages ADD COLUMN IF NOT EXISTS error_code TEXT;
ALTER TABLE public.sent_messages ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.sent_messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.sent_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE public.sent_messages ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sent_messages_provider_message_id
  ON public.sent_messages(provider_message_id) WHERE provider_message_id IS NOT NULL;

-- clients : consentement marketing WhatsApp.
-- Decision produit (validee) : les clients deja importes ont une relation
-- commerciale existante avec l'hotel -> opt-in implicite par defaut, avec
-- desabonnement possible a tout moment (mot-cle STOP capte par le webhook,
-- ou action manuelle). Le DEFAULT true s'applique aussi aux lignes deja
-- existantes (Postgres remplit instantanement via le DEFAULT, sans reecrire
-- chaque ligne).
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS consent_source TEXT NOT NULL DEFAULT 'existing_relationship';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS opted_out_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_clients_marketing_consent
  ON public.clients(profile_id, marketing_consent);
