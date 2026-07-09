"use client";

import { useEffect, useState } from "react";
import { user as userSdk } from "@/src/sdk";
import { isDemoMode, demoProfile } from "@/src/lib/demo";
import { isPremiumPlan } from "@/src/lib/plan";

/**
 * Returns whether the current account is on the Premium plan.
 * null while the check is in flight, true/false once resolved.
 */
export function usePremiumAccess(): boolean | null {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setIsPremium(isPremiumPlan(demoProfile.price_id));
      return;
    }
    userSdk
      .getProfile()
      .then((profile) => setIsPremium(isPremiumPlan(profile.price_id)))
      .catch(() => setIsPremium(false));
  }, []);

  return isPremium;
}
