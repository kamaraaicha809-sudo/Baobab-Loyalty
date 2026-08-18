"use client";

import { useState } from "react";
import { contact } from "@/src/sdk/contact";
import { SdkError } from "@/src/sdk/_core";

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await contact.send({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");

      if (err instanceof SdkError && err.code === "RATE_LIMITED") {
        setErrorMessage("Trop de messages envoyés. Réessayez dans quelques minutes.");
        return;
      }
      setErrorMessage("Une erreur est survenue. Réessayez ou écrivez-nous directement à support@baobabloyalty.com.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-[#1a2f2a]/5 border border-[#1a2f2a]/15 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1a2f2a]/10" aria-hidden="true">
          <svg className="h-5 w-5 text-[#1a2f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#1a2f2a]">Message envoyé</p>
        <p className="mt-1 text-sm text-slate-500">
          Merci, nous vous répondons sous 24 à 48 heures ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-500 mb-1.5">
          Nom
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          disabled={status === "loading"}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1a2f2a]/15 focus:border-[#1a2f2a] transition-all text-sm disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-500 mb-1.5">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={status === "loading"}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1a2f2a]/15 focus:border-[#1a2f2a] transition-all text-sm disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-500 mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          disabled={status === "loading"}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1a2f2a]/15 focus:border-[#1a2f2a] transition-all resize-none text-sm disabled:opacity-50"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !name.trim() || !email.trim() || !message.trim()}
        className="w-full py-3.5 rounded-xl bg-[#1a2f2a] text-white font-semibold text-sm hover:bg-[#243d38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
