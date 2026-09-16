"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { user } from "@/src/sdk";
import { audit, type AuditLogEntry } from "@/src/sdk/audit";
import { isDemoMode, demoProfile, demoAuditLog } from "@/src/lib/demo";
import { BIRTHDAY_TEMPLATES, renderBirthdayMessage, type BirthdayTemplateKey } from "@/src/lib/birthday-templates";
import { useBirthdayAccess } from "@/src/hooks/usePremiumAccess";
import config from "@/config";

const isEurope = config.region === "europe";

function BirthdayProUpsell() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-xl border border-slate-200">
      <div className="w-14 h-14 rounded-full bg-[var(--color-light)] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-[var(--color-main)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v3m0 0c-1.5 0-3-1-3-2.5S10.5 4 12 4s3 1 3 2.5S13.5 8 12 8zm-7 5h14M5 13a2 2 0 00-2 2v5a1 1 0 001 1h16a1 1 0 001-1v-5a2 2 0 00-2-2M5 13V9a2 2 0 012-2h1m9 6V9a2 2 0 00-2-2h-1" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">
        Fonctionnalité réservée au plan {isEurope ? "Professional ou Business" : "Pro ou Premium"}
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Les messages d&apos;anniversaire automatiques sont disponibles à partir du plan {isEurope ? "Professional" : "Pro"}. Passe au plan supérieur pour y accéder.
      </p>
      <Link
        href="/dashboard/abonnement"
        className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
      >
        Voir les plans
      </Link>
    </div>
  );
}

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

function historyDetails(entry: AuditLogEntry): string {
  const d = entry.details;
  const sent = typeof d?.sent === "number" ? d.sent : 0;
  const failed = typeof d?.failed === "number" ? d.failed : 0;
  const parts = [`${sent} message(s) envoyé(s)`];
  if (failed > 0) parts.push(`${failed} échec(s)`);
  return parts.join(" · ");
}

export default function AnniversairesPage() {
  const hasAccess = useBirthdayAccess();
  const [profileId, setProfileId] = useState<string | null>(isDemoMode ? demoProfile.id : null);
  const [hotelName, setHotelName] = useState(isDemoMode ? demoProfile.hotel_name : "");
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(isDemoMode ? demoProfile.birthday_automation_enabled : false);
  const [templateKey, setTemplateKey] = useState<BirthdayTemplateKey>(
    isDemoMode ? (demoProfile.birthday_template_key as BirthdayTemplateKey) : "chaleureux"
  );
  const [history, setHistory] = useState<AuditLogEntry[]>(
    isDemoMode ? (demoAuditLog.filter((e) => e.action === "birthday_message_sent") as AuditLogEntry[]) : []
  );

  useEffect(() => {
    if (isDemoMode) return;
    const init = async () => {
      try {
        const profile = await user.getProfile();
        if (profile?.id) {
          setProfileId(profile.id);
          setHotelName(profile.hotel_name || "");
          setEnabled(!!profile.birthday_automation_enabled);
          setTemplateKey((profile.birthday_template_key as BirthdayTemplateKey) || "chaleureux");
          const rows = await audit.listAuditLog(profile.id);
          setHistory(rows.filter((e) => e.action === "birthday_message_sent"));
        }
      } catch {
        toast.error("Impossible de charger vos réglages anniversaire.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    if (isDemoMode) {
      toast.success("Réglages anniversaire enregistrés (démo)");
      return;
    }
    if (!profileId) return;
    setSaving(true);
    try {
      await user.updateBirthdaySettings(profileId, { enabled, templateKey });
      toast.success("Réglages anniversaire enregistrés");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer ces réglages.");
    } finally {
      setSaving(false);
    }
  };

  const previewHotel = hotelName || "votre hôtel";

  if (hasAccess === null || (hasAccess && loading)) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Anniversaires</h1>
          <p className="text-slate-600 text-base">
            Souhaitez automatiquement l&apos;anniversaire de vos clients par WhatsApp.
          </p>
        </header>
        <BirthdayProUpsell />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Anniversaires</h1>
        <p className="text-slate-600 text-base">
          Chaque jour, Baobab détecte les clients dont c&apos;est l&apos;anniversaire, vérifie leur consentement
          WhatsApp, puis leur envoie automatiquement le message choisi ci-dessous.
        </p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">Automatisation anniversaire</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {enabled ? "Activée — les messages sont envoyés automatiquement chaque jour." : "Désactivée — aucun message d'anniversaire n'est envoyé."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled((v) => !v)}
                className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : ""}`}
                />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-700 mb-3">Choisissez le message envoyé aux clients</p>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {BIRTHDAY_TEMPLATES.map((template) => {
                const isSelected = templateKey === template.key;
                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setTemplateKey(template.key)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected ? "bg-white border-primary/40 shadow-md ring-1 ring-primary/20" : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <p className={`text-sm font-semibold mb-2 ${isSelected ? "text-primary" : "text-slate-900"}`}>{template.name}</p>
                    <p className="text-xs text-slate-500 whitespace-pre-line line-clamp-6">
                      {renderBirthdayMessage(template.key, "Fatou", previewHotel)}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Historique des envois</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">Aucun message d&apos;anniversaire envoyé pour le moment.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((entry) => (
              <li key={entry.id} className="py-3 flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-900">{historyDetails(entry)}</p>
                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{formatDateTime(entry.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
