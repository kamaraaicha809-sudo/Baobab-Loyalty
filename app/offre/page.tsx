"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function OffreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const avantage = searchParams.get("avantage") || "Un surclassement gratuit en Suite Junior";
  const hotel = searchParams.get("hotel") || "Hôtel Le Baobab";
  const profileId = searchParams.get("pid") || "";
  const etape = searchParams.get("confirme") || ""; // "" | "traitement" | "1"
  const isProcessing = etape === "traitement";
  const isConfirmed = etape === "1";

  const messageText = `Cher {nom}, revenez nous voir bientôt ! Pour toute réservation ce mois-ci, nous vous offrons : "${avantage}"`;

  // Image 3 : après traitement, passer à la confirmation (Image 2) et enregistrer la réservation
  useEffect(() => {
    if (isProcessing) {
      const saveReservation = async () => {
        if (profileId) {
          try {
            await fetch("/api/reservations/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile_id: profileId, hotel_name: hotel }),
            });
          } catch {
            // Ignorer en cas d'erreur (mode démo ou API non configurée)
          }
        }
      };
      saveReservation();
      const t = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("confirme", "1");
        router.replace(`/offre?${params.toString()}`);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isProcessing, router, searchParams, profileId, hotel]);

  const handleReserver = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("confirme", "traitement");
    router.push(`/offre?${params.toString()}`);
  };

  const handleFermer = () => {
    window.location.href = "/";
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
        {isProcessing ? (
          /* Image 3 : Traitement de votre réservation... */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white min-h-[calc(100vh-140px)] w-full">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-6" />
            <p className="text-slate-800 font-medium text-lg text-center">
              Traitement de votre réservation...
            </p>
          </div>
        ) : !isConfirmed ? (
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReserver();
                    }}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm hover:bg-blue-100 active:bg-blue-200 transition-colors cursor-pointer select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Réserver
                  </button>
                  <p className="text-slate-400 text-[10px] text-right mt-1">22:22</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Image 2 : Réservation Confirmée ! */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white min-h-[calc(100vh-140px)] w-full">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
              Réservation Confirmée !
            </h1>
            <p className="text-slate-600 text-base text-center mb-8 max-w-sm">
              Merci de votre confiance. Vous allez recevoir un message de confirmation d&apos;ici quelques instants.
            </p>
            <button
              type="button"
              onClick={handleFermer}
              className="w-full max-w-xs py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}
      </main>

      {/* Barre de saisie (visible avant confirmation, pendant traitement ; masquée après confirmation) */}
      {!isConfirmed && (
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
