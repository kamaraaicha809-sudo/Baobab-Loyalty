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
  customer_id: string | null;
  price_id: string | null;
  role?: string;
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

// Export as namespace
export const user = {
  getProfile,
};
