-- Migration 033: Identite fiscale de l'hotelier (necessaire au connecteur FNE)
-- Sans ncc, resolveTemplate() classe l'hotelier en B2C par defaut (cas nominal valide
-- par la DGI). Pas de formulaire d'onboarding pour ces champs dans cette passe :
-- a ajouter en fast follow si des hoteliers B2B (avec NCC) doivent etre factures en B2B.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ncc TEXT,
  ADD COLUMN IF NOT EXISTS rccm TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'CI';

COMMENT ON COLUMN profiles.ncc IS 'Numero de Compte Contribuable ivoirien - obligatoire pour facturer en template B2B (DGI/FNE)';
COMMENT ON COLUMN profiles.rccm IS 'Numero RCCM (Registre du Commerce) - accompagne le NCC pour les clients B2B';
COMMENT ON COLUMN profiles.country IS 'Code pays ISO (CI par defaut) - determine le template FNE (B2F si hors Cote d''Ivoire)';
