-- Migration Europe 017 : mise a jour du registre des sous-traitants (art. 28/30)
--
-- Revue de conformite du 29/09/2026 (garanties verifiees sur les pages
-- officielles des prestataires) :
--   - Vercel et OpenRouter etaient utilises mais absents du registre ;
--   - Resend etait marque "sans transfert hors UE" alors que la societe est
--     americaine (DPF + clauses contractuelles types) ;
--   - PostHog : non actif sur loyavia.com (aucune cle configuree).
-- Aucun statut n'est passe a "active" et aucun DPA n'est marque signe :
-- ces deux champs restent a renseigner a la signature effective.

INSERT INTO public.subprocessors_registry (name, service, data_categories, purpose, location, non_eea_transfer, transfer_safeguard, dpa_signed, status, notes)
VALUES
  ('Vercel', 'Hebergement du site et du dashboard', ARRAY['usage', 'journaux techniques'], 'Diffusion du site loyavia.com et du dashboard', 'Etats-Unis (reseau mondial)', true,
   'Certifie EU-US Data Privacy Framework + clauses contractuelles types (DPA Vercel)', false, 'pending', 'Utilise en production depuis la Phase 2 ; DPA Vercel a accepter formellement.'),
  ('OpenRouter', 'Passerelle vers les modeles d''IA', ARRAY['contenu saisi par l''hotelier (offre, segment, nom de l''hotel, preferences de marque)'], 'Generation de messages de campagne', 'Etats-Unis + fournisseurs de modeles appeles', true,
   'Adequation / clauses contractuelles types selon la politique OpenRouter ; DPA signe reserve aux comptes Enterprise', false, 'pending', 'Aucune donnee de client final envoyee. OPENROUTER_API_KEY absent du Vault Europe : IA inactive en Europe au 29/09/2026.')
ON CONFLICT (name) DO NOTHING;

UPDATE public.subprocessors_registry
SET location = 'Etats-Unis', non_eea_transfer = true,
    transfer_safeguard = 'Certifie EU-US Data Privacy Framework + clauses contractuelles types (DPA Resend)',
    notes = 'Resend utilise pour loyavia.com (domaine verifie le 15/09/2026) : e-mails de service et newsletter.',
    updated_at = now()
WHERE name = 'Fournisseur email (Resend ou equivalent)';

UPDATE public.subprocessors_registry
SET transfer_safeguard = 'Certifie EU-US Data Privacy Framework ; instance UE (Francfort) disponible',
    notes = 'Non actif sur loyavia.com au 29/09/2026 (aucune cle PostHog sur le projet Vercel Europe). Si active : instance UE et consentement prealable.',
    updated_at = now()
WHERE name = 'Outil analytics (PostHog ou equivalent)';

UPDATE public.subprocessors_registry
SET transfer_safeguard = 'Donnees a Francfort ; clauses contractuelles types (modules 2 et 3) du DPA Supabase pour l''acces depuis les Etats-Unis ; non certifie DPF ; TIA fournie par Supabase',
    updated_at = now()
WHERE name = 'Supabase';

UPDATE public.subprocessors_registry
SET transfer_safeguard = 'WhatsApp Ireland / WhatsApp LLC certifies EU-US Data Privacy Framework ; clauses contractuelles types en repli',
    updated_at = now()
WHERE name = 'Meta (WhatsApp Business)';
