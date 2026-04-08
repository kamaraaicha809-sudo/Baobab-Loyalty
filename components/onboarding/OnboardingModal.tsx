"use client";

import { useState } from "react";
import { createClient } from "@/libs/supabase/client";
import Step1HotelName from "./steps/Step1HotelName";
import Step2ImportClients from "./steps/Step2ImportClients";
import Step3WawMoment from "./steps/Step3WawMoment";
import config from "@/config";

interface Props {
  profileId: string;
  onComplete: () => void;
}

const STEPS = [
  { label: "Votre hôtel", short: "1" },
  { label: "Vos clients", short: "2" },
  { label: "Premier message", short: "3" },
];

export default function OnboardingModal({ profileId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [hotelName, setHotelName] = useState("");
  const [clientCount, setClientCount] = useState(0);
  const [completing, setCompleting] = useState(false);

  const handleStep1Next = (name: string) => {
    setHotelName(name);
    setStep(2);
  };

  const handleStep2Next = (count: number) => {
    setClientCount(count);
    setStep(3);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_step: 3,
          config_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);
      onComplete();
    } catch {
      onComplete();
    }
  };

  return (
    /* Overlay plein écran — le dashboard est visible mais grisé derrière */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fond semi-transparent */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header avec branding */}
        <div className="bg-[var(--color-main)] px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-lg">{config.appName}</span>
          <span className="text-xs font-medium text-slate-700 bg-slate-900/10 px-2 py-1 rounded-full">
            Configuration initiale
          </span>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-5 pb-1">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const isCompleted = step > num;
              const isCurrent = step === num;
              const isLast = i === STEPS.length - 1;

              return (
                <div key={s.label} className="flex items-center flex-1 last:flex-none">
                  {/* Cercle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                        ${isCompleted
                          ? "bg-slate-900 text-white"
                          : isCurrent
                            ? "bg-[var(--color-main)] text-slate-900 ring-4 ring-[var(--color-main)]/20"
                            : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        s.short
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${isCurrent ? "text-slate-700" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Ligne de connexion */}
                  {!isLast && (
                    <div className={`h-0.5 flex-1 mx-2 mb-4 transition-all ${step > num ? "bg-slate-900" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="px-6 py-6">
          {step === 1 && (
            <Step1HotelName
              profileId={profileId}
              onNext={handleStep1Next}
            />
          )}
          {step === 2 && (
            <Step2ImportClients
              profileId={profileId}
              onNext={handleStep2Next}
            />
          )}
          {step === 3 && (
            <Step3WawMoment
              hotelName={hotelName}
              clientCount={clientCount}
              onComplete={completing ? () => {} : handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
