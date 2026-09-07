-- Migration 055: Empeche la lecture directe des identifiants WhatsApp via REST
--
-- La migration 044 a retire l'UPDATE en libre-service sur les colonnes
-- sensibles de profiles, mais n'a jamais touche au SELECT : "GRANT ALL ON
-- public.profiles TO authenticated" (migration 026) inclut toujours SELECT
-- sur TOUTES les colonnes, et la policy RLS "Users can view own profile"
-- (037) ne filtre que les LIGNES (is_team_member(id)), jamais les colonnes.
--
-- Consequence verifiee (compte de test jetable, cf. session du 2026-09-07) :
-- N'IMPORTE QUEL membre d'equipe (owner, admin, ou le role le plus bas
-- "member" invite via team-invite) peut appeler directement
-- GET /rest/v1/profiles?select=whatsapp_access_token,bsp_api_key avec son
-- propre JWT et recuperer le token d'acces WhatsApp Cloud API / la cle BSP
-- 360dialog en clair — sans jamais passer par une Edge Function. whatsapp-
-- status (index.ts) a beau ne jamais renvoyer ces champs dans sa reponse
-- JSON, cela ne protege en rien contre un appel REST direct.
--
-- Fix : meme technique que la migration 044, appliquee a SELECT. Seules
-- whatsapp_access_token et bsp_api_key sont retirees (les seules qui sont
-- de vrais secrets d'integration) ; toutes les autres colonnes restent
-- lisibles par l'equipe comme avant. Ces deux colonnes ne peuvent plus etre
-- lues que par le service_role (Edge Functions), qui n'est pas soumis a ces
-- GRANTs.

REVOKE SELECT ON public.profiles FROM authenticated;

GRANT SELECT (
  id,
  email,
  full_name,
  avatar_url,
  customer_id,
  role,
  created_at,
  updated_at,
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
  is_beta_tester,
  has_access,
  onboarding_completed,
  onboarding_step,
  whatsapp_phone_number_id,
  whatsapp_display_phone,
  bsp_phone_number,
  bsp_waba_id,
  bsp_channel_id,
  bsp_status,
  bsp_connected_at,
  reception_whatsapp,
  reception_email,
  price_id,
  trial_ends_at,
  ncc,
  rccm,
  country,
  ai_brand_voice,
  ai_keywords_use,
  ai_keywords_avoid,
  ai_signature,
  access_until,
  onboarding_fee_paid_at
) ON public.profiles TO authenticated;

-- Colonnes volontairement exclues de ce GRANT (lisibles uniquement par le
-- service_role via une Edge Function) :
--   whatsapp_access_token, bsp_api_key
--
-- Piege a eviter (decouvert en testant le parcours hotelier de bout en bout,
-- 2026-09-07) : un .update(...).select() cote frontend (Supabase JS) ou un
-- appel REST avec Prefer: return=representation SANS parametre ?select=
-- explicite demande a PostgREST un "RETURNING *" implicite sur profiles, qui
-- echoue desormais avec une erreur de permission (les deux colonnes exclues
-- ci-dessus n'etant plus SELECT-ables). Aujourd'hui, aucun code de l'app
-- (app/dashboard/configuration/page.tsx notamment) ne chaine .select() apres
-- un .update() sur profiles -> aucun impact reel. Mais tout nouveau code qui
-- le ferait doit soit ne pas chainer .select(), soit restreindre explicitement
-- les colonnes retournees (ex: .select("hotel_name, config_complete")).
