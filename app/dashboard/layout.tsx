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
  if (config.features.dashboardMaintenanceMode) {
    // Fermeture temporaire du dashboard au public pendant la préparation des
    // hôtels partenaires. Seule la présence d'une session authentifiée
    // compte : /signup est fermé (voir signupsPaused), donc le seul moyen de
    // s'authentifier reste le parcours controlé /beta (email + code a 6
    // chiffres). Un visiteur qui n'a pas franchi cette etape est redirige
    // vers /acces-limite ; quelqu'un qui vient de verifier son code doit au
    // contraire acceder directement au dashboard, sans etape supplementaire.
    // Verifie la vraie session Supabase des que le backend est configure,
    // y compris quand NEXT_PUBLIC_DEMO_MODE est actif : le mode demo ne doit
    // plus jamais servir de contournement en production (c'est ce qui a
    // permis un acces public non voulu au depart).
    const supabaseConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (!isDemoMode || supabaseConfigured) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
