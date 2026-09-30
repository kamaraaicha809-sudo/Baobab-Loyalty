"use client";

import toast, { type Toast } from "react-hot-toast";
import config from "@/config";

const PARTY_POPPER = "\u{1F389}";
const TOAST_DURATION_MS = 6000;

function RecoveredReservationCard({ t }: { t: Toast }) {
  const { title, message } = config.notifications.recoveredReservation;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all duration-300 motion-reduce:transition-none ${
        t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p className="text-sm font-semibold text-slate-900">
        <span aria-hidden="true" className="mr-1.5">
          {PARTY_POPPER}
        </span>
        {title}
      </p>
      <p className="mt-2 flex items-center gap-2.5">
        <span className="rounded-lg bg-primary px-2.5 py-0.5 text-2xl font-extrabold leading-tight text-slate-900">
          +1
        </span>
        <span className="text-sm font-medium text-slate-700">{message}</span>
      </p>
    </div>
  );
}

/**
 * Affiche la carte « Nouvelle réservation » en bas à droite pendant quelques
 * secondes. Un même identifiant ne produit jamais deux cartes à la fois.
 */
export function showRecoveredReservationToast(reservationId: string): void {
  toast.custom((t) => <RecoveredReservationCard t={t} />, {
    id: `recovered-reservation-${reservationId}`,
    duration: TOAST_DURATION_MS,
    position: "bottom-right",
  });
}
