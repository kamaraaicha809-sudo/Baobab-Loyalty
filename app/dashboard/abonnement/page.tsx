"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import config from "@/config";
import { billing, user as userSdk } from "@/src/sdk";
import { isDemoMode } from "@/src/lib/demo";

const PLANS = config.billing.plans;

const PLAN_SLUG_TO_INDEX: Record<string, number> = {
  essentiel: 0,
  croissance: 1,
  premium: 2,
  starter: 0,
  pro: 1,
};

const PERKS: Record<number, string[]> = {
  0: ["Jusqu'à 30 chambres", "Segmentation clients de base", "Campagnes WhatsApp", "Support par email"],
  1: ["Jusqu'à 100 chambres", "Segmentation avancée", "Campagnes illimitées", "IA génération de messages", "Support prioritaire"],
  2: ["Chambres illimitées", "Automatisation avancée", "Campagnes illimitées", "IA personnalisée", "Account Manager dédié", "Bonus : génération de posts LinkedIn (IA)"],
};

export default function AbonnementPage() {
  const [upgradeLoading, setUpgradeLoading] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentPlanIndex, setCurrentPlanIndex] = useState<number | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setHasAccess(true);
      setCurrentPlanIndex(1);
      return;
    }
    userSdk
      .getProfile()
      .then((profile) => {
        setHasAccess(profile.has_access);
        if (profile.price_id) {
          const idx = PLAN_SLUG_TO_INDEX[profile.price_id];
          setCurrentPlanIndex(idx ?? 0);
        } else {
          setCurrentPlanIndex(null);
        }
      })
      .catch(() => {
        setHasAccess(false);
        setCurrentPlanIndex(null);
      });
  }, []);

  const currentPlan = currentPlanIndex !== null ? PLANS[currentPlanIndex] : null;

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
      const { url } = await billing.createPortal({
        returnUrl: `${window.location.origin}/dashboard/abonnement`,
      });
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

      {/* Chargement */}
      {hasAccess === null && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Chargement de votre abonnement...</p>
        </div>
      )}

      {/* Aucun abonnement actif — choisir un plan */}
      {hasAccess === false && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-semibold text-amber-900 text-sm">Aucun abonnement actif</p>
            <p className="text-amber-700 text-xs mt-1">
              Choisissez un plan pour accéder à toutes les fonctionnalités de Baobab Loyalty.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border-2 p-5 flex flex-col gap-4 ${
                  plan.isFeatured ? "border-primary shadow-md" : "border-slate-200"
                }`}
              >
                {plan.isFeatured && (
                  <span className="self-start text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Recommandé
                  </span>
                )}
                <div>
                  <p className="font-bold text-slate-900">{plan.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{plan.description}</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    {plan.price.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-slate-400 text-sm ml-1">FCFA/mois</span>
                </div>
                <ul className="space-y-1.5 flex-1">
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
                  onClick={() => handleUpgrade(i)}
                  disabled={upgradeLoading !== null || isDemoMode}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                    plan.isFeatured
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {upgradeLoading === i ? "Chargement..." : `Choisir ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Abonnement actif — gérer le plan */}
      {hasAccess === true && currentPlan !== null && currentPlanIndex !== null && (
        <>
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
                {PERKS[currentPlanIndex].map((perk) => (
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
          {PLANS.filter((_, i) => i !== currentPlanIndex).length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Changer de plan</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {PLANS.map((plan, i) => {
                  if (i === currentPlanIndex) return null;
                  const isUpgrade = i > currentPlanIndex;
                  return (
                    <div
                      key={plan.name}
                      className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">{plan.name}</span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                isUpgrade ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                              }`}
                            >
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
        </>
      )}
    </div>
  );
}
