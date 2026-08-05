import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import SubscriptionGate from "@/components/dashboard/SubscriptionGate";
import TrialBanner from "@/components/dashboard/TrialBanner";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { ReactNode } from "react";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/src/lib/demo";

// Metadata noindex pour les pages privées du dashboard
export const metadata = getSEOTags({
  title: `Dashboard | ${config.appName}`,
  description: "Votre espace personnel pour gérer vos contenus et paramètres.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
});

export default async function Layout({ children }: { children: ReactNode }) {
  // Vérification d'auth côté serveur (sauf en mode démo)
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect(config.auth.loginUrl);
    }
  }

  return (
    <DashboardLayout>
      <OnboardingGate />
      <SubscriptionGate />
      <TrialBanner />
      {children}
    </DashboardLayout>
  );
}
