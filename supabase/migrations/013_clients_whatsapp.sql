-- ============================================
-- Clients : ajout colonne whatsapp dédiée
-- ============================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS whatsapp TEXT;

CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON public.clients(profile_id, whatsapp) WHERE whatsapp IS NOT NULL;
