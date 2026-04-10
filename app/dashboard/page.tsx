"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { user, billing } from "@/src/sdk";
import { reservations } from "@/src/sdk/reservations";
import config from "@/config";
import { isDemoMode, demoUser, demoChartData, demoFlux, demoCampagnesSummary, demoMetrics } from "@/src/lib/demo";

const maxChartFromData = (data: { directes: number; autres: number }[]) =>
  Math.max(1, ...data.flatMap((d) => d.directes + d.autres));

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ id?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [chartData, setChartData] = useState(demoChartData);
  const [impactCount, setImpactCount] = useState<number>(0);
  const [totalFromApp, setTotalFromApp] = useState<number>(12);

  const displayName = isDemoMode
    ? demoUser.user_metadata.full_name
    : profile?.email?.split("@")[0] || "Utilisateur";

  const getDemoImpactCount = () => demoMetrics.impactToday;

  useEffect(() => {
    const loadProfile = async () => {
      if (isDemoMode) {
        setProfile({ email: demoUser.email, id: demoUser.id });
        setChartData(demoChartData);
        setImpactCount(getDemoImpactCount());
        setTotalFromApp(demoMetrics.totalReservationsFromApp);
        setLoading(false);
        return;
      }
      try {
        const data = await user.getProfile();
        setProfile(data);
        if (data?.id) {
          try {
            const [chart, todayCount, fromAppCount] = await Promise.all([
              reservations.getReservationsChart(data.id),
              reservations.getReservationsTodayCount(data.id),
              reservations.getReservationsFromAppCount(data.id),
            ]);
            const hasData = chart.some((d) => d.directes > 0 || d.autres > 0);
            if (hasData) setChartData(chart);
            setImpactCount(todayCount);
            setTotalFromApp(fromAppCount);
          } catch {
            setImpactCount(0);
            setTotalFromApp(0);
          }
        } else {
          setImpactCount(0);
        }
      } catch {
        setProfile(null);
        setImpactCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Réabonnement temps réel : met à jour le compteur à chaque nouvelle réservation
  useEffect(() => {
    if (isDemoMode || !profile?.id) return;
    const setupRealtime = async () => {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const channel = supabase
        .channel("reservations-impact")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "reservations",
            filter: `profile_id=eq.${profile.id}`,
          },
          async () => {
            try {
              const count = await reservations.getReservationsTodayCount(profile.id!);
              setImpactCount(count);
            } catch {
              // Ignorer les erreurs de rafraîchissement
            }
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    };
    let cleanup: (() => void) | void;
    setupRealtime().then((fn) => {
      cleanup = fn;
    });
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [profile?.id, isDemoMode]);

  const handleManageSubscription = async () => {
    if (isDemoMode) {
      router.push("/dashboard");
      return;
    }
    setPortalLoading(true);
    try {
      const { url } = await billing.createPortal({ returnUrl: window.location.href });
      window.location.href = url;
    } catch {
      router.push("/dashboard");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header (comme image 2) */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
            Bonjour, {displayName}
          </h1>
          <p className="text-slate-500 text-sm">
            Voici vos performances de relance client.
          </p>
        </div>
        <Link
          href="/dashboard/segments"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          Lancer une relance
        </Link>
      </header>

      {/* Deux cartes métriques — M3: hiérarchie visuelle KPI principal en premier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* KPI principal */}
        <div className="bg-[var(--color-main)] p-5 rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
            <span className="text-xs font-semibold text-slate-700 bg-slate-900/10 px-2 py-1 rounded-full">+20% vs mois dernier</span>
          </div>
          <p className="text-5xl font-bold text-slate-900">{loading ? "—" : totalFromApp}</p>
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mt-1.5">
            Réservations via {config.appName}
          </p>
        </div>
        {/* KPI secondaire */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-end justify-end mb-3">
            <span className="text-xs text-slate-400">Derniers 3 jours</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isDemoMode ? demoMetrics.revenueFormatted : "120 000"} FCFA</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
            Généré via {config.appName}
          </p>
        </div>
      </div>

      {/* H1 — État vide: guide l'utilisateur vers la configuration */}
      {!loading && !isDemoMode && totalFromApp === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-amber-900 mb-1">Aucune réservation encore générée</p>
            <p className="text-sm text-amber-700">
              Importez votre base clients et configurez votre hôtel pour commencer à relancer vos clients via {config.appName}.
            </p>
          </div>
          <Link
            href="/dashboard/configuration"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-900 text-white text-sm font-semibold rounded-lg hover:bg-amber-800 transition-colors"
          >
            Configurer mon hôtel
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}

      {/* Layout 2 colonnes: gauche (Performance + Campagnes), droite (Flux + Impact global) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-900">
                Performance des réservations obtenues grâce à {config.appName}
              </h2>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-primary shrink-0"></span>
                  DIRECTES
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-slate-300 shrink-0"></span>
                  AUTRES
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-1 sm:gap-2 pt-2" style={{ height: 180 }}>
              {chartData.map((d) => {
                const maxChart = maxChartFromData(chartData);
                const total = d.directes + d.autres;
                const barHeightPx = maxChart > 0 ? Math.max(20, Math.round((total / maxChart) * 140)) : 20;
                const directesPx = total > 0 ? Math.round((d.directes / total) * barHeightPx) : 0;
                const autresPx = barHeightPx - directesPx;
                return (
                  <div key={d.jour} className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0">
                    <div
                      className="w-full max-w-[36px] rounded-t overflow-hidden flex flex-col-reverse"
                      style={{ height: barHeightPx + "px", minHeight: 20 }}
                    >
                      <div
                        className="w-full bg-slate-300"
                        style={{ height: autresPx + "px", minHeight: autresPx > 0 ? 4 : 0 }}
                      />
                      <div
                        className="w-full bg-[#EBC161]"
                        style={{ height: directesPx + "px", minHeight: directesPx > 0 ? 4 : 0 }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 truncate w-full text-center">{d.jour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dernières campagnes */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200">
            <h2 className="font-bold text-base text-slate-900 mb-4">
              Dernières campagnes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-3 pr-4 font-medium">DATE</th>
                    <th className="pb-3 pr-4 font-medium">SEGMENT</th>
                    <th className="pb-3 pr-4 font-medium">OFFRE</th>
                    <th className="pb-3 pr-4 font-medium">RÉSULTATS</th>
                    <th className="pb-3 font-medium">STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {demoCampagnesSummary.map((c, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-3 pr-4 text-slate-600">{c.date}</td>
                      <td className="py-3 pr-4 text-slate-600">{c.segment}</td>
                      <td className="py-3 pr-4 text-slate-600">{c.offre}</td>
                      <td className="py-3 pr-4 text-green-600 font-medium">{c.resultats}</td>
                      <td className="py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          {c.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne droite - 1/3 */}
        <div className="space-y-4">
          {/* Flux en direct */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Flux en direct
            </h2>
            <div className="space-y-3">
              {demoFlux.map((f, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#d97706" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75v-.7V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {f.client} vient de réserver à {f.hotel}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                          {f.offre}
                        </span>
                        <span className="text-xs text-slate-400">{f.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact global (carte noire - image 3) */}
          <div className="bg-slate-900 p-5 rounded-xl text-white shadow-lg">
            <div className="flex justify-center gap-1 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <p className="text-center text-xs font-semibold text-white/90 uppercase tracking-wider mb-1">
              Impact global
            </p>
            <p className="text-center text-4xl font-bold">{impactCount}</p>
            <p className="text-center text-sm text-white/80 mt-0.5">
              Réservations via {config.appName} aujourd&apos;hui
            </p>
          </div>
        </div>
      </div>

      {/* Mon compte (replié / raccourci) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200">
        <h2 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Mon compte
        </h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-sm text-slate-500">Email</span>
              <p className="text-sm font-medium text-slate-900">{profile?.email || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Plan</span>
              <p>
                <span className="inline-flex gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Actif
                </span>
              </p>
            </div>
            <Link
              href="/dashboard/abonnement"
              className="inline-block px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Gérer mon abonnement
            </Link>
          </div>
        )}
      </div>

      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">
          <p className="text-amber-800">
            <strong>Mode démo actif</strong> — Les données affichées sont fictives.
          </p>
        </div>
      )}
    </div>
  );
}
