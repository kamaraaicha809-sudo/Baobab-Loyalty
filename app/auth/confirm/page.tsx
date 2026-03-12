"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import config from "@/config";

/**
 * Auth Confirm Content
 * Separated for Suspense boundary (Next.js 15 requirement)
 */
function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle OAuth errors
      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        return;
      }

      try {
        const supabase = createClient();
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }

        // Redirect to dashboard on success
        router.replace(config.auth.callbackUrl);
      } catch (err) {
        setError("Authentication failed. Please try again.");
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-red-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Erreur d'authentification
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.push(config.auth.loginUrl)}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Connexion en cours...</p>
      </div>
    </div>
  );
}

/**
 * OAuth Callback Page
 * Handles the code exchange after OAuth redirect
 * Wrapped in Suspense for Next.js 15 compatibility
 */
export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Chargement...</p>
          </div>
        </div>
      }
    >
      <AuthConfirmContent />
    </Suspense>
  );
}
