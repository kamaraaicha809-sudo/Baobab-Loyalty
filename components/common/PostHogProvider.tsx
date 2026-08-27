"use client";

import posthog from "posthog-js";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  COOKIE_CONSENT_EVENT,
  getStoredConsent,
} from "@/src/lib/cookieConsent";

// Zones contenant des données réelles de clients d'hôtels (noms, téléphones,
// messages, réservations...) : PostHog n'y tourne jamais, consentement ou non.
// Le masquage des champs de saisie ne suffit pas — le DOM y affiche des
// données clients en texte brut (tableaux, listes) que le session replay
// capturerait quel que soit maskAllInputs.
function isRestrictedPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

let initialized = false;

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && initialized && !isRestrictedPath(pathname)) {
      let url = window.location.origin + pathname;
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

function initPostHog() {
  if (initialized || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    // Filet de sécurité supplémentaire : même sur les pages publiques
    // (jamais de données clients d'hôtel), aucune valeur de champ de
    // saisie n'est jamais capturée en clair.
    session_recording: {
      maskAllInputs: true,
    },
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true") {
        ph.debug();
      }
    },
  });
  initialized = true;
}

// Standalone init component — does NOT wrap children.
// Loaded lazily via dynamic import so posthog-js is NOT in the main bundle.
export default function PostHogInit() {
  const pathname = usePathname();

  // Applique l'état correct (actif / suspendu) à chaque changement de route
  // ET à chaque changement de consentement, dans les deux sens.
  useEffect(() => {
    const applyState = () => {
      const path = window.location.pathname;
      const restricted = isRestrictedPath(path);
      const consent = getStoredConsent();

      if (restricted) {
        // Jamais de PostHog sur les données clients, même déjà consenti.
        if (initialized) posthog.opt_out_capturing();
        return;
      }

      if (consent === "granted") {
        if (!initialized) {
          initPostHog();
        } else if (posthog.has_opted_out_capturing()) {
          posthog.opt_in_capturing();
        }
      } else {
        // Pas de consentement (ou refus explicite) : ne jamais initialiser,
        // et couper si un opt-in précédent avait démarré la capture.
        if (initialized) posthog.opt_out_capturing();
      }
    };

    applyState();

    window.addEventListener(COOKIE_CONSENT_EVENT, applyState);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, applyState);
  }, [pathname]);

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
