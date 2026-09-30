"use client";

import { useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import config from "@/config";
import { user as userSdk } from "@/src/sdk/user";
import { isDemoMode } from "@/src/lib/demo";
import { isReservationSoundEnabled, playReservationSound } from "@/src/lib/notification-sound";
import { isCampaignReservation, type ReservationRow } from "@/src/lib/reservation-notification";

const notifiedInThisTab = new Set<string>();

// Une seule notification par réservation, même si plusieurs mises à jour
// arrivent, et un seul onglet notifie si plusieurs sont ouverts.
function claimNotification(reservationId: string): boolean {
  if (notifiedInThisTab.has(reservationId)) return false;
  notifiedInThisTab.add(reservationId);
  const key = `reservation-notified-${reservationId}`;
  try {
    if (window.localStorage.getItem(key)) return false;
    window.localStorage.setItem(key, String(Date.now()));
  } catch {
    // Stockage indisponible : chaque onglet notifie, sans conséquence.
  }
  return true;
}

function showReservationToast() {
  toast.custom(
    (t) => (
      <div
        role="status"
        className={`${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"} transition-all duration-300 flex items-start gap-3 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75 1.5 1.5 3-3" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Nouvelle réservation</p>
          <p className="text-sm text-slate-600">+1 réservation récupérée grâce à une campagne</p>
          <Link
            href="/dashboard/reservations"
            onClick={() => toast.dismiss(t.id)}
            className="mt-1 inline-block text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Voir et confirmer
          </Link>
        </div>
      </div>
    ),
    { duration: 7000, position: "top-right" }
  );
}

/**
 * Notifie l'hôtelier (son discret + message) dès qu'une réservation issue
 * d'une campagne arrive, sur toutes les pages du dashboard. Réagit uniquement
 * aux changements en direct (jamais au chargement) : une actualisation de page
 * ne déclenche rien.
 * Loyavia (Europe) uniquement pour l'instant ; jamais en mode démo.
 */
export default function ReservationNotifier() {
  useEffect(() => {
    if (config.region !== "europe" || isDemoMode) return;

    let cleanup: (() => void) | null = null;
    let cancelled = false;

    const setup = async () => {
      const profile = await userSdk.getProfile().catch(() => null);
      if (!profile?.id || cancelled) return;

      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const channel = supabase
        .channel("reservation-notifier")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "reservations", filter: `profile_id=eq.${profile.id}` },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            const row = payload.new as ReservationRow;
            if (!isCampaignReservation(row) || !claimNotification(row.id)) return;
            showReservationToast();
            if (isReservationSoundEnabled()) void playReservationSound();
          }
        )
        .subscribe();
      cleanup = () => {
        supabase.removeChannel(channel);
      };
      // Démonté pendant la mise en place : on ne laisse pas d'abonnement orphelin.
      if (cancelled) cleanup();
    };

    void setup();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
