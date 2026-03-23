"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import config from "@/config";
import Logo from "@/components/common/Logo";
import { isDemoMode } from "@/src/lib/demo";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    // Mode démo
    if (isDemoMode) {
      toast.success("Mode démo - Email simulé");
      sessionStorage.setItem("verify_email", email);
      router.push("/auth/verify?type=recovery");
      return;
    }

    setIsLoading(true);

    try {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        // Don't reveal if email exists or not for security
        if (error.message.includes("rate limit")) {
          toast.error("Trop de tentatives. Veuillez patienter quelques minutes.");
        } else {
          // Still show success to not reveal if email exists
          setIsSent(true);
        }
        return;
      }

      // Store email for verification page
      sessionStorage.setItem("verify_email", email);
      setIsSent(true);

      // Redirect to verify page after short delay
      setTimeout(() => {
        router.push("/auth/verify?type=recovery");
      }, 2000);
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Email envoyé !
            </h1>
            <p className="text-slate-500 mb-2">
              Si un compte existe avec l&apos;adresse
            </p>
            <p className="text-primary font-medium mb-4">{email}</p>
            <p className="text-slate-500 text-sm mb-6">
              vous recevrez un code de vérification pour réinitialiser votre mot de passe.
            </p>

            <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Redirection en cours...</span>
            </div>

            <Link
              href="/signin"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 sm:mb-8 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Retour à la connexion
        </Link>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light mb-4 p-2">
              <Logo size={32} variant="white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
              Mot de passe oublié ?
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Entrez votre email pour recevoir un code de réinitialisation
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse email
              </label>
              <input
                required
                type="email"
                value={email}
                autoComplete="email"
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm sm:text-base"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Envoi...</span>
                </div>
              ) : (
                "Envoyer le code"
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-5 h-5 text-blue-600 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-xs sm:text-sm text-blue-900">
              Vous recevrez un code à 6 chiffres par email si un compte existe avec cette adresse.
            </span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link
              href="/signin"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
