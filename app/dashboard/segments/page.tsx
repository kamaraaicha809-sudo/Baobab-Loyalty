"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { Icons } from "@/components/common/Icons";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { clients as clientsSDK, Client, SegmentFilters, matchesAdvancedFilters } from "@/src/sdk/clients";
import { isDemoMode, demoSegmentCounts } from "@/src/lib/demo";

interface SegmentDef {
  id: string;
  name: string;
  description: string;
  months: number | null;
  minDays?: number;
  maxDays?: number | null;
  icon: "clock" | "users" | "star" | "sparkles";
  isCustom?: boolean;
  // Segments dérivés de la valeur/fréquence du client plutôt que de son
  // ancienneté (derniere_visite) — réutilisent matchesAdvancedFilters.
  valueFilters?: SegmentFilters;
  maxNombreReservations?: number;
}

// Seuils validés avec l'hôtelière (2026-08-26) : aucune donnée réelle en
// base pour les calibrer (aucun hôtel actif n'a encore de montant/réservations
// renseignés), ce sont des points de départ pour le marché FCFA visé, pas une
// moyenne calculée. À ajuster si l'usage réel montre qu'ils sont mal calibrés.
const VIP_MONTANT_MIN_FCFA = 300000;
const REGULIER_RESERVATIONS_MIN = 2;
const NOUVEAU_RESERVATIONS_MAX = 1;

const DEFAULT_SEGMENTS: SegmentDef[] = [
  {
    id: "3-6mois",
    name: "Clients 3 à 6 mois",
    description: "Clients inactifs depuis 3 à moins de 6 mois",
    months: null,
    minDays: 90,
    maxDays: 179,
    icon: "clock",
  },
  {
    id: "6-9mois",
    name: "Clients 6 à 9 mois",
    description: "Clients inactifs depuis 6 à moins de 9 mois",
    months: null,
    minDays: 180,
    maxDays: 269,
    icon: "clock",
  },
  {
    id: "9-12mois",
    name: "Clients 9 à 12 mois",
    description: "Clients inactifs depuis 9 à moins de 12 mois",
    months: null,
    minDays: 270,
    maxDays: 364,
    icon: "clock",
  },
  {
    id: "1an+",
    name: "Plus d'un an",
    description: "Clients inactifs depuis plus d'un an",
    months: null,
    minDays: 365,
    maxDays: null,
    icon: "clock",
  },
  {
    id: "vip",
    name: "Clients VIP",
    description: `Ont dépensé au moins ${VIP_MONTANT_MIN_FCFA.toLocaleString("fr-FR")} FCFA au total`,
    months: null,
    icon: "star",
    valueFilters: { minMontantDepense: VIP_MONTANT_MIN_FCFA },
  },
  {
    id: "reguliers",
    name: "Clients réguliers",
    description: `Au moins ${REGULIER_RESERVATIONS_MIN} réservations chez vous`,
    months: null,
    icon: "users",
    valueFilters: { minNombreReservations: REGULIER_RESERVATIONS_MIN },
  },
  {
    id: "nouveaux",
    name: "Nouveaux clients",
    description: "Un seul séjour pour l'instant (ou aucun) — à fidéliser",
    months: null,
    icon: "sparkles",
    maxNombreReservations: NOUVEAU_RESERVATIONS_MAX,
  },
  {
    id: "tous",
    name: "Tous les clients",
    description: "Idéal pour les événements spéciaux et fêtes",
    months: null,
    icon: "users",
  },
];

function isValueSegment(segment: SegmentDef): boolean {
  return !!segment.valueFilters || segment.maxNombreReservations !== undefined;
}

function filterBySegment(allClients: Client[], segment: SegmentDef): Client[] {
  if (segment.id === "tous") return allClients;

  if (isValueSegment(segment)) {
    return allClients.filter((c) => {
      if (segment.valueFilters && !matchesAdvancedFilters(c, segment.valueFilters)) return false;
      if (segment.maxNombreReservations !== undefined && (c.nombre_reservations ?? 0) > segment.maxNombreReservations) return false;
      return true;
    });
  }

  const now = Date.now();

  if (segment.minDays !== undefined) {
    return allClients.filter((c) => {
      const days = (now - new Date(c.derniere_visite).getTime()) / (1000 * 60 * 60 * 24);
      if (days < segment.minDays!) return false;
      if (segment.maxDays != null && days > segment.maxDays) return false;
      return true;
    });
  }

  // Segments personnalisés : seuil minimum en mois
  if (segment.months === null) return allClients;
  const cutoff = segment.months * 30 * 24 * 60 * 60 * 1000;
  return allClients.filter((c) => now - new Date(c.derniere_visite).getTime() >= cutoff);
}

// Clients répartis sur les 5 tranches (3-6, 6-9, 9-12 mois, 1an+, récents)
const DEMO_CLIENTS: Client[] = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `demo-a${i}`,
    profile_id: "demo-user-id",
    nom: `Client 3-6 mois ${i + 1}`,
    email: `c3_${i + 1}@hotel.com`,
    telephone: null,
    whatsapp: null,
    derniere_visite: new Date(Date.now() - (100 + i * 10) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: null,
    nombre_reservations: i + 1,
    montant_total_depense: (i + 1) * 70000, // dernier client du groupe dépasse le seuil VIP (démo)
    type_chambre_preferee: i % 2 === 0 ? "Suite" : "Standard",
    saison_habituelle: i % 2 === 0 ? "Haute saison" : "Basse saison",
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `demo-b${i}`,
    profile_id: "demo-user-id",
    nom: `Client 6-9 mois ${i + 1}`,
    email: `c6_${i + 1}@hotel.com`,
    telephone: null,
    whatsapp: null,
    derniere_visite: new Date(Date.now() - (190 + i * 15) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: null,
    nombre_reservations: i + 1,
    montant_total_depense: (i + 1) * 30000,
    type_chambre_preferee: "Standard",
    saison_habituelle: "Basse saison",
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `demo-c${i}`,
    profile_id: "demo-user-id",
    nom: `Client 9-12 mois ${i + 1}`,
    email: `c9_${i + 1}@hotel.com`,
    telephone: null,
    whatsapp: null,
    derniere_visite: new Date(Date.now() - (280 + i * 20) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: null,
    nombre_reservations: i,
    montant_total_depense: i * 20000,
    type_chambre_preferee: "Deluxe",
    saison_habituelle: "Haute saison",
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `demo-d${i}`,
    profile_id: "demo-user-id",
    nom: `Client +1 an ${i + 1}`,
    email: `c12_${i + 1}@hotel.com`,
    telephone: null,
    whatsapp: null,
    derniere_visite: new Date(Date.now() - (400 + i * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: null,
    nombre_reservations: i,
    montant_total_depense: 0,
    type_chambre_preferee: null,
    saison_habituelle: null,
  })),
];

export default function SegmentsPage() {
  const [counts, setCounts] = useState<Record<string, number>>(demoSegmentCounts);
  const [customSegments, setCustomSegments] = useState<SegmentDef[]>([]);

  // Client list modal
  const [listSegment, setListSegment] = useState<SegmentDef | null>(null);
  const [allClients, setAllClients] = useState<Client[] | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);

  // Filtres combinables (P5) : en plus des segments basés sur la dernière
  // visite, on peut affiner par montant dépensé, nombre de réservations,
  // type de chambre préférée et saison habituelle.
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SegmentFilters>({});
  const hasActiveFilters =
    filters.minMontantDepense != null ||
    filters.minNombreReservations != null ||
    !!filters.typeChambreContains?.trim() ||
    !!filters.saisonContains?.trim();

  // Create segment modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMonths, setNewMonths] = useState(12);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("baobab_custom_segments");
      if (saved) startTransition(() => setCustomSegments(JSON.parse(saved)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        setCounts(demoSegmentCounts);
        setAllClients(DEMO_CLIENTS);
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
      // Chargé dès l'arrivée sur la page (pas seulement au clic sur "Voir la
      // liste") : nécessaire pour calculer un nombre de destinataires à jour
      // dès qu'un filtre combinable est actif.
      try {
        const list = await clientsSDK.getClients(user.id);
        setAllClients(list);
      } catch {
        setAllClients([]);
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
    ? filterBySegment(allClients, listSegment).filter((c) => matchesAdvancedFilters(c, filters))
    : [];

  function segmentDisplayCount(segment: SegmentDef): number | string {
    if (segment.isCustom) return "—";
    // Les segments VIP/réguliers/nouveaux ne sont pas dans get_segment_counts
    // (basé uniquement sur derniere_visite) : toujours calculés côté client.
    if (!hasActiveFilters && !isValueSegment(segment)) return counts[segment.id] ?? "—";
    if (!allClients) return "…";
    return filterBySegment(allClients, segment).filter((c) => matchesAdvancedFilters(c, filters)).length;
  }

  function segmentHref(segment: SegmentDef): string {
    const params = new URLSearchParams({ segment: segment.id });
    if (filters.minMontantDepense != null) params.set("montantMin", String(filters.minMontantDepense));
    if (filters.minNombreReservations != null) params.set("reservationsMin", String(filters.minNombreReservations));
    if (filters.typeChambreContains?.trim()) params.set("typeChambre", filters.typeChambreContains.trim());
    if (filters.saisonContains?.trim()) params.set("saison", filters.saisonContains.trim());
    return `/dashboard/templates?${params.toString()}`;
  }

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
        <div className="flex gap-2 shrink-0 self-start sm:mt-6">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${
              hasActiveFilters
                ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            Filtres avancés
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Créer un segment
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Filtres combinables</h3>
            <p className="text-xs text-slate-400">S&apos;ajoutent au segment choisi ci-dessous</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Montant dépensé minimum (FCFA)
              </label>
              <input
                type="number"
                min={0}
                value={filters.minMontantDepense ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    minMontantDepense: e.target.value === "" ? undefined : Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
                placeholder="Ex : 100000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Nombre de réservations minimum
              </label>
              <input
                type="number"
                min={0}
                value={filters.minNombreReservations ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    minNombreReservations: e.target.value === "" ? undefined : Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
                placeholder="Ex : 2"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Type de chambre préférée
              </label>
              <input
                type="text"
                value={filters.typeChambreContains ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, typeChambreContains: e.target.value }))}
                placeholder="Ex : Suite"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Saison habituelle
              </label>
              <input
                type="text"
                value={filters.saisonContains ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, saisonContains: e.target.value }))}
                placeholder="Ex : Haute saison"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({})}
              className="mt-4 text-xs font-medium text-slate-500 hover:text-slate-700 underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

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
              href={segmentHref(segment)}
              className="flex items-start justify-between gap-4 p-5"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-slate-400 shrink-0 mt-0.5">
                  {segment.icon === "users" ? (
                    <Icons.Users />
                  ) : segment.icon === "star" ? (
                    <Icons.Star />
                  ) : segment.icon === "sparkles" ? (
                    <Icons.Sparkles />
                  ) : (
                    <Icons.Clock />
                  )}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{segment.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{segment.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-2xl sm:text-3xl font-bold text-slate-900">
                  {segmentDisplayCount(segment)}
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase font-medium border-b border-slate-100">
                        <th className="text-left pb-3 pr-4">Nom</th>
                        <th className="text-left pb-3 pr-4">Contact</th>
                        <th className="text-left pb-3 whitespace-nowrap">Dernière visite</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 font-medium text-slate-900 whitespace-nowrap">{client.nom}</td>
                          <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                            {client.whatsapp || client.telephone || client.email || "—"}
                          </td>
                          <td className="py-3 text-slate-500 whitespace-nowrap">
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
