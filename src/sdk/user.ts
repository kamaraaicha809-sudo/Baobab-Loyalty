/**
 * User SDK module
 * Functions for user profile management
 */

import { callEdgeFunction } from "./_core";
import { isDemoMode, demoProfile } from "@/src/lib/demo";

// Types
export interface UserProfile {
  id: string;
  email: string;
  has_access: boolean;
  access_until?: string | null;
  trial_ends_at?: string | null;
  customer_id: string | null;
  price_id: string | null;
  role?: string;
  hotel_name?: string | null;
  config_complete?: boolean;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  ai_brand_voice?: string | null;
  ai_keywords_use?: string | null;
  ai_keywords_avoid?: string | null;
  ai_signature?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the current user's profile
 * Returns demo profile if NEXT_PUBLIC_DEMO_MODE=true
 */
export async function getProfile(): Promise<UserProfile> {
  // Mode démo : retourne un profil fictif
  if (isDemoMode) {
    return demoProfile as UserProfile;
  }

  return callEdgeFunction<UserProfile>("user-get-profile", {
    method: "GET",
  });
}

export interface BetaTrialActivationResult {
  activated: boolean;
  alreadyActive?: boolean;
  trialEndsAt?: string;
}

/**
 * Active l'essai bêta 14 jours pour le compte connecté (hôtels /signup?ref=beta).
 * Doit passer par une Edge Function : is_beta_tester et trial_ends_at ne sont
 * pas modifiables directement par un utilisateur authentifié (voir migration
 * 044_restrict_profiles_columns.sql).
 */
export async function activateBetaTrial(): Promise<BetaTrialActivationResult> {
  return callEdgeFunction<BetaTrialActivationResult>("profile-activate-beta-trial", {
    method: "POST",
  });
}

// Export as namespace
export const user = {
  getProfile,
  activateBetaTrial,
};
