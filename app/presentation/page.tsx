"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import config from "@/config";

function PresentationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const showAssistant = searchParams.get("showAssistant") === "true";
  const fullscreenApplet = searchParams.get("fullscreenApplet") !== "false";
  const appParams = searchParams.get("appParams") || "solution";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-white">Chargement...</div>
      </div>
    );
  }

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const dashboardUrl = `${baseUrl}/dashboard?demo=1`;
  const homeUrl = `${baseUrl}/`;
  const iframeSrc = fullscreenApplet
    ? appParams === "solution"
      ? dashboardUrl
      : homeUrl
    : homeUrl;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950">
      {/* Barre supérieure minimale - style Google AI Studio */}
      <header className="flex-shrink-0 h-12 px-4 flex items-center justify-between bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
          >
            <span className="font-semibold">{config.appName}</span>
            <span className="text-slate-500 text-sm hidden sm:inline">
              — Présentation
            </span>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Accueil
            </button>
          </div>
        </div>
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Quitter la présentation
        </Link>
      </header>

      {/* Zone principale : app en plein écran + assistant optionnel */}
      <div className="flex-1 flex min-h-0">
        {/* Contenu principal - iframe fullscreen */}
        <div
          className={`flex-1 min-w-0 flex flex-col ${
            showAssistant ? "border-r border-slate-800" : ""
          }`}
        >
          <iframe
            src={iframeSrc}
            title={`${config.appName} - Aperçu`}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            allow="clipboard-read; clipboard-write"
          />
        </div>

        {/* Panneau assistant (optionnel) - style Google AI Studio */}
        {showAssistant && (
          <aside className="w-80 flex-shrink-0 flex flex-col bg-slate-900 border-l border-slate-800">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Assistant</h3>
              <p className="text-slate-400 text-xs mt-1">
                Conseils pour découvrir {config.appName}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  <strong className="text-white">Bienvenue !</strong>
                  <br />
                  {config.appDescription}
                </p>
                <div className="space-y-2 pt-2">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Découvrez
                  </p>
                  <ul className="list-disc list-inside text-slate-400 text-xs space-y-1">
                    <li>Tableau de bord et performances</li>
                    <li>Segmentation clients</li>
                    <li>Campagnes WhatsApp automatisées</li>
                    <li>Offres personnalisées par IA</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function PresentationPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-white">Chargement...</div>
      </div>
    }>
      <PresentationContent />
    </Suspense>
  );
}
