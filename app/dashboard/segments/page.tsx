"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/components/common/Icons";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { clients } from "@/src/sdk/clients";
import { isDemoMode } from "@/src/lib/demo";

// Segments basés sur la dernière visite — connectés à la base clients
const SEGMENT_DEFINITIONS = [
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

const DEMO_COUNTS = { "3mois": 124, "6mois": 89, "9mois": 56, tous: 450 };

export default function SegmentsPage() {
  const [counts, setCounts] = useState<Record<string, number>>(DEMO_COUNTS);

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        setCounts(DEMO_COUNTS);
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const seg = await clients.getSegmentCounts(user.id);
        setCounts(seg);
      } catch {
        setCounts(DEMO_COUNTS);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header>
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
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SEGMENT_DEFINITIONS.map((segment) => (
          <Link
            key={segment.id}
            href={`/dashboard/templates?segment=${segment.id}`}
            className="block p-5 rounded-xl border border-slate-200 bg-white hover:border-primary/40 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-slate-400 shrink-0 mt-0.5">
                  {segment.icon === "clock" ? <Icons.Clock /> : <Icons.Users />}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{segment.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{segment.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-2xl sm:text-3xl font-bold text-slate-900">
                  {counts[segment.id] ?? "—"}
                </span>
                <span className="text-xs text-slate-400 uppercase font-medium">clients</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
