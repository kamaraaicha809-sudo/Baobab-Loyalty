"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { isDemoMode } from "@/src/lib/demo";
import OnboardingModal from "./OnboardingModal";

/**
 * OnboardingGate
 * Vérifie si l'utilisateur a complété l'onboarding.
 * Si non, affiche la modale d'onboarding par-dessus le dashboard.
 * Rendu invisible en mode démo.
 */
export default function OnboardingGate() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) return;

    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        setProfileId(user.id);
        setShowOnboarding(true);
      }
    };

    check();
  }, []);

  const handleSkip = async () => {
    if (!profileId) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq("id", profileId);
    setShowOnboarding(false);
  };

  if (!showOnboarding || !profileId) return null;

  return (
    <OnboardingModal
      profileId={profileId}
      onComplete={() => setShowOnboarding(false)}
      onSkip={handleSkip}
    />
  );
}
