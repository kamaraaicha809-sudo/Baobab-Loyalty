-- Etend data_subject_requests (001_rgpd_foundation.sql) en un vrai workflow
-- de traitement (Phase RGPD complete) : verification d'identite, echeance
-- legale, responsable assigne, actions effectuees, cloture, justification.
-- Statuts alignes sur le cycle de vie demande par l'utilisatrice.

ALTER TABLE public.data_subject_requests DROP CONSTRAINT IF EXISTS data_subject_requests_status_check;
ALTER TABLE public.data_subject_requests ADD CONSTRAINT data_subject_requests_status_check
  CHECK (status IN ('received', 'identity_verification', 'in_progress', 'completed', 'rejected', 'partially_completed'));

ALTER TABLE public.data_subject_requests ALTER COLUMN status SET DEFAULT 'received';

ALTER TABLE public.data_subject_requests DROP CONSTRAINT IF EXISTS data_subject_requests_request_type_check;
ALTER TABLE public.data_subject_requests ADD CONSTRAINT data_subject_requests_request_type_check
  CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'));

ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMPTZ;
ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS identity_verification_method TEXT;
-- Echeance legale (Art. 12.3 RGPD : 1 mois, extensible a 3 pour les demandes
-- complexes) -- calculee automatiquement a la reception, jamais laissee vide.
ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;
ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS actions_taken TEXT;
ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS justification TEXT;
ALTER TABLE public.data_subject_requests ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- completed_at existait deja (001) mais gardait un sens ambigu vis-a-vis de
-- closed_at (une demande rejetee ou partiellement traitee est aussi "close").
-- closed_at devient la date de cloture quel que soit le statut final ;
-- completed_at reste specifique a "completed" pour compatibilite avec le
-- code deja ecrit qui pourrait le lire.
COMMENT ON COLUMN public.data_subject_requests.completed_at IS
  'Renseigne uniquement quand status=completed. Voir closed_at pour la date de cloture quel que soit le statut final (rejected/partially_completed inclus).';

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_due_at
  ON public.data_subject_requests(profile_id, due_at) WHERE status NOT IN ('completed', 'rejected');

CREATE OR REPLACE FUNCTION public.set_gdpr_request_due_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.due_at IS NULL THEN
    NEW.due_at := NEW.requested_at + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gdpr_request_due_at ON public.data_subject_requests;
CREATE TRIGGER trg_gdpr_request_due_at
  BEFORE INSERT ON public.data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_gdpr_request_due_at();

COMMENT ON TABLE public.data_subject_requests IS
  'Registre des demandes RGPD (Art. 15-21). due_at calcule automatiquement a 1 mois (Art. 12.3). Workflow : received -> identity_verification -> in_progress -> completed/rejected/partially_completed.';
