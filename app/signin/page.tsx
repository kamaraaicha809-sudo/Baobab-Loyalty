"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import config from "@/config";
import Logo from "@/components/common/Logo";
import { isDemoMode } from "@/src/lib/demo";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDemoLogin = () => {
    sessionStorage.setItem("demo_logged_in", "1");
    router.push("/dashboard");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e?.preventDefault();

    // Vérifier que l'email et le mot de passe sont remplis
    if (!email.trim() || !password) {
      toast.error("Veuillez remplir l'email et le mot de passe");
      return;
    }

    // Mode démo : marquer comme connecté et aller au dashboard
    if (isDemoMode) {
      handleDemoLogin();
      return;
    }

    setIsLoading(true);

    try {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou mot de passe incorrect");
        } else if (error.message.includes("Email not confirmed")) {
          // Rediriger vers la page de vérification
          sessionStorage.setItem("verify_email", email);
          router.push("/auth/verify?type=signup");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Connexion réussie !");
      const redirect = searchParams.get("redirect");
      const plan = searchParams.get("plan");
      if (redirect) {
        router.push(redirect);
      } else if (plan) {
        router.push(`/checkout?plan=${plan}`);
      } else {
        router.push(config.auth.callbackUrl);
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
          </svg>
          Retour
        </Link>

        {/* Header / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-slate-900 mb-4 p-3">
            <Logo size={36} variant="white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Bienvenue sur {config.appName}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Connectez-vous pour gérer vos campagnes et lancer des offres aux clients
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSignIn}>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                EMAIL PROFESSIONNEL
              </label>
              <input
                required
                type="email"
                value={email}
                autoComplete="email"
                placeholder="directeur@hotel-prestige.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none transition-all text-sm sm:text-base text-slate-900 placeholder:text-slate-400"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                MOT DE PASSE
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none transition-all text-sm sm:text-base text-slate-900 placeholder:text-slate-400 pr-12"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Link href="/auth/reset-password" className="block text-right text-sm text-slate-500 hover:text-slate-700">
              Mot de passe oublié ?
            </Link>

            <button
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/30"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 117.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Se connecter et accéder au dashboard
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            Créer un accès hôtel
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white" />}>
      <SignInContent />
    </Suspense>
  );
}
