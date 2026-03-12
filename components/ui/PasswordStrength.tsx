"use client";

import { useMemo } from "react";

/**
 * Password validation rules
 */
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireSpecialChar: true,
};

interface PasswordValidation {
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validate password against rules
 */
export function validatePassword(password: string): PasswordValidation {
  const checks = {
    minLength: password.length >= passwordRules.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isValid = checks.minLength && checks.hasUppercase && checks.hasSpecialChar;

  return { isValid, checks };
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

interface PasswordStrengthProps {
  password?: string;
  confirmPassword?: string;
  showMatch?: boolean;
}

interface CheckIconProps {
  checked: boolean | null;
}

/**
 * PasswordStrength Component
 * Real-time password validation feedback
 */
export default function PasswordStrength({ 
  password, 
  confirmPassword, 
  showMatch = true 
}: PasswordStrengthProps) {
  const validation = useMemo(() => validatePassword(password || ""), [password]);
  const match = useMemo(
    () => (showMatch && confirmPassword !== undefined ? passwordsMatch(password || "", confirmPassword) : null),
    [password, confirmPassword, showMatch]
  );

  const CheckIcon = ({ checked }: CheckIconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 transition-colors ${checked ? "text-green-500" : "text-slate-300"}`}
    >
      {checked ? (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );

  // Don't show anything if password is empty
  if (!password || password.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <p className="text-xs font-semibold text-slate-600 mb-2">Exigences du mot de passe :</p>
      <ul className="space-y-1.5">
        <li className="flex items-center gap-2">
          <CheckIcon checked={validation.checks.minLength} />
          <span
            className={`text-xs transition-colors ${
              validation.checks.minLength ? "text-green-600" : "text-slate-500"
            }`}
          >
            Au moins {passwordRules.minLength} caractères
          </span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon checked={validation.checks.hasUppercase} />
          <span
            className={`text-xs transition-colors ${
              validation.checks.hasUppercase ? "text-green-600" : "text-slate-500"
            }`}
          >
            Au moins une lettre majuscule (A-Z)
          </span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon checked={validation.checks.hasSpecialChar} />
          <span
            className={`text-xs transition-colors ${
              validation.checks.hasSpecialChar ? "text-green-600" : "text-slate-500"
            }`}
          >
            Au moins un caractère spécial (!@#$%...)
          </span>
        </li>
        {showMatch && confirmPassword !== undefined && confirmPassword.length > 0 && (
          <li className="flex items-center gap-2 pt-1.5 border-t border-slate-200 mt-1.5">
            <CheckIcon checked={match} />
            <span
              className={`text-xs transition-colors ${
                match ? "text-green-600" : "text-red-500"
              }`}
            >
              {match ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
            </span>
          </li>
        )}
      </ul>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              validation.isValid && (match === null || match)
                ? "bg-green-500"
                : validation.checks.minLength && validation.checks.hasUppercase
                ? "bg-yellow-500"
                : validation.checks.minLength
                ? "bg-orange-500"
                : "bg-red-400"
            }`}
            style={{
              width: `${
                ((validation.checks.minLength ? 1 : 0) +
                  (validation.checks.hasUppercase ? 1 : 0) +
                  (validation.checks.hasSpecialChar ? 1 : 0) +
                  (showMatch && match ? 1 : 0)) *
                (showMatch ? 25 : 33.33)
              }%`,
            }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1 text-right">
          {validation.isValid && (match === null || match)
            ? "Mot de passe fort ✓"
            : "Renforcez votre mot de passe"}
        </p>
      </div>
    </div>
  );
}
