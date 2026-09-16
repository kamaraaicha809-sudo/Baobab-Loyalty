import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import SubscriptionGate from "@/components/dashboard/SubscriptionGate";
import TrialBanner from "@/components/dashboard/TrialBanner";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { ReactNode } from "react";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { isDemoMode, demoProfile } from "@/src/lib/demo";

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
  if (config.features.dashboardMaintenanceMode) {
    // Fermeture temporaire du dashboard (sauf role=admin) pendant la
    // préparation des hôtels partenaires. Vérifie le vrai rôle Supabase dès
    // que le backend est configuré, y compris quand NEXT_PUBLIC_DEMO_MODE
    // est actif : le mode démo ne doit jamais servir de contournement en
    // production (c'est ce qui a permis un accès public non voulu).
    const supabaseConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (isDemoMode && !supabaseConfigured) {
      if (demoProfile.role !== "admin") {
        redirect("/acces-limite");
      }
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      let isAdmin = false;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        isAdmin = profile?.role === "admin";
      }
      if (!isAdmin) {
        redirect("/acces-limite");
      }
    }
  } else if (!isDemoMode) {
    // Vérification d'auth côté serveur (sauf en mode démo)
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
