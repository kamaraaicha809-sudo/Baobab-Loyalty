"use client";

import { useState } from "react";
import { newsletter } from "@/src/sdk/newsletter";
import { SdkError } from "@/src/sdk/_core";

type FormStatus = "idle" | "loading" | "success" | "error";

interface ErrorState {
  message: string;
}

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState<ErrorState | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setFormError(null);

    try {
      await newsletter.subscribe({
        email: email.trim(),
        name: name.trim() || undefined,
        source: "website",
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");

      if (err instanceof SdkError) {
        if (err.code === "ALREADY_SUBSCRIBED") {
          setFormError({ message: "Vous êtes déjà inscrit(e) à notre newsletter." });
          return;
        }
        if (err.code === "VALIDATION_ERROR" || err.code === "INVALID_EMAIL") {
          setFormError({ message: "Adresse email invalide." });
          return;
        }
      }

      setFormError({ message: "Une erreur est survenue. Veuillez réessayer." });
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-[#1a2f2a] border border-[#EBC161]/30 px-6 py-5 text-center">
        <div
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EBC161]/20"
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5 text-[#EBC161]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#EBC161]">Inscription confirmée !</p>
        <p className="mt-1 text-sm text-[#a3c4b5]">
          Merci ! Vous recevrez notre newsletter mensuelle avec les meilleures pratiques
          hôtelières.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-3">
      {/* Name input */}
      <div>
        <label htmlFor="newsletter-name" className="sr-only">
          Prénom (optionnel)
        </label>
        <input
          id="newsletter-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom (optionnel)"
          autoComplete="given-name"
          disabled={status === "loading"}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#EBC161]/60 focus:ring-1 focus:ring-[#EBC161]/40 disabled:opacity-50"
        />
      </div>

      {/* Email input */}
      <div>
        <label htmlFor="newsletter-email" className="sr-only">
          Adresse email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          autoComplete="email"
          disabled={status === "loading"}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#EBC161]/60 focus:ring-1 focus:ring-[#EBC161]/40 disabled:opacity-50"
        />
      </div>

      {/* Error message */}
      {status === "error" && formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError.message}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EBC161] px-6 py-3 text-sm font-semibold text-[#1a2f2a] transition hover:bg-[#c9a84d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBC161] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a2f2a]/30 border-t-[#1a2f2a]"
              aria-hidden="true"
            />
            Inscription en cours...
          </>
        ) : (
          "S'inscrire gratuitement"
        )}
      </button>

      {/* GDPR notice */}
      <p className="text-center text-xs text-white/35">
        Nous respectons votre vie privée. Désabonnement à tout moment.
      </p>
    </form>
  );
}
