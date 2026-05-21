"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Step = "offre" | "date-form" | "traitement" | "attente";

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function OffreContent() {
  const searchParams = useSearchParams();
  const avantage = searchParams.get("avantage") || "Un surclassement gratuit en Suite Junior";
  const hotel = searchParams.get("hotel") || "Hôtel Le Baobab";
  const profileId = searchParams.get("pid") || "";
  const clientName = searchParams.get("nom") || "";
  const clientPhone = searchParams.get("tel") || "";

  const [step, setStep] = useState<Step>("offre");
  const [checkinDate, setCheckinDate] = useState(getTomorrow());
  const [nights, setNights] = useState(2);

  const messageText = `Cher {nom}, revenez nous voir bientôt ! Pour toute réservation ce mois-ci, nous vous offrons : "${avantage}"`;

  const handleReserver = () => {
    setStep("date-form");
  };

  const handleConfirmerReservation = async () => {
    setStep("traitement");
    try {
      await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          hotel_name: hotel,
          checkin_date: checkinDate,
          nights,
          client_name: clientName,
          client_phone: clientPhone,
          avantage,
        }),
      });
    } catch {
      // Continuer même en cas d'erreur réseau
    }
    setStep("attente");
  };

  return (
    <div className="min-h-screen bg-[#ECE5DD] flex flex-col">
      {/* En-tête type WhatsApp */}
      <header className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/" className="text-white shrink-0 p-1 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold truncate">{hotel}</p>
          <p className="text-white/80 text-xs">En ligne</p>
        </div>
      </header>

      {/* Zone principale */}
      <main className="flex-1 overflow-y-auto">

        {step === "traitement" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white min-h-[calc(100vh-140px)] w-full">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-6" />
            <p className="text-slate-800 font-medium text-lg text-center">
              Envoi de votre demande…
            </p>
          </div>
        )}

        {step === "attente" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white min-h-[calc(100vh-140px)] w-full">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
              Demande envoyée !
            </h1>
            <p className="text-slate-600 text-base text-center mb-2 max-w-sm">
              La réception de <strong>{hotel}</strong> va vous appeler pour confirmer votre réservation.
            </p>
            <p className="text-slate-500 text-sm text-center mb-8 max-w-sm">
              Cette étape permet de vérifier la disponibilité et d&apos;éviter tout surréservation.
            </p>
            <div className="w-full max-w-xs bg-slate-50 rounded-xl border border-slate-200 p-4 mb-8 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Arrivée</span>
                <span className="font-medium text-slate-800">
                  {new Date(checkinDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durée</span>
                <span className="font-medium text-slate-800">{nights} nuit{nights > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Offre</span>
                <span className="font-medium text-slate-800 text-right max-w-[60%]">{avantage}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              className="w-full max-w-xs py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 active:bg-slate-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        {step === "date-form" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white min-h-[calc(100vh-140px)] w-full">
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Choisissez vos dates</h2>
                <p className="text-slate-500 text-sm mt-1">Précisez votre arrivée et la durée de votre séjour.</p>
              </div>

              {/* Date d'arrivée */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date d&apos;arrivée
                </label>
                <input
                  type="date"
                  value={checkinDate}
                  min={getTomorrow()}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm text-slate-900"
                />
              </div>

              {/* Nombre de nuits */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de nuits
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setNights((n) => Math.max(1, n - 1))}
                    className="w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-xl font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-2xl font-bold text-slate-900">
                    {nights}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNights((n) => Math.min(30, n + 1))}
                    className="w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-xl font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  {nights} nuit{nights > 1 ? "s" : ""} — Départ le{" "}
                  {(() => {
                    const d = new Date(checkinDate);
                    d.setDate(d.getDate() + nights);
                    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
                  })()}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmerReservation}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 active:bg-slate-700 transition-colors"
              >
                Envoyer ma demande
              </button>
              <button
                type="button"
                onClick={() => setStep("offre")}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Retour
              </button>
            </div>
          </div>
        )}

        {step === "offre" && (
          <>
            <div className="py-2">
              <p className="text-center text-xs text-slate-600 font-medium">AUJOURD&apos;HUI</p>
            </div>
            <div className="px-3 pb-4">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-tr-none bg-white shadow-sm px-3 py-2.5">
                  <p className="text-slate-800 text-sm leading-snug whitespace-pre-wrap">{messageText}</p>
                  <button
                    type="button"
                    onClick={handleReserver}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm hover:bg-blue-100 active:bg-blue-200 transition-colors cursor-pointer select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Réserver
                  </button>
                  <p className="text-slate-400 text-[10px] text-right mt-1">22:22</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Barre de saisie */}
      {(step === "offre" || step === "date-form") && (
        <div className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-slate-500">
            <span className="text-xl font-light">+</span>
          </div>
          <div className="flex-1 py-2.5 px-4 rounded-full bg-white text-slate-400 text-sm">
            Tapez un message...
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0V8m0 7V4m0 0h14" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function OffrePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#ECE5DD]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <OffreContent />
    </Suspense>
  );
}
