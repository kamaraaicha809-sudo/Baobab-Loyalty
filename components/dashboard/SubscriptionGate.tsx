"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { user as userSdk } from "@/src/sdk";
import { isDemoMode } from "@/src/lib/demo";

const ALLOWED_WITHOUT_SUBSCRIPTION = [
  "/dashboard/configuration",
  "/dashboard/abonnement",
];

export default function SubscriptionGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isDemoMode) return;
    if (ALLOWED_WITHOUT_SUBSCRIPTION.some((p) => pathname.startsWith(p))) return;

    userSdk
      .getProfile()
      .then((profile) => {
        if (profile.onboarding_completed && !profile.has_access) {
          router.replace("/dashboard/abonnement");
        }
      })
      .catch(() => {
        // Cannot check profile — allow access
      });
  }, [pathname, router]);

  return null;
}
