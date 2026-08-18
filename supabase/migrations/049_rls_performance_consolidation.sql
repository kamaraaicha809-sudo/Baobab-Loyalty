-- Consolide les policies RLS redondantes (216 cas) et corrige les appels
-- auth.<fn>() re-evalues ligne par ligne (15 cas), signales par les
-- Supabase Advisors. Deux causes distinctes, une seule migration :
--
-- 1. auth_rls_initplan : `auth.uid()`/`auth.role()` appeles directement dans
--    une policy sont re-executes a CHAQUE ligne. Les envelopper dans
--    `(select auth.role())` transforme l'appel en sous-requete non correlee
--    que Postgres n'evalue qu'UNE FOIS par requete (InitPlan). is_team_member()
--    etant appelee par la quasi-totalite des policies de l'app, corriger son
--    propre auth.uid() interne beneficie a toutes les tables d'un coup.
--
-- 2. multiple_permissive_policies : la plupart des tables avaient a la fois
--    une policy "Users can manage own X" (is_team_member) ET une policy
--    "Service role X" separee, toutes deux avec roles={public} — Postgres
--    doit donc evaluer LES DEUX policies pour chaque ligne lue par un
--    utilisateur authentifie, meme si seule la premiere le concerne
--    reellement. On les fusionne en une seule policy par commande.

-- ============================================
-- 1. is_team_member() — correctif a fort effet de levier
-- ============================================

CREATE OR REPLACE FUNCTION public.is_team_member(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT target_profile_id = (select auth.uid())
     OR EXISTS (
       SELECT 1 FROM public.team_members
       WHERE profile_id = target_profile_id AND user_id = (select auth.uid())
     );
$$;

-- ============================================
-- 2. ai_prompts
-- ============================================
DROP POLICY IF EXISTS "Service role can manage ai_prompts" ON public.ai_prompts;
CREATE POLICY "Service role can manage ai_prompts" ON public.ai_prompts
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ============================================
-- 3. app_config
-- ============================================
DROP POLICY IF EXISTS "Service role can manage app_config" ON public.app_config;
DROP POLICY IF EXISTS "Public can read app_config" ON public.app_config;
CREATE POLICY "app_config_select" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "app_config_service_insert" ON public.app_config FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "app_config_service_update" ON public.app_config FOR UPDATE
  USING ((select auth.role()) = 'service_role');
CREATE POLICY "app_config_service_delete" ON public.app_config FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 4. campaigns
-- ============================================
DROP POLICY IF EXISTS "Service role campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "campaigns_access" ON public.campaigns FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 5. clients
-- ============================================
DROP POLICY IF EXISTS "Service role can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "clients_access" ON public.clients FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 6. message_templates
-- ============================================
DROP POLICY IF EXISTS "Service role bypass" ON public.message_templates;
DROP POLICY IF EXISTS "Users manage own templates" ON public.message_templates;
CREATE POLICY "message_templates_access" ON public.message_templates FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 7. offers
-- ============================================
DROP POLICY IF EXISTS "Service role offers" ON public.offers;
DROP POLICY IF EXISTS "Users can manage own offers" ON public.offers;
CREATE POLICY "offers_access" ON public.offers FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 8. profiles
-- (INSERT/DELETE n'ont jamais ete ouverts aux membres d'equipe — seul
-- handle_new_user, SECURITY DEFINER, cree une ligne profiles, et cela
-- contourne RLS independamment de ces policies)
-- ============================================
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING ((select auth.role()) = 'service_role' OR is_team_member(id));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING ((select auth.role()) = 'service_role' OR is_team_member(id));
CREATE POLICY "profiles_service_insert" ON public.profiles FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "profiles_service_delete" ON public.profiles FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 9. rate_limit_hits
-- ============================================
DROP POLICY IF EXISTS "Service role rate_limit_hits" ON public.rate_limit_hits;
CREATE POLICY "Service role rate_limit_hits" ON public.rate_limit_hits
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ============================================
-- 10. redemptions
-- ============================================
DROP POLICY IF EXISTS "Service role redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Users can manage own redemptions" ON public.redemptions;
CREATE POLICY "redemptions_access" ON public.redemptions FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 11. reservations
-- (UPDATE/DELETE n'ont jamais ete ouverts aux membres d'equipe — toutes les
-- mutations passent par des routes service-role : /api/reservations/create,
-- team/campaign edge functions)
-- ============================================
DROP POLICY IF EXISTS "Service role can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "reservations_select" ON public.reservations FOR SELECT
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id));
CREATE POLICY "reservations_insert" ON public.reservations FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));
CREATE POLICY "reservations_service_update" ON public.reservations FOR UPDATE
  USING ((select auth.role()) = 'service_role');
CREATE POLICY "reservations_service_delete" ON public.reservations FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 12. room_types
-- ============================================
DROP POLICY IF EXISTS "Service role room_types" ON public.room_types;
DROP POLICY IF EXISTS "Users can manage own room_types" ON public.room_types;
CREATE POLICY "room_types_access" ON public.room_types FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 13. segment_offers
-- ============================================
DROP POLICY IF EXISTS "Service role segment_offers" ON public.segment_offers;
DROP POLICY IF EXISTS "Users can manage segment_offers via offers" ON public.segment_offers;
CREATE POLICY "segment_offers_access" ON public.segment_offers FOR ALL
  USING (
    (select auth.role()) = 'service_role'
    OR EXISTS (SELECT 1 FROM public.offers o WHERE o.id = segment_offers.offer_id AND is_team_member(o.profile_id))
  )
  WITH CHECK (
    (select auth.role()) = 'service_role'
    OR EXISTS (SELECT 1 FROM public.offers o WHERE o.id = segment_offers.offer_id AND is_team_member(o.profile_id))
  );

-- ============================================
-- 14. segments (deja correctement scope a service_role, juste un nettoyage)
-- ============================================
DROP POLICY IF EXISTS "Service role manages segments" ON public.segments;
CREATE POLICY "Service role manages segments" ON public.segments
  FOR ALL TO service_role USING (true);

-- ============================================
-- 15. sent_messages
-- ============================================
DROP POLICY IF EXISTS "Service role sent_messages" ON public.sent_messages;
DROP POLICY IF EXISTS "Users can manage own sent_messages" ON public.sent_messages;
CREATE POLICY "sent_messages_access" ON public.sent_messages FOR ALL
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id))
  WITH CHECK ((select auth.role()) = 'service_role' OR is_team_member(profile_id));

-- ============================================
-- 16. sync_logs (ecriture reservee au service_role : seul clients-email-sync y ecrit)
-- ============================================
DROP POLICY IF EXISTS "Service role sync_logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can read own sync_logs" ON public.sync_logs;
CREATE POLICY "sync_logs_select" ON public.sync_logs FOR SELECT
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id));
CREATE POLICY "sync_logs_service_insert" ON public.sync_logs FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "sync_logs_service_update" ON public.sync_logs FOR UPDATE
  USING ((select auth.role()) = 'service_role');
CREATE POLICY "sync_logs_service_delete" ON public.sync_logs FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 17. team_invitations (ecriture reservee au service_role : team-invite/team-accept-invite/team-remove-member)
-- ============================================
DROP POLICY IF EXISTS "Service role manages invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team can view own invitations" ON public.team_invitations;
CREATE POLICY "team_invitations_select" ON public.team_invitations FOR SELECT
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id));
CREATE POLICY "team_invitations_service_insert" ON public.team_invitations FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "team_invitations_service_update" ON public.team_invitations FOR UPDATE
  USING ((select auth.role()) = 'service_role');
CREATE POLICY "team_invitations_service_delete" ON public.team_invitations FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 18. team_members (ecriture reservee au service_role : team-accept-invite/team-remove-member)
-- ============================================
DROP POLICY IF EXISTS "Service role manages members" ON public.team_members;
DROP POLICY IF EXISTS "Team can view own members" ON public.team_members;
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT
  USING ((select auth.role()) = 'service_role' OR is_team_member(profile_id));
CREATE POLICY "team_members_service_insert" ON public.team_members FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "team_members_service_update" ON public.team_members FOR UPDATE
  USING ((select auth.role()) = 'service_role');
CREATE POLICY "team_members_service_delete" ON public.team_members FOR DELETE
  USING ((select auth.role()) = 'service_role');
