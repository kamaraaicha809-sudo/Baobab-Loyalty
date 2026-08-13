-- Migration 037: Accès multi-utilisateurs (plan Premium, 2 membres invités max)
--
-- Introduit un niveau d'indirection entre "l'utilisateur connecté" (auth.users)
-- et "le profil/hôtel auquel il a accès" (profiles). Jusqu'ici profiles.id ===
-- auth.users.id (1-pour-1). Un membre invité a un auth.users.id différent du
-- propriétaire, mais doit accéder aux mêmes données (clients, campagnes, etc.).
--
-- is_team_member() centralise cette vérification et remplace `auth.uid() =
-- profile_id` dans toutes les policies RLS existantes.

-- ============================================
-- 1. Tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  team_role TEXT NOT NULL CHECK (team_role IN ('admin', 'member')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, email)
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_role TEXT NOT NULL CHECK (team_role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_profile ON public.team_invitations(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_members_profile ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- ============================================
-- 2. Fonction is_team_member — coeur de la RLS multi-utilisateurs
-- SECURITY DEFINER pour contourner la RLS de team_members lors de son
-- propre EXISTS (sinon récursion : la policy de team_members appellerait
-- is_team_member qui relit team_members...).
-- ============================================

CREATE OR REPLACE FUNCTION public.is_team_member(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT target_profile_id = auth.uid()
     OR EXISTS (
       SELECT 1 FROM public.team_members
       WHERE profile_id = target_profile_id AND user_id = auth.uid()
     );
$$;

COMMENT ON FUNCTION public.is_team_member(UUID) IS 'Vrai si auth.uid() est le propriétaire du profil ou un membre invité (admin/member) de son équipe.';

-- ============================================
-- 3. RLS sur les nouvelles tables
-- Lecture pour toute l'équipe, écriture réservée au service_role
-- (toutes les mutations passent par les Edge Functions team-*)
-- ============================================

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view own invitations" ON public.team_invitations;
CREATE POLICY "Team can view own invitations" ON public.team_invitations
  FOR SELECT USING (is_team_member(profile_id));

DROP POLICY IF EXISTS "Service role manages invitations" ON public.team_invitations;
CREATE POLICY "Service role manages invitations" ON public.team_invitations
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Team can view own members" ON public.team_members;
CREATE POLICY "Team can view own members" ON public.team_members
  FOR SELECT USING (is_team_member(profile_id));

DROP POLICY IF EXISTS "Service role manages members" ON public.team_members;
CREATE POLICY "Service role manages members" ON public.team_members
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 4. Refonte des policies existantes : auth.uid() = profile_id
--    -> is_team_member(profile_id)
-- ============================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (is_team_member(id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (is_team_member(id));

-- clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (is_team_member(profile_id));

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (is_team_member(profile_id));

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (is_team_member(profile_id));

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (is_team_member(profile_id));

-- reservations
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (is_team_member(profile_id));

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservations;
CREATE POLICY "Users can insert own reservations" ON public.reservations FOR INSERT WITH CHECK (is_team_member(profile_id));

-- room_types
DROP POLICY IF EXISTS "Users can manage own room_types" ON public.room_types;
CREATE POLICY "Users can manage own room_types" ON public.room_types
  FOR ALL USING (is_team_member(profile_id)) WITH CHECK (is_team_member(profile_id));

-- offers
DROP POLICY IF EXISTS "Users can manage own offers" ON public.offers;
CREATE POLICY "Users can manage own offers" ON public.offers
  FOR ALL USING (is_team_member(profile_id)) WITH CHECK (is_team_member(profile_id));

-- segment_offers (accès via offers.profile_id)
DROP POLICY IF EXISTS "Users can manage segment_offers via offers" ON public.segment_offers;
CREATE POLICY "Users can manage segment_offers via offers" ON public.segment_offers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.offers o WHERE o.id = segment_offers.offer_id AND is_team_member(o.profile_id))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.offers o WHERE o.id = segment_offers.offer_id AND is_team_member(o.profile_id))
  );

-- campaigns
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL USING (is_team_member(profile_id)) WITH CHECK (is_team_member(profile_id));

-- sent_messages
DROP POLICY IF EXISTS "Users can manage own sent_messages" ON public.sent_messages;
CREATE POLICY "Users can manage own sent_messages" ON public.sent_messages
  FOR ALL USING (is_team_member(profile_id)) WITH CHECK (is_team_member(profile_id));

-- redemptions
DROP POLICY IF EXISTS "Users can manage own redemptions" ON public.redemptions;
CREATE POLICY "Users can manage own redemptions" ON public.redemptions
  FOR ALL USING (is_team_member(profile_id)) WITH CHECK (is_team_member(profile_id));

-- message_templates
DROP POLICY IF EXISTS "Users manage own templates" ON public.message_templates;
CREATE POLICY "Users manage own templates" ON public.message_templates
  FOR ALL USING (is_team_member(profile_id));

-- sync_logs
DROP POLICY IF EXISTS "Users can read own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can read own sync_logs" ON public.sync_logs FOR SELECT USING (is_team_member(profile_id));
