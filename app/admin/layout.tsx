import AdminLayout from "@/components/admin/AdminLayout";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { ReactNode } from "react";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { isDemoMode, demoProfile } from "@/src/lib/demo";

// Metadata noindex pour les pages privées admin
export const metadata = getSEOTags({
  title: `Administration | ${config.appName}`,
  description: "Interface d'administration pour gérer la configuration et les paramètres.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
});

/**
 * Admin Layout Server Component
 * Vérifie l'auth et le rôle admin côté serveur
 */
export default async function Layout({ children }: { children: ReactNode }) {
  // Vérification d'auth et rôle admin côté serveur (sauf en mode démo)
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/signin");
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/dashboard");
    }
  } else {
    // En mode démo, vérifier que le profil demo est admin
    if (demoProfile.role !== "admin") {
      redirect("/dashboard");
    }
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}
