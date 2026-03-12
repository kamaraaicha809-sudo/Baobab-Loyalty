"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const SEGMENT_NAMES: Record<string, string> = {
  "3mois": "Clients - 3 mois",
  "6mois": "Clients - 6 mois",
  "9mois": "Clients - 9 mois",
  tous: "Tous les clients",
};

const SEGMENT_COUNTS: Record<string, number> = {
  "3mois": 124,
  "6mois": 89,
  "9mois": 56,
  tous: 450,
};

const TEMPLATE_NAMES: Record<string, string> = {
  remise: "Remise Exceptionnelle",
  surclassement: "Surclassement Offert",
  cocktail: "Cocktail de Bienvenue",
  famille: "Offre Famille",
  evenements: "Événements Spéciaux",
};

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const segmentId = searchParams.get("segment") || "tous";
  const templateId = searchParams.get("template") || "surclassement";
  const feteName = searchParams.get("fete") || "";
  const avantage = searchParams.get("avantage") || "";

  const segmentName = SEGMENT_NAMES[segmentId] || segmentId;
  const offerName = feteName ? `${TEMPLATE_NAMES[templateId] || templateId} - ${feteName}` : (TEMPLATE_NAMES[templateId] || templateId);
  const clientCount = SEGMENT_COUNTS[segmentId] ?? 0;

  const templatesUrl = `/dashboard/templates?segment=${segmentId}`;

  const handleConfirmerEnvoi = () => {
    const params = new URLSearchParams();
    if (segmentId) params.set("segment", segmentId);
    params.set("template", templateId);
    if (avantage) params.set("avantage", avantage);
    if (feteName) params.set("fete", feteName);
    router.push(`/dashboard/campaign/sending?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="text-sm text-slate-500 hover:text-slate-700 inline-block"
      >
        ← Retour au dashboard
      </Link>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 -mt-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Icône check */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Titre */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Prêt à envoyer ?
          </h1>
          <p className="text-slate-600 text-base">
            Votre campagne est configurée. Nous allons envoyer ce message à{" "}
            <strong className="text-slate-900">{clientCount} clients</strong> via WhatsApp.
          </p>
        </div>

        {/* Récap campagne */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-left space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Canal de diffusion</p>
              <p className="text-slate-900 font-medium">WhatsApp Business API</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Segment</p>
            <p className="text-slate-900 font-medium">{segmentName}</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Offre</p>
            <p className="text-slate-900 font-medium">{offerName}</p>
            {avantage && (
              <p className="text-sm text-slate-600 mt-1 italic">&quot;{avantage}&quot;</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Coût estimé</p>
            <p className="text-slate-900 font-medium text-green-600">Inclus dans votre forfait</p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleConfirmerEnvoi}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Confirmer l&apos;envoi
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <Link
            href={templatesUrl}
            className="flex-1 flex items-center justify-center py-3.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function CampaignConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
