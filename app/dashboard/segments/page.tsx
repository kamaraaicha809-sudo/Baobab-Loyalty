"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/components/common/Icons";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { clients as clientsSDK, Client } from "@/src/sdk/clients";
import { isDemoMode, demoSegmentCounts } from "@/src/lib/demo";

interface SegmentDef {
  id: string;
  name: string;
  description: string;
  months: number | null;
  icon: "clock" | "users";
  isCustom?: boolean;
}

const DEFAULT_SEGMENTS: SegmentDef[] = [
  {
    id: "3mois",
    name: "Clients - 3 mois",
    description: "Clients n'ayant pas séjourné depuis 3 mois",
    months: 3,
    icon: "clock",
  },
  {
    id: "6mois",
    name: "Clients - 6 mois",
    description: "Clients n'ayant pas séjourné depuis 6 mois",
    months: 6,
    icon: "clock",
  },
  {
    id: "9mois",
    name: "Clients - 9 mois",
    description: "Clients n'ayant pas séjourné depuis 9 mois",
    months: 9,
    icon: "clock",
  },
  {
    id: "tous",
    name: "Tous les clients",
    description: "Idéal pour les événements spéciaux et fêtes",
    months: null,
    icon: "users",
  },
];

function filterBySegment(allClients: Client[], segment: SegmentDef): Client[] {
  if (segment.months === null) return allClients;
  const cutoff = segment.months * 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  return allClients.filter((c) => now - new Date(c.derniere_visite).getTime() >= cutoff);
}

const DEMO_CLIENTS: Client[] = Array.from({ length: 19 }, (_, i) => ({
  id: `demo-${i}`,
  profile_id: "demo-user-id",
  nom: `Client Demo ${i + 1}`,
  email: `client${i + 1}@hotel.com`,
  telephone: `+221 7${i}0 000 000`,
  whatsapp: null,
  derniere_visite: new Date(Date.now() - (i * 45 + 30) * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  notes: null,
}));

export default function SegmentsPage() {
  const [counts, setCounts] = useState<Record<string, number>>(demoSegmentCounts);
  const [customSegments, setCustomSegments] = useState<SegmentDef[]>([]);

  // Client list modal
  const [listSegment, setListSegment] = useState<SegmentDef | null>(null);
  const [allClients, setAllClients] = useState<Client[] | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);

  // Create segment modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMonths, setNewMonths] = useState(12);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("baobab_custom_segments");
      if (saved) setCustomSegments(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        setCounts(demoSegmentCounts);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const seg = await clientsSDK.getSegmentCounts(user.id);
        setCounts(seg);
      } catch {
        setCounts(demoSegmentCounts);
      }
    };
    load();
  }, []);

  const allSegments = [...DEFAULT_SEGMENTS, ...customSegments];

  function persistCustomSegments(updated: SegmentDef[]) {
    setCustomSegments(updated);
    localStorage.setItem("baobab_custom_segments", JSON.stringify(updated));
  }

  function handleCreateSegment() {
    if (!newName.trim() || newMonths < 1) return;
    const seg: SegmentDef = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      description: `Clients inactifs depuis ${newMonths} mois`,
      months: newMonths,
      icon: "clock",
      isCustom: true,
    };
    persistCustomSegments([...customSegments, seg]);
    setShowCreate(false);
    setNewName("");
    setNewMonths(12);
  }

  function handleDeleteSegment(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    persistCustomSegments(customSegments.filter((s) => s.id !== id));
  }

  async function handleViewList(segment: SegmentDef, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setListSegment(segment);

    if (allClients !== null) return;

    setLoadingClients(true);
    try {
      if (isDemoMode) {
        setAllClients(DEMO_CLIENTS);
      } else {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const list = await clientsSDK.getClients(user.id);
          setAllClients(list);
        } else {
          setAllClients([]);
        }
      }
    } finally {
      setLoadingClients(false);
    }
  }

  const filteredClients = listSegment && allClients
    ? filterBySegment(allClients, listSegment)
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Qui souhaitez-vous relancer ?
          </h1>
          <p className="text-slate-600 text-base">
            L&apos;IA de {config.appName} a analysé votre base de données pour identifier les meilleurs segments.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 self-start sm:mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Créer un segment
        </button>
      </header>

      {!isDemoMode && (counts["tous"] ?? 0) === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-amber-900 mb-1">Aucun client dans votre base</p>
            <p className="text-sm text-amber-700">
              Importez votre fichier CSV depuis la page de configuration pour pouvoir lancer vos premières campagnes.
            </p>
          </div>
          <Link
            href="/dashboard/configuration"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-900 text-white text-sm font-semibold rounded-lg hover:bg-amber-800 transition-colors"
          >
            Importer mes clients
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {allSegments.map((segment) => (
          <div
            key={segment.id}
            className="rounded-xl border border-slate-200 bg-white hover:border-[var(--color-primary)]/40 hover:shadow-md transition-all overflow-hidden"
          >
            <Link
              href={`/dashboard/templates?segment=${segment.id}`}
              className="flex items-start justify-between gap-4 p-5"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-slate-400 shrink-0 mt-0.5">
                  {segment.icon === "users" ? <Icons.Users /> : <Icons.Clock />}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{segment.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{segment.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-2xl sm:text-3xl font-bold text-slate-900">
                  {segment.isCustom ? "—" : (counts[segment.id] ?? "—")}
                </span>
                <span className="text-xs text-slate-400 uppercase font-medium">clients</span>
              </div>
            </Link>

            <div className="flex items-center gap-2 px-4 pb-4">
              <button
                onClick={(e) => handleViewList(segment, e)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Voir la liste
              </button>
              {segment.isCustom && (
                <button
                  onClick={(e) => handleDeleteSegment(segment.id, e)}
                  title="Supprimer ce segment"
                  className="inline-flex items-center justify-center p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Créer un segment sur mesure */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900 mb-1">Créer un segment sur mesure</h2>
            <p className="text-sm text-slate-500 mb-5">
              Définissez vos propres critères d&apos;inactivité pour cibler exactement les bons clients.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom du segment
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex : Clients VIP inactifs"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Inactifs depuis (nombre de mois)
                </label>
                <input
                  type="number"
                  value={newMonths}
                  onChange={(e) => setNewMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={60}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Ciblera les clients sans séjour depuis au moins {newMonths} mois.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreate(false); setNewName(""); setNewMonths(12); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSegment}
                disabled={!newName.trim()}
                className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Créer le segment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Voir la liste des clients */}
      {listSegment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setListSegment(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{listSegment.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {loadingClients
                    ? "Chargement en cours…"
                    : `${filteredClients.length} client${filteredClients.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                onClick={() => setListSegment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {loadingClients ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-14 text-slate-400">
                  <div className="flex justify-center mb-3 opacity-30">
                    <Icons.Users />
                  </div>
                  <p className="text-sm">Aucun client dans ce segment</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase font-medium border-b border-slate-100">
                      <th className="text-left pb-3 pr-4">Nom</th>
                      <th className="text-left pb-3 pr-4 hidden sm:table-cell">Contact</th>
                      <th className="text-left pb-3">Dernière visite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-slate-900">{client.nom}</td>
                        <td className="py-3 pr-4 text-slate-500 hidden sm:table-cell">
                          {client.whatsapp || client.telephone || client.email || "—"}
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(client.derniere_visite).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
