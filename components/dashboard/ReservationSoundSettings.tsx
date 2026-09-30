"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  isReservationSoundEnabled,
  playReservationSound,
  setReservationSoundEnabled,
} from "@/src/lib/reservation-sound";
import { showRecoveredReservationToast } from "@/components/dashboard/RecoveredReservationToast";

/**
 * Réglages de la notification « Nouvelle réservation » : son activé ou non
 * (sur cet appareil) et bouton de test, qui montre aussi la carte. Le test
 * fonctionne en mode démo.
 */
export default function ReservationSoundSettings() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isReservationSoundEnabled());
  }, []);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setReservationSoundEnabled(next);
  };

  const handleTest = async () => {
    showRecoveredReservationToast("test");
    const played = await playReservationSound();
    if (!played) toast.error("Le navigateur n'a pas pu jouer le son. Vérifiez le volume de l'appareil.");
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        Notifications
      </h2>
      <p className="text-slate-600 text-sm mb-5">
        Quand une réservation obtenue grâce à une campagne est confirmée, une notification apparaît sur votre
        dashboard, avec un son court et discret.
      </p>

      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <p id="reservation-sound-label" className="text-sm font-semibold text-slate-800">
            Son des nouvelles réservations
          </p>
          <p className="text-sm text-slate-500 mt-0.5">Réglage propre à cet appareil.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="reservation-sound-label"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none ${
            enabled ? "bg-primary" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={handleTest}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.09-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
        </svg>
        Tester le son
      </button>
    </section>
  );
}
