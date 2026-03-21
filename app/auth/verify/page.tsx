"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import config from "@/config";
import Logo from "@/components/common/Logo";
import OTPInput from "@/components/ui/OTPInput";
import { isDemoMode } from "@/src/lib/demo";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "signup"; // signup or recovery

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);

  // Get email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verify_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (!isDemoMode) {
      // Redirect to appropriate page if no email
      router.push(type === "recovery" ? "/auth/reset-password" : "/signup");
    }
  }, [router, type]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = useCallback(
    async (otp) => {
      if (isDemoMode) {
        toast.success("Mode démo - Vérification simulée");
        router.push("/dashboard");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();

        const verifyType = type === "recovery" ? "recovery" : "signup";

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: verifyType,
        });

        if (verifyError) {
          if (verifyError.message.includes("expired")) {
            setError("Le code a expiré. Veuillez en demander un nouveau.");
          } else if (verifyError.message.includes("invalid")) {
            setError("Code incorrect. Veuillez réessayer.");
          } else {
            setError(verifyError.message);
          }
          return;
        }

        // Clear stored email
        sessionStorage.removeItem("verify_email");

        if (type === "recovery") {
          toast.success("Code vérifié ! Définissez votre nouveau mot de passe.");
          router.push("/auth/update-password");
        } else {
          const pendingPlan = sessionStorage.getItem("pending_checkout_plan");
          sessionStorage.removeItem("pending_checkout_plan");
          toast.success("Email vérifié avec succès !");
          router.push(pendingPlan ? `/checkout?plan=${pendingPlan}` : config.auth.callbackUrl);
        }
      } catch (err) {
        setError("Une erreur est survenue. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, type, router]
  );

  const handleResend = async () => {
    if (countdown > 0 || !email) return;

    setIsResending(true);
    setError(null);

    try {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();

      if (type === "recovery") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
        });
        if (error) throw error;
      }

      toast.success("Un nouveau code a été envoyé !");
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      toast.error("Impossible d'envoyer le code. Veuillez réessayer.");
    } finally {
      setIsResending(false);
    }
  };

  // Mode démo
  if (isDemoMode) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-amber-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Mode Démo</h1>
            <p className="text-slate-500 mb-6">
              La vérification par email est désactivée en mode démo.
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all"
            >
              Accéder au Dashboard
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
          href={type === "recovery" ? "/auth/reset-password" : "/signup"}
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
          Retour
        </Link>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light mb-4 p-2">
              <Logo size={32} variant="white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
              Vérification
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              {type === "recovery"
                ? "Entrez le code reçu pour réinitialiser votre mot de passe"
                : "Entrez le code reçu pour valider votre email"}
            </p>
            {email && (
              <p className="text-primary font-medium text-sm mt-2">{email}</p>
            )}
          </div>

          <div className="space-y-6">
            {/* OTP Input */}
            <OTPInput onComplete={handleVerify} disabled={isLoading} />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                <span className="text-sm">Vérification en cours...</span>
              </div>
            )}

            {/* Resend Code */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-2">
                Vous n&apos;avez pas reçu le code ?
              </p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className={`text-sm font-medium transition-colors ${
                  countdown > 0 || isResending
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-primary hover:text-primary-dark cursor-pointer"
                }`}
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    Envoi...
                  </span>
                ) : countdown > 0 ? (
                  `Renvoyer dans ${countdown}s`
                ) : (
                  "Renvoyer le code"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>
            Besoin d&apos;aide ?{" "}
            <Link
              href={`mailto:${config.resend.supportEmail}`}
              className="text-primary hover:text-primary-dark font-medium"
            >
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
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
      <VerifyContent />
    </Suspense>
  );
}
