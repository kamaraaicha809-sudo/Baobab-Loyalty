"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isDemoMode } from "@/src/lib/demo";

/**
 * Page d'entrée démo : active le mode démo (sessionStorage) puis redirige
 * vers la présentation avec le dashboard en iframe.
 * Si le mode démo n'est pas activé, redirige vers la connexion.
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isDemoMode) {
      router.replace("/signin?from=demo");
      return;
    }

    // Active le flag démo pour BaseLayout/DemoAuthGuard
    sessionStorage.setItem("demo_logged_in", "1");

    // Redirige vers la présentation (dashboard en plein écran + assistant)
    router.replace(
      "/presentation?showAssistant=true&appParams=solution&showPreview=true&fullscreenApplet=true"
    );
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDF9]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#2C2C2C] font-medium">Lancement de la démo...</p>
      </div>
    </div>
  );
}
