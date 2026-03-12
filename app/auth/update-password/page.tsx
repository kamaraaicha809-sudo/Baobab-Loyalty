"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import config from "@/config";
import Logo from "@/components/common/Logo";
import PasswordStrength, { validatePassword, passwordsMatch } from "@/components/ui/PasswordStrength";
import { isDemoMode } from "@/src/lib/demo";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user is authenticated (needed for password update)
  useEffect(() => {
    const checkAuth = async () => {
      if (isDemoMode) {
        setIsAuthenticated(true);
        setChecking(false);
        return;
      }

      try {
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
        } else {
          // Not authenticated, redirect to reset password
          toast.error("Session expirée. Veuillez recommencer.");
          router.push("/auth/reset-password");
        }
      } catch (error) {
        router.push("/auth/reset-password");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const validateForm = () => {
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

  // Check if form is valid for button state
  const isFormValid = () => {
    const { isValid } = validatePassword(password);
    return isValid && passwordsMatch(password, confirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Mode démo
    if (isDemoMode) {
      toast.success("Mode démo - Mot de passe mis à jour");
      setIsSuccess(true);
      setTimeout(() => router.push("/signin"), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        if (error.message.includes("same as")) {
          toast.error("Le nouveau mot de passe doit être différent de l'ancien");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Sign out to force re-login with new password
      await supabase.auth.signOut();

      setIsSuccess(true);
      toast.success("Mot de passe mis à jour avec succès !");

      // Redirect to signin after delay
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Vérification...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Success state
  if (isSuccess) {
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
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Mot de passe mis à jour !
            </h1>
            <p className="text-slate-500 mb-6">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>

            <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Redirection vers la connexion...</span>
            </div>

            <Link
              href="/signin"
              className="inline-block w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all"
            >
              Se connecter
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
          Annuler
        </Link>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light mb-4 p-2">
              <Logo size={32} variant="white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
              Nouveau mot de passe
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nouveau mot de passe
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
                  <span>Mise à jour...</span>
                </div>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
