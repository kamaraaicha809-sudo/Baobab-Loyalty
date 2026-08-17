-- Migration 042: Index manquants sur des clés étrangères jointes fréquemment
--
-- Relevé par l'advisor de performance Supabase (unindexed_foreign_keys) :
-- ces colonnes servent à des jointures/filtres courants mais n'avaient pas
-- d'index dédié.

CREATE INDEX IF NOT EXISTS idx_campaigns_offer_id ON public.campaigns(offer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_segment_code ON public.campaigns(segment_code);
CREATE INDEX IF NOT EXISTS idx_reservations_room_type_id ON public.reservations(room_type_id);
CREATE INDEX IF NOT EXISTS idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_fne_credit_notes_origin_invoice_id ON public.fne_credit_notes(origin_invoice_id);
CREATE INDEX IF NOT EXISTS idx_sent_messages_offer_id ON public.sent_messages(offer_id);
