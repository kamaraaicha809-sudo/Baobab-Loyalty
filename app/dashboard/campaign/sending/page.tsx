"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3500;
    const interval = 50;
    const step = (100 / duration) * interval;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + step);
        if (next >= 100) {
          clearInterval(timer);
          const params = new URLSearchParams(searchParams.toString());
          router.replace(`/dashboard/campaign/success?${params.toString()}`);
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#FDFDF9]">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Envoi en cours...
          </h1>
          <p className="text-slate-500 text-base mt-2">
            Baobab Loyalty traite vos messages en temps réel...
          </p>
        </div>
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignSendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFDF9]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <SendingContent />
    </Suspense>
  );
}
