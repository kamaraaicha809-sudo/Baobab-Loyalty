"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/libs/supabase/client";

interface ChecklistState {
  hotelConfigured: boolean;
  clientsImported: boolean;
  campaignSent: boolean;
}

interface Props {
  profileId: string;
}

export default function OnboardingChecklist({ profileId }: Props) {
  const [state, setState] = useState<ChecklistState | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [profileResult, clientsResult, campaignsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("config_complete")
          .eq("id", profileId)
          .single(),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profileId),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profileId)
          .neq("status", "draft"),
      ]);

      setState({
        hotelConfigured: profileResult.data?.config_complete === true,
        clientsImported: (clientsResult.count ?? 0) > 0,
        campaignSent: (campaignsResult.count ?? 0) > 0,
      });
    };

    load();
  }, [profileId]);

  if (!state) return null;

  const allDone = state.hotelConfigured && state.clientsImported && state.campaignSent;
  if (allDone) return null;

  const steps = [
    {
      label: "Compte créé",
      done: true,
      href: null,
    },
    {
      label: "Configurer votre hôtel",
      done: state.hotelConfigured,
      href: "/dashboard/configuration",
    },
    {
      label: "Importer vos clients",
      done: state.clientsImported,
      href: "/dashboard/configuration",
    },
    {
      label: "Envoyer une campagne",
      done: state.campaignSent,
      href: "/dashboard/campaign",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Démarrage — {doneCount}/{steps.length} étapes complétées
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {nextStep
              ? `Prochaine étape : ${nextStep.label}`
              : "Vous y êtes presque !"}
          </p>
        </div>
        <span className="text-sm font-bold text-slate-700">{progress}%</span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-2 bg-[var(--color-main)] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm transition-colors ${
              step.done
                ? "bg-green-50 border-green-100"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            {/* Icône */}
            <div
              className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                step.done ? "bg-green-500" : "bg-slate-200"
              }`}
            >
              {step.done ? (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              )}
            </div>

            {/* Label */}
            <div className="min-w-0">
              <p className={`font-medium leading-tight ${step.done ? "text-green-800" : "text-slate-600"}`}>
                {step.label}
              </p>
              {!step.done && step.href && (
                <Link
                  href={step.href}
                  className="text-xs text-[var(--color-main)] hover:underline font-medium mt-0.5 inline-block"
                >
                  Commencer
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
