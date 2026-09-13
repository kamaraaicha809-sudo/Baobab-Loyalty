-- Registre des sous-traitants (Art. 28 RGPD) : documentation des
-- fournisseurs traitant des donnees pour le compte de Baobab Europe.
-- Table de configuration Baobab (pas de donnee par hotel) -- lecture/ecriture
-- reservees au service_role : c'est Baobab qui documente ses propres
-- sous-traitants, pas chaque hotel individuellement (les hotels en sont
-- informes via la politique de confidentialite, pas via un acces direct a
-- cette table).

CREATE TABLE IF NOT EXISTS public.subprocessors_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  service TEXT NOT NULL,
  data_categories TEXT[] NOT NULL DEFAULT '{}',
  purpose TEXT NOT NULL,
  location TEXT NOT NULL,
  sub_subprocessors TEXT,
  non_eea_transfer BOOLEAN NOT NULL DEFAULT false,
  transfer_safeguard TEXT,
  dpa_signed BOOLEAN NOT NULL DEFAULT false,
  dpa_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'terminated')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subprocessors_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages subprocessors registry" ON public.subprocessors_registry;
CREATE POLICY "Service role manages subprocessors registry" ON public.subprocessors_registry
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.subprocessors_registry IS
  'Registre Art. 28 des sous-traitants de Baobab Europe (Supabase, Stripe, Mistral, Meta, fournisseur email/SMS, analytics...). Statut "pending" tant que le DPA n''est pas signe et valide -- ne jamais activer un service dont le statut n''est pas "active" avec dpa_signed=true.';

-- Amorce documentaire : statuts refletant l etat reel a ce jour (aucun
-- service tiers Europe n est active -- voir Phase 2-4). A completer/valider
-- au fur et a mesure des decisions contractuelles (jamais unilateralement).
INSERT INTO public.subprocessors_registry (name, service, data_categories, purpose, location, non_eea_transfer, dpa_signed, status, notes)
VALUES
  ('Supabase', 'Base de donnees, authentification, Edge Functions', ARRAY['identite', 'contact', 'consentement', 'usage'], 'Hebergement de l''application Baobab Europe', 'Frankfurt, UE (eu-central-1)', false, false, 'pending', 'Projet Europe cree en region UE (Phase 2). DPA Supabase a verifier/signer avant mise en production reelle.'),
  ('Stripe', 'Paiement et facturation (Stripe Tax)', ARRAY['facturation'], 'Traitement des abonnements et de la TVA', 'UE (a confirmer selon compte Stripe)', false, false, 'pending', 'Non connecte -- architecture uniquement preparee (Billing Core), en attente de validation contractuelle.'),
  ('Mistral AI', 'Generation de contenu IA (AI Gateway)', ARRAY['statistiques agregees anonymisees'], 'Assistance a la redaction de campagnes', 'UE (La Plateforme)', false, false, 'pending', 'Non connecte -- en attente de validation contractuelle finale (DPA, conditions ZDR).'),
  ('Meta (WhatsApp Business)', 'Envoi de messages WhatsApp', ARRAY['contact', 'contenu du message'], 'Envoi de campagnes marketing WhatsApp', 'A confirmer selon configuration Meta Business Europe', true, false, 'pending', 'Non connecte pour Europe -- compte Meta Business Europe distinct requis.'),
  ('Fournisseur email (Resend ou equivalent)', 'Envoi d''emails transactionnels/marketing', ARRAY['contact', 'contenu du message'], 'Envoi de campagnes email et notifications', 'A confirmer', false, false, 'pending', 'Compte Europe distinct a creer si Resend est conserve, ou fournisseur alternatif EU a evaluer.'),
  ('Fournisseur SMS', 'Envoi de SMS marketing', ARRAY['contact', 'contenu du message'], 'Envoi de campagnes SMS', 'A determiner', false, false, 'pending', 'Aucun fournisseur SMS selectionne a ce jour -- canal SMS prepare au niveau schema (communication_preferences) mais non implemente.'),
  ('Outil analytics (PostHog ou equivalent)', 'Mesure d''audience', ARRAY['usage du site'], 'Analyse d''audience avec consentement', 'A confirmer pour Europe (instance EU requise)', false, false, 'pending', 'Afrique utilise PostHog avec bandeau de consentement -- verifier une instance/region EU dediee avant reutilisation pour Europe.')
ON CONFLICT (name) DO NOTHING;
