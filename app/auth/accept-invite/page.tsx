"use client";

import { Suspense, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import config from "@/config";
import { team, SdkError } from "@/src/sdk";
import { isDemoMode } from "@/src/lib/demo";

type Status = "checking" | "needs-auth" | "accepting" | "success" | "error";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<Status>("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isDemoMode) {
      startTransition(() => {
        setStatus("error");
        setErrorMessage("Les invitations d'équipe ne sont pas disponibles en mode démo.");
      });
      return;
    }
    if (!token) {
      startTransition(() => {
        setStatus("error");
        setErrorMessage("Lien d'invitation invalide : le jeton est manquant.");
      });
      return;
    }

    (async () => {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        startTransition(() => setStatus("needs-auth"));
        return;
      }

      startTransition(() => setStatus("accepting"));
      try {
        await team.acceptInvite(token);
        startTransition(() => setStatus("success"));
      } catch (err) {
        startTransition(() => {
          setStatus("error");
          setErrorMessage(err instanceof SdkError ? err.message : "Impossible d'accepter cette invitation.");
        });
      }
    })();
  }, [token]);

  const redirectTarget = `/auth/accept-invite?token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <Image src="/brand/baobab-emblem.png" alt={config.appName} width={720} height={720} className="w-12 h-12 rounded-xl mb-4 inline-block" />

          {(status === "checking" || status === "accepting") && (
            <>
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                {status === "checking" ? "Vérification de l'invitation…" : "Ajout à l'équipe en cours…"}
              </p>
            </>
          )}

          {status === "needs-auth" && (
            <>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Vous avez été invité(e)</h1>
              <p className="text-slate-500 text-sm mb-6">
                Connectez-vous ou créez un compte avec l&apos;adresse email invitée pour rejoindre l&apos;équipe.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/signin?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="block w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all"
                >
                  Se connecter
                </Link>
                <Link
                  href={`/signup?invite=${encodeURIComponent(token)}`}
                  className="block w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  Créer un compte
                </Link>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Bienvenue dans l&apos;équipe !</h1>
              <p className="text-slate-500 text-sm mb-6">Vous avez rejoint l&apos;espace Baobab Loyalty.</p>
              <Link
                href="/dashboard"
                className="block w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all"
              >
                Accéder au Dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Invitation impossible</h1>
              <p className="text-slate-500 text-sm mb-6">{errorMessage}</p>
              <Link
                href="/signin"
                className="block w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
