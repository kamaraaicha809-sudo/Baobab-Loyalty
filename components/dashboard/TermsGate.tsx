"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { user as userSdk } from "@/src/sdk/user";
import { isDemoMode } from "@/src/lib/demo";

const TERMS_LINKS = [
  { href: "/legal/cgu", label: "Conditions générales d'utilisation (CGU)" },
  { href: "/legal/cgv", label: "Conditions générales de vente (CGV)" },
  { href: "/legal/dpa", label: "Accord de sous-traitance des données (DPA)" },
];

/**
 * Bloque le dashboard tant que la version courante des CGU/CGV/DPA n'a pas
 * été acceptée (case à cocher obligatoire, date posée par le serveur).
 * Afrique uniquement ; jamais affiché en mode démo.
 */
export default function TermsGate() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const version = config.legal.termsVersion;

  useEffect(() => {
    if (isDemoMode || !config.legal.requireTermsAcceptance) return;

    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const acceptance = await userSdk.getTermsAcceptance(user.id);
        if (acceptance.termsVersion !== version) setOpen(true);
      } catch {
        // Lecture impossible (réseau) : on ne bloque pas l'accès au dashboard.
      }
    };

    check();
  }, [version]);

  const handleAccept = async () => {
    if (!checked) return;
    setSaving(true);
    try {
      await userSdk.acceptTerms(version);
      setOpen(false);
      toast.success("Conditions acceptées");
    } catch {
      toast.error("Impossible d'enregistrer votre acceptation. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-gate-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
        <h2 id="terms-gate-title" className="text-xl font-bold text-slate-900">
          Conditions d&apos;utilisation de {config.appName}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Avant de continuer, merci de lire et d&apos;accepter les documents qui encadrent votre utilisation du
          service et le traitement des données de vos clients.
        </p>
        <ul className="mt-4 space-y-2">
          {TERMS_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <label htmlFor="terms-gate-accept" className="mt-5 flex items-start gap-3 cursor-pointer">
          <input
            id="terms-gate-accept"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-slate-700">
            J&apos;ai lu et j&apos;accepte les CGU, les CGV et l&apos;accord de sous-traitance des données (DPA), au nom
            de mon hôtel.
          </span>
        </label>
        <button
          type="button"
          onClick={handleAccept}
          disabled={!checked || saving}
          className="mt-6 w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Accepter et continuer"}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">Version du {version.split("-").reverse().join("/")}</p>
      </div>
    </div>
  );
}
