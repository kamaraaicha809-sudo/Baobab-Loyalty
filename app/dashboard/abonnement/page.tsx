"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";
import { billing } from "@/src/sdk";
import { isDemoMode } from "@/src/lib/demo";

const PLANS = config.stripe.plans;

const CURRENT_PLAN_INDEX = 1; // Pro (index dans PLANS)

const PERKS: Record<number, string[]> = {
  0: ["Jusqu'à 30 chambres", "Segmentation clients de base", "Campagnes WhatsApp", "Support par email"],
  1: ["Jusqu'à 100 chambres", "Segmentation avancée", "Campagnes illimitées", "IA génération de messages", "Support prioritaire"],
  2: ["Chambres illimitées", "Automatisation avancée", "Campagnes illimitées", "IA personnalisée", "Account Manager dédié"],
};

export default function AbonnementPage() {
  const router = useRouter();
  const [upgradeLoading, setUpgradeLoading] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const currentPlan = PLANS[CURRENT_PLAN_INDEX];

  const handleUpgrade = async (planIndex: number) => {
    if (isDemoMode) return;
    setUpgradeLoading(planIndex);
    try {
      const plan = PLANS[planIndex];
      const { url } = await billing.createCheckout({
        planSlug: plan.name.toLowerCase(),
        amount: plan.price,
        planName: plan.name,
        currency: "FCFA",
        successUrl: `${window.location.origin}/dashboard/abonnement`,
        cancelUrl: `${window.location.origin}/dashboard/abonnement`,
      });
      window.location.href = url;
    } catch {
      setUpgradeLoading(null);
    }
  };

  const handleCancel = async () => {
    if (isDemoMode) {
      setShowCancelConfirm(false);
      return;
    }
    setCancelLoading(true);
    try {
      const { url } = await billing.createPortal({ returnUrl: `${window.location.origin}/dashboard/abonnement` });
      window.location.href = url;
    } catch {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Retour */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au tableau de bord
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Mon abonnement</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez votre plan et vos options.</p>
      </div>

      {/* Plan actuel */}
      <div className="bg-white rounded-2xl border-2 border-primary/40 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan actuel</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Actif
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{currentPlan.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{currentPlan.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">
              {currentPlan.price.toLocaleString("fr-FR")}
            </p>
            <p className="text-slate-400 text-sm">FCFA / mois</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Inclus dans votre plan</p>
          <ul className="space-y-2">
            {PERKS[CURRENT_PLAN_INDEX].map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isDemoMode ? "Renouvellement le 10 mai 2026" : "Prochain renouvellement selon votre abonnement"}
        </div>
      </div>

      {/* Changer de plan */}
      {PLANS.filter((_, i) => i !== CURRENT_PLAN_INDEX).length > 0 && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Changer de plan</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map((plan, i) => {
              if (i === CURRENT_PLAN_INDEX) return null;
              const isUpgrade = i > CURRENT_PLAN_INDEX;
              return (
                <div
                  key={plan.name}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{plan.name}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isUpgrade ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>
                          {isUpgrade ? "Upgrade" : "Downgrade"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">{plan.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 text-lg">{plan.price.toLocaleString("fr-FR")}</p>
                      <p className="text-slate-400 text-xs">FCFA/mois</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {PERKS[i].map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-xs text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => isDemoMode ? undefined : handleUpgrade(i)}
                    disabled={upgradeLoading !== null || isDemoMode}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isUpgrade
                        ? "bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                    }`}
                  >
                    {upgradeLoading === i
                      ? "Chargement..."
                      : isUpgrade
                      ? `Passer au plan ${plan.name}`
                      : `Rétrograder vers ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Annulation */}
      <div className="pt-6 border-t border-slate-100">
        {!showCancelConfirm ? (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2"
          >
            Mettre fin à mon abonnement
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-red-800">Confirmer la résiliation ?</p>
            <p className="text-xs text-red-600">
              Votre abonnement restera actif jusqu'à la fin de la période en cours. Vous perdrez l'accès aux fonctionnalités premium ensuite.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {cancelLoading ? "Redirection..." : "Oui, résilier mon abonnement"}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </div>
            {isDemoMode && (
              <p className="text-xs text-red-400 italic">Action désactivée en mode démo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
