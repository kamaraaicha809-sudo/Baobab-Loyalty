"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isDemoMode, demoUser, demoProfile } from "@/src/lib/demo";
import toast from "react-hot-toast";

function SuccessContent() {
  const searchParams = useSearchParams();
  const avantageRaw = searchParams.get("avantage") || "";
  const avantage = avantageRaw || "Un surclassement gratuit en Suite Junior";
  const aiMessage = searchParams.get("message") || "";
  const templateId = searchParams.get("template") || "";
  const discountPct = searchParams.get("discountPct") || "50";
  const isSondage = templateId === "sondage";
  const [profileId, setProfileId] = useState<string | null>(isDemoMode ? demoUser.id : null);
  const [copied, setCopied] = useState(false);
  const [campaignImage, setCampaignImage] = useState<string | null>(null);

  useEffect(() => {
    const img = sessionStorage.getItem("campaign_image");
    if (img) setCampaignImage(img);
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    const load = async () => {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setProfileId(user.id);
    };
    load();
  }, []);

  const hotelName = isDemoMode ? demoProfile.hotel_name : "Hôtel Le Baobab";
  const offreParams = new URLSearchParams();
  offreParams.set("avantage", avantage);
  offreParams.set("hotel", hotelName);
  if (profileId) offreParams.set("pid", profileId);
  const sondageParams = new URLSearchParams();
  sondageParams.set("hotel", hotelName);
  sondageParams.set("discount", discountPct);

  const messageText = aiMessage || `Cher {{nom}}, revenez nous voir bientôt ! Pour toute réservation ce mois-ci, nous vous offrons : "${avantage}"`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success("Message copié !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier le message.");
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#FDFDF9] py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start">
        {/* Partie gauche - Succès */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
            <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-semibold text-green-800 uppercase text-sm tracking-wider">Succès</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display leading-tight">
            Campagne lancée avec succès !
          </h1>
          <p className="text-slate-600 text-base max-w-md">
            Vos clients reçoivent actuellement leur offre personnalisée. Voici à quoi ressemble le message sur leur téléphone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Retour au tableau de bord
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Link>
            <Link
              href="/dashboard/segments"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Lancer une autre campagne
            </Link>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copié !
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copier le message
              </>
            )}
          </button>
        </div>

        {/* Partie droite - Mockup téléphone WhatsApp */}
        <div className="flex-shrink-0">
          <div className="w-[280px] sm:w-[320px] mx-auto rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
            {/* Barre de statut / encoche */}
            <div className="h-6 bg-slate-800 flex items-end justify-center pb-1">
              <div className="w-20 h-4 rounded-full bg-slate-900" />
            </div>
            {/* En-tête WhatsApp */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate">{hotelName}</p>
                <p className="text-white/80 text-xs">En ligne</p>
              </div>
            </div>
            {/* Séparateur AUJOURD'HUI */}
            <div className="bg-[#ECE5DD] py-1.5">
              <p className="text-center text-xs text-slate-600 font-medium">AUJOURD&apos;HUI</p>
            </div>
            {/* Zone message */}
            <div className="bg-[#ECE5DD] p-3 min-h-[280px]">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-tr-none bg-white shadow-sm px-3 py-2.5 relative">
                  {campaignImage && (
                    <img
                      src={campaignImage}
                      alt="Pièce jointe"
                      className="w-full rounded-md mb-2 object-cover max-h-40"
                    />
                  )}
                  <p className="text-slate-800 text-sm leading-snug whitespace-pre-wrap">{messageText}</p>
                  {isSondage ? (
                    <Link
                      href={`/sondage?${sondageParams.toString()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span className="text-green-700 font-medium text-sm">Remplir le questionnaire ({discountPct}% offert)</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/offre?${offreParams.toString()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-blue-600 font-medium text-sm">Réserver</span>
                    </Link>
                  )}
                  <p className="text-slate-400 text-[10px] text-right mt-1">22:22</p>
                </div>
              </div>
            </div>
            {/* Barre de saisie */}
            <div className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-500">
                <span className="text-lg font-light">+</span>
              </div>
              <div className="flex-1 py-2 px-3 rounded-full bg-white text-slate-400 text-sm">
                Tapez un message...
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0V8m0 7V4m0 0h14" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFDF9]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
