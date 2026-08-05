-- Migration 030: Stocke le numero WhatsApp affichable (distinct du phone_number_id technique Meta)
-- Le phone_number_id est un identifiant interne Meta, pas un numero de telephone lisible

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS whatsapp_display_phone TEXT;

COMMENT ON COLUMN profiles.whatsapp_display_phone IS 'Numero WhatsApp affichable (ex: +2250700000000), recupere via Graph API a la connexion';
