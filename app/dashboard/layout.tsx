import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { ReactNode } from "react";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/src/lib/demo";
import { headers } from "next/headers";

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
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const setupUrl = (config.auth as { setupUrl?: string }).setupUrl;
    const isOnConfigPage = pathname.includes("/configuration") || pathname === "";
    if (setupUrl && !isOnConfigPage) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("config_complete")
        .eq("id", user.id)
        .single();
      if (profile && (profile.config_complete === false || profile.config_complete === null)) {
        redirect(setupUrl);
      }
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
