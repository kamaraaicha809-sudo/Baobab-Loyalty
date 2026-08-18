-- Migration 044: Empeche l'auto-attribution d'acces payant / role admin
--
-- La migration 026 a fait "GRANT ALL ON public.profiles TO authenticated".
-- La policy RLS "Users can update own profile" (037) ne filtre que les LIGNES
-- (is_team_member(id)), pas les COLONNES : un utilisateur authentifie pouvait
-- donc appeler directement l'API REST Supabase pour s'auto-attribuer
-- has_access=true, price_id='premium' ou role='admin' sans jamais payer,
-- en contournant totalement Moneroo et le webhook de paiement.
--
-- Postgres n'a pas de securite au niveau colonne via RLS : on la fait via
-- des GRANTs colonne par colonne. Seuls les champs reellement modifies par
-- le frontend (app/dashboard/configuration/page.tsx) restent ouverts.
-- Tout le reste (facturation, role, etat WhatsApp/BSP, essai gratuit, flags
-- internes) ne peut plus etre modifie que par les Edge Functions via le
-- service role, qui n'est pas soumis aux GRANTs de authenticated.

REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  hotel_name,
  config_complete,
  adresse_physique,
  adresse_postale,
  email_principal,
  telephone_officiel,
  nom_responsable,
  telephone_responsable,
  email_responsable,
  latitude,
  longitude,
  reception_whatsapp,
  reception_email,
  ai_brand_voice,
  ai_keywords_use,
  ai_keywords_avoid,
  ai_signature,
  updated_at
) ON public.profiles TO authenticated;

-- Colonnes volontairement exclues de ce GRANT (modifiables uniquement par
-- une Edge Function en service role) :
--   role, has_access, price_id, trial_ends_at, customer_id, is_beta_tester,
--   email, full_name, avatar_url, onboarding_completed, onboarding_step,
--   whatsapp_phone_number_id, whatsapp_access_token, bsp_api_key,
--   bsp_phone_number, bsp_waba_id, bsp_channel_id, bsp_status, bsp_connected_at,
--   whatsapp_display_phone, ncc, rccm, country
