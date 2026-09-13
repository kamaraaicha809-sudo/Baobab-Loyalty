-- Statut explicite "draft/validated" sur retention_policies : aucune duree
-- n est fixee definitivement par ce systeme -- les valeurs inserees en
-- 001_rgpd_foundation.sql (et ci-dessous) restent DRAFT tant qu''elles n ont
-- pas ete validees juridiquement (voir consigne explicite : ne jamais
-- decider une duree de conservation de maniere definitive sans validation).

ALTER TABLE public.retention_policies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated'));
ALTER TABLE public.retention_policies ADD COLUMN IF NOT EXISTS validated_by TEXT;
ALTER TABLE public.retention_policies ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- Toutes les valeurs existantes (posees en Phase 3) restent explicitement DRAFT.
UPDATE public.retention_policies SET status = 'draft' WHERE status IS NULL OR status = 'validated';

COMMENT ON COLUMN public.retention_policies.status IS
  'DRAFT = duree proposee techniquement, non validee juridiquement -- ne jamais s en servir pour declencher une suppression automatique reelle tant que status != validated. VALIDATED = confirmee par l''utilisatrice/son conseil juridique.';

-- Categories supplementaires demandees (prospects, campagnes, factures,
-- demandes RGPD, donnees supprimees/anonymisees) -- valeurs indicatives,
-- toutes DRAFT par defaut (status colonne ci-dessus).
INSERT INTO public.retention_policies (data_category, retention_period_months, legal_basis, deletion_method, status)
VALUES
  ('prospects_jamais_clients', 24, 'DRAFT -- proposition technique, base legale a confirmer (interet legitime prospection vs consentement)', 'anonymize', 'draft'),
  ('campagnes_et_sent_messages', 36, 'DRAFT -- duree alignee sur clients_inactifs a titre indicatif, a valider', 'anonymize', 'draft'),
  ('factures_facturation', 120, 'DRAFT -- obligation comptable typique de 10 ans en France, a confirmer par un comptable/conseil', 'hard_delete', 'draft'),
  ('demandes_rgpd', 36, 'DRAFT -- preuve de conformite en cas de controle, duree a valider', 'hard_delete', 'draft'),
  ('donnees_supprimees_anonymisees', 0, 'DRAFT -- une donnee anonymisee n''est plus une donnee personnelle (hors champ RGPD) des lors que la ré-identification est impossible ; a confirmer avec le conseil juridique avant de considerer ce champ comme clos', 'anonymize', 'draft')
ON CONFLICT (data_category) DO NOTHING;
