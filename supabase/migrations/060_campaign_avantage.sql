-- Migration 060: Texte de l'offre memorise sur chaque campagne — projet Afrique
--
-- Le bouton "Reserver mon offre" du template WhatsApp baobab_offre_reservation
-- pointe vers https://baobabloyalty.com/o/{sent_messages.id}. La route /o/[id]
-- retrouve le message, son client et sa campagne pour ouvrir /offre deja
-- pre-remplie : l'avantage propose (ex : "20% de reduction sur votre chambre")
-- doit donc etre conserve avec la campagne. campaign-send recevait deja ce
-- champ sans le stocker.
--
-- Aucune nouvelle policy : la table campaigns a deja RLS active (010) et la
-- lecture par /o/[id] passe par le service role cote serveur.

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS avantage TEXT;

COMMENT ON COLUMN public.campaigns.avantage IS
  'Texte de l''offre envoyee (ex : 20% de reduction sur votre chambre), affiche sur /offre via /o/[id]';
