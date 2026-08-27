"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clients } from "@/src/sdk/clients";

type State = "loading" | "done" | "already" | "erreur";

function DesinscriptionContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("c") || "";

  const [state, setState] = useState<State>(clientId ? "loading" : "erreur");
  const [hotelName, setHotelName] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    clients
      .unsubscribe(clientId)
      .then((result) => {
        setHotelName(result.hotelName);
        setState(result.alreadyUnsubscribed ? "already" : "done");
      })
      .catch(() => setState("erreur"));
  }, [clientId]);

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        {state === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-6 mx-auto" />
            <p className="text-slate-600">Traitement de votre demande…</p>
          </>
        )}

        {(state === "done" || state === "already") && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Désinscription confirmée</h1>
            <p className="text-slate-600 leading-relaxed">
              Vous ne recevrez plus de messages promotionnels{hotelName ? <> de la part de <strong>{hotelName}</strong></> : ""}.
            </p>
            <p className="text-slate-400 text-sm mt-6">
              Vous pouvez fermer cette page.
            </p>
          </>
        )}

        {state === "erreur" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Lien invalide</h1>
            <p className="text-slate-600 leading-relaxed">
              Ce lien de désinscription n&apos;est plus valide. Contactez directement l&apos;hôtel pour ne plus recevoir de messages.
            </p>
          </>
        )}

        <Link href="/" className="inline-block mt-8 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function DesinscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDF9]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <DesinscriptionContent />
    </Suspense>
  );
}
