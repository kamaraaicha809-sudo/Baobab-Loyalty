"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { user } from "@/src/sdk";
import { audit, auditActionLabel, type AuditLogEntry } from "@/src/sdk/audit";
import { isDemoMode, demoAuditLog } from "@/src/lib/demo";

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

function formatDetails(entry: AuditLogEntry): string | null {
  const d = entry.details;
  if (!d) return null;
  const parts: string[] = [];
  if (typeof d.segmentCode === "string") parts.push(`Segment : ${d.segmentCode}`);
  if (typeof d.sent === "number") parts.push(`${d.sent} envoyé(s)`);
  if (typeof d.failed === "number" && d.failed > 0) parts.push(`${d.failed} échec(s)`);
  if (typeof d.montantFcfa === "number") parts.push(`${d.montantFcfa.toLocaleString("fr-FR")} FCFA`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export default function HistoriquePage() {
  const [loading, setLoading] = useState(!isDemoMode);
  const [items, setItems] = useState<AuditLogEntry[]>(isDemoMode ? (demoAuditLog as AuditLogEntry[]) : []);

  const load = useCallback(async (profileId: string) => {
    try {
      const rows = await audit.listAuditLog(profileId);
      setItems(rows);
    } catch {
      // RLS renvoie simplement 0 ligne pour un rôle non-admin — une erreur
      // ici signale un vrai problème réseau/serveur, pas un refus d'accès.
      toast.error("Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    const init = async () => {
      try {
        const profile = await user.getProfile();
        if (profile?.id) {
          await load(profile.id);
        } else {
          setLoading(false);
        }
      } catch {
        toast.error("Impossible de charger votre profil.");
        setLoading(false);
      }
    };
    init();
  }, [load]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Historique des actions</h1>
        <p className="text-slate-600 text-base">
          Réservations confirmées/annulées, campagnes envoyées, membres d&apos;équipe retirés — visible par le
          propriétaire et les administrateurs de l&apos;hôtel.
        </p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">
            Aucune action enregistrée pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((entry) => {
              const detailsText = formatDetails(entry);
              return (
                <li key={entry.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{auditActionLabel(entry.action)}</p>
                    {detailsText && <p className="text-sm text-slate-500 mt-0.5">{detailsText}</p>}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                    {formatDateTime(entry.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
