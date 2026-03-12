"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Icons } from "@/components/common/Icons";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { clients } from "@/src/sdk/clients";
import { isDemoMode, demoUser } from "@/src/lib/demo";

const SEGMENT_LABELS: Record<string, string> = {
  "3mois": "Clients - 3 mois",
  "6mois": "Clients - 6 mois",
  "9mois": "Clients - 9 mois",
  tous: "Tous les clients",
};

export default function ConfigurationPage() {
  const [hotelName, setHotelName] = useState("");
  const [configComplete, setConfigComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({ "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 });
  const [profileId, setProfileId] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (isDemoMode) {
      setProfileId(demoUser.id);
      setHotelName("Hôtel Le Baobab");
      setConfigComplete(true);
      setCounts({ "3mois": 124, "6mois": 89, "9mois": 56, tous: 450 });
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setProfileId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("hotel_name, config_complete")
      .eq("id", user.id)
      .single();

    if (profile) {
      setHotelName(profile.hotel_name || "");
      setConfigComplete(profile.config_complete ?? false);
    }

    try {
      const seg = await clients.getSegmentCounts(user.id);
      setCounts(seg);
    } catch {
      setCounts({ "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      toast.success("Configuration enregistrée (démo)");
      setConfigComplete(true);
      return;
    }
    if (!profileId) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          hotel_name: hotelName.trim() || null,
          config_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (error) throw error;
      setConfigComplete(true);
      toast.success("Configuration enregistrée");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !profileId) return;
    if (isDemoMode) {
      toast.success("Import simulé en mode démo");
      setCounts((c) => ({ ...c, tous: c.tous + 50, "3mois": c["3mois"] + 20, "6mois": c["6mois"] + 15, "9mois": c["9mois"] + 15 }));
      setCsvFile(null);
      return;
    }

    setImporting(true);
    try {
      const text = await csvFile.text();
      const rows = clients.parseClientsCSV(text);
      if (rows.length === 0) {
        toast.error("Aucune ligne valide trouvée. Vérifiez le format CSV (nom, email, téléphone, dernière visite).");
        setImporting(false);
        return;
      }

      const { inserted, errors } = await clients.importClients(profileId, rows);
      if (inserted > 0) {
        toast.success(`${inserted} client(s) importé(s)`);
        if (errors.length > 0) {
          toast.error(`${errors.length} erreur(s) : ${errors.slice(0, 2).join(" ; ")}`);
        }
        const seg = await clients.getSegmentCounts(profileId);
        setCounts(seg);
      } else if (errors.length > 0) {
        toast.error(errors[0] || "Erreur d'import");
      }
      setCsvFile(null);
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block"
        >
          ← Retour au dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Configuration de votre compte
        </h1>
        <p className="text-slate-600">
          Configurez votre établissement et importez votre base clients pour utiliser {config.appName}.
        </p>
      </header>

      {/* Informations de l'établissement */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Icons.Settings />
          Informations de l&apos;établissement
        </h2>
        <form onSubmit={handleSaveConfig} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="hotel" className="block text-sm font-medium text-slate-700 mb-1">
              Nom de l&apos;hôtel ou établissement
            </label>
            <input
              id="hotel"
              type="text"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="Ex. Hôtel Le Baobab"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-slate-900 font-semibold hover:opacity-90 disabled:opacity-70"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </section>

      {/* Import base clients */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Icons.Users />
          Base de données clients
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Importez votre liste clients (CSV) avec les colonnes : <strong>nom</strong>, <strong>email</strong>, <strong>téléphone</strong>, <strong>dernière visite</strong> (format JJ/MM/AAAA ou AAAA-MM-JJ).
        </p>

        <form onSubmit={handleImportCSV} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-slate-900 file:font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={!csvFile || importing}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? "Import en cours…" : "Importer"}
          </button>
        </form>

        {/* Comptage par segment */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">Répartition par segment</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(["3mois", "6mois", "9mois", "tous"] as const).map((id) => (
              <div
                key={id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <p className="text-2xl font-bold text-slate-900">{counts[id] ?? 0}</p>
                <p className="text-xs text-slate-500">{SEGMENT_LABELS[id]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
