"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { user as userSdk } from "@/src/sdk";
import { isDemoMode } from "@/src/lib/demo";
import { trialDaysRemaining } from "@/src/lib/access";

export default function TrialBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (isDemoMode) return;
    userSdk
      .getProfile()
      .then((profile) => {
        if (profile.has_access) return;
        const days = trialDaysRemaining(profile.trial_ends_at);
        if (days > 0) setDaysLeft(days);
      })
      .catch(() => {
        // Impossible de vérifier le profil — ne rien afficher
      });
  }, []);

  if (daysLeft === null) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
      Essai gratuit : <strong>{daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}</strong>
      {" — "}
      <Link href="/dashboard/abonnement" className="underline font-medium">
        Choisir un plan
      </Link>
    </div>
  );
}
