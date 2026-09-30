"use client";

import { useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import {
  isReservationSoundEnabled,
  playReservationSound,
  setReservationSoundEnabled,
  subscribeReservationSound,
} from "@/src/lib/notification-sound";

/**
 * Réglages de la notification "nouvelle réservation" : activer / désactiver
 * le son (préférence de cet appareil) et le tester. Le message visuel, lui,
 * s'affiche toujours.
 */
export default function ReservationSoundSettings() {
  // Activé par défaut côté serveur ; la vraie préférence est lue dans le navigateur.
  const enabled = useSyncExternalStore(subscribeReservationSound, isReservationSoundEnabled, () => true);

  const handleToggle = () => {
    const next = !enabled;
    setReservationSoundEnabled(next);
    toast.success(next ? "Son des nouvelles réservations activé" : "Son des nouvelles réservations désactivé");
  };

  const handleTest = async () => {
    const played = await playReservationSound();
    if (!played) toast.error("Votre navigateur bloque le son. Vérifiez qu'il n'est pas coupé pour ce site.");
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Notifications de réservation</h2>
      <p className="text-slate-600 text-sm mb-5">
        Quand un client réserve grâce à une de vos campagnes, un message s&apos;affiche dans le tableau de bord,
        accompagné d&apos;un son court et discret. Ce réglage s&apos;applique à cet appareil.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label htmlFor="reservation-sound-toggle" className="flex items-center gap-3 cursor-pointer">
          <button
            id="reservation-sound-toggle"
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
              enabled ? "bg-[var(--color-primary)]" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-slate-800">
            Son des nouvelles réservations {enabled ? "activé" : "désactivé"}
          </span>
        </label>
        <button
          type="button"
          onClick={handleTest}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Tester le son
        </button>
      </div>
    </section>
  );
}
