"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import config from "@/config";
import Logo from "@/components/common/Logo";
import PasswordStrength, { validatePassword, passwordsMatch } from "@/components/ui/PasswordStrength";
import { isDemoMode } from "@/src/lib/demo";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) sessionStorage.setItem("pending_checkout_plan", plan);
    const ref = searchParams.get("ref");
    if (ref === "beta") sessionStorage.setItem("signup_ref", "beta");
  }, [searchParams]);

  // En mode démo, on laisse le formulaire s'afficher normalement

  const validateForm = () => {
    if (!fullName.trim()) {
      toast.error("Veuillez entrer votre nom complet");
      return false;
    }
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return false;
    }
    
    // Validate password with strength rules
    const { isValid, checks } = validatePassword(password);
    if (!isValid) {
      if (!checks.minLength) {
        toast.error("Le mot de passe doit contenir au moins 8 caractères");
      } else if (!checks.hasUppercase) {
        toast.error("Le mot de passe doit contenir au moins une majuscule");
      } else if (!checks.hasSpecialChar) {
        toast.error("Le mot de passe doit contenir au moins un caractère spécial");
      }
      return false;
    }
    
    if (!passwordsMatch(password, confirmPassword)) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e?.preventDefault();

    // Mode démo : aller directement au dashboard
    if (isDemoMode) {
      router.push("/dashboard");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Cet email est déjà utilisé. Connectez-vous !");
          router.push(`/signin?email=${encodeURIComponent(email)}`);
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Supabase retourne identities=[] si l'email existe déjà (sans erreur)
      if (data.user?.identities?.length === 0) {
        toast.error("Cet email est déjà associé à un compte. Connectez-vous !");
        router.push(`/signin?email=${encodeURIComponent(email)}`);
        return;
      }

      if (data.session) {
        // mailer_autoconfirm activé : l'utilisateur est directement connecté
        toast.success("Compte créé avec succès !");
        window.location.href = config.auth.callbackUrl;
      } else {
        // Vérification email requise
        sessionStorage.setItem("verify_email", email);
        toast.success("Un code de vérification a été envoyé à votre email");
        router.push("/auth/verify?type=signup");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    const { isValid } = validatePassword(password);
    return fullName.trim() && email && isValid && passwordsMatch(password, confirmPassword);
  };

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
              Créer un compte
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Rejoignez {config.appName} gratuitement
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {/* Sign Up Form */}
            <form className="space-y-4" onSubmit={handleSignUp}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom complet
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  autoComplete="name"
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm sm:text-base"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete="new-password"
                    placeholder="Créez un mot de passe sécurisé"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm sm:text-base pr-12 ${
                      password && !validatePassword(password).isValid
                        ? "border-orange-300"
                        : password && validatePassword(password).isValid
                        ? "border-green-300"
                        : "border-slate-200"
                    }`}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  autoComplete="new-password"
                  placeholder="Confirmez votre mot de passe"
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm sm:text-base ${
                    confirmPassword && !passwordsMatch(password, confirmPassword)
                      ? "border-red-300"
                      : confirmPassword && passwordsMatch(password, confirmPassword)
                      ? "border-green-300"
                      : "border-slate-200"
                  }`}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrength 
                password={password} 
                confirmPassword={confirmPassword} 
                showMatch={true}
              />

              <button
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
                disabled={isLoading || !isFormValid()}
                type="submit"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Création du compte...</span>
                  </div>
                ) : (
                  "Créer mon compte"
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-slate-400 text-center">
                En créant un compte, vous acceptez nos{" "}
                <Link href="/tos" className="text-primary hover:underline">
                  conditions d&apos;utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/privacy-policy"
                  className="text-primary hover:underline"
                >
                  politique de confidentialité
                </Link>
                .
              </p>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>
            Déjà un compte ?{" "}
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

export default function SignUp() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50" />}>
      <SignUpContent />
    </Suspense>
  );
}
