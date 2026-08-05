-- Migration 028: Table survey_responses
-- Stocke les reponses aux sondages de satisfaction envoyes aux clients via WhatsApp

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_name  text        NOT NULL,
  discount    integer     NOT NULL DEFAULT 0,
  answers     jsonb       NOT NULL DEFAULT '{}',
  submitted_at timestamptz DEFAULT now()
);

-- Index pour requeter par hotel
CREATE INDEX idx_survey_responses_hotel ON public.survey_responses (hotel_name);
CREATE INDEX idx_survey_responses_submitted_at ON public.survey_responses (submitted_at DESC);

-- RLS : les insertions se font via service role (API route /api/survey)
-- Aucune lecture directe par les utilisateurs anon ou authenticated
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Acces GRANT pour la Data API
GRANT ALL ON public.survey_responses TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
