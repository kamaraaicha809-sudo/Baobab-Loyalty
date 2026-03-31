"use client";

import { useState, ReactNode, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { isDemoMode, demoUser, demoProfile } from "@/src/lib/demo";
import { User } from "@/types";

// Garde : en mode démo, rediriger vers signin si l'utilisateur n'a pas "connecté"
// Accepte ?demo=1 pour activer automatiquement (iframe depuis /presentation)
function DemoAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isDemoMode) {
      setChecked(true);
      return;
    }
    if (typeof window === "undefined") return;

    const hasDemoParam = searchParams.get("demo") === "1";
    const hasDemoFlag = sessionStorage.getItem("demo_logged_in") === "1";

    if (hasDemoParam && !hasDemoFlag) {
      sessionStorage.setItem("demo_logged_in", "1");
    }

    if (!hasDemoFlag && !hasDemoParam) {
      router.replace("/signin");
      return;
    }
    setChecked(true);
  }, [router, searchParams]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}

interface BaseLayoutProps {
  children: ReactNode;
  bannerColor?: "yellow" | "amber";
  bannerMessage?: string;
  requireAdmin?: boolean;
}

/**
 * Layout de base partagé entre Dashboard et Admin
 * Gère la récupération de l'utilisateur et l'affichage de la sidebar
 */
export default function BaseLayout({ 
  children, 
  bannerColor = "yellow",
  bannerMessage,
  requireAdmin = false 
}: BaseLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // En mode démo, initialiser l'utilisateur demo
  // En mode normal, récupérer l'utilisateur depuis le client (pour affichage dans Sidebar)
  useEffect(() => {
    if (isDemoMode) {
      const demoUserData = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.user_metadata.full_name || (requireAdmin ? "Admin Demo" : "Utilisateur Demo"),
        role: demoProfile.role,
      };
      
      // En mode admin, vérifier que le rôle est admin
      if (requireAdmin && demoProfile.role !== "admin") {
        return;
      }
      
      setUser(demoUserData);
    } else {
      // Récupérer l'utilisateur pour l'affichage dans la Sidebar
      // L'auth a déjà été vérifiée côté serveur, donc on peut utiliser getSession() (rapide)
      const loadUser = async () => {
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Pour admin, récupérer le rôle depuis le profil
          if (requireAdmin) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();
            
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name,
              role: profile?.role || "user",
            });
          } else {
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_beta_tester")
              .eq("id", session.user.id)
              .single();
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name,
              role: undefined,
              is_beta_tester: profile?.is_beta_tester ?? false,
            });
          }
        }
      };
      loadUser();
    }
  }, [requireAdmin]);

  const handleLogout = useCallback(async () => {
    if (isDemoMode) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("demo_logged_in");
      }
      router.push("/");
      return;
    }
    const { createClient } = await import("@/libs/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  const defaultBannerMessage = requireAdmin
    ? "🧪 MODE DÉMO — Les modifications ne seront pas sauvegardées."
    : "🧪 MODE DÉMO - L'authentification est désactivée.";

  const bannerClass = bannerColor === "amber"
    ? "bg-amber-50 border-b border-amber-200"
    : "bg-yellow-100 border-b-2 border-yellow-400";

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    }>
    <DemoAuthGuard>
    <div className="min-h-screen bg-slate-50">
      {/* MODE DÉMO Banner */}
      {isDemoMode && (
        <div className={`${bannerClass} px-4 py-2 text-center md:pl-64`}>
          <p className={`text-xs sm:text-sm font-medium ${bannerColor === "amber" ? "text-amber-800" : "text-yellow-800"}`}>
            <strong>{bannerMessage || defaultBannerMessage}</strong>
          </p>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="md:pl-64 pt-20 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
    </DemoAuthGuard>
    </Suspense>
  );
}
