"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { campaigns } from "@/src/sdk/campaigns";
import { isDemoMode } from "@/src/lib/demo";

function SendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"sending" | "done" | "error">("sending");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const segmentCode = searchParams.get("segment") || "tous";
    const templateId = searchParams.get("template") || "";
    const message = searchParams.get("message") || "";
    const avantage = searchParams.get("avantage") || "";

    // Resolve custom segment months from localStorage
    let customMonths: number | undefined;
    if (segmentCode.startsWith("custom-")) {
      try {
        const saved = localStorage.getItem("baobab_custom_segments");
        if (saved) {
          const list: { id: string; months: number }[] = JSON.parse(saved);
          const found = list.find((s) => s.id === segmentCode);
          if (found) customMonths = found.months;
        }
      } catch {
        // ignore
      }
    }

    // Animate progress bar while waiting for API
    const estimatedMs = isDemoMode ? 2000 : 8000;
    const interval = 100;
    const step = (85 / estimatedMs) * interval; // goes to 85% then waits for API
    const timer = setInterval(() => {
      setProgress((p) => Math.min(85, p + step));
    }, interval);

    campaigns
      .sendCampaign({ segmentCode, message, templateId, avantage, customMonths })
      .then((result) => {
        clearInterval(timer);
        setProgress(100);
        setStatus("done");

        setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sent", String(result.sent));
          params.set("failed", String(result.failed));
          params.set("total", String(result.total));
          router.replace(`/dashboard/campaign/success?${params.toString()}`);
        }, 600);
      })
      .catch((err: Error) => {
        clearInterval(timer);
        setStatus("error");
        setErrorMsg(err.message || "Une erreur est survenue lors de l'envoi.");
      });

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#FDFDF9]">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Échec de l&apos;envoi</h1>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#FDFDF9]">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          {status === "done" ? (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            {status === "done" ? "Messages envoyés !" : "Envoi en cours..."}
          </h1>
          <p className="text-slate-500 text-base mt-2">
            {status === "done"
              ? "Redirection vers le résumé…"
              : "Baobab Loyalty envoie vos messages WhatsApp…"}
          </p>
        </div>
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
