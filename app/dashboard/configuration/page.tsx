"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Icons } from "@/components/common/Icons";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { clients } from "@/src/sdk/clients";
import { isDemoMode, demoUser, demoProfile, demoSegmentCounts } from "@/src/lib/demo";

const SEGMENT_LABELS: Record<string, string> = {
  "3mois": "Clients - 3 mois",
  "6mois": "Clients - 6 mois",
  "9mois": "Clients - 9 mois",
  tous: "Tous les clients",
};

const ROOM_TYPE_LIST = [
  { key: "Standard", label: "Chambre Standard" },
  { key: "Twins", label: "Chambre Twins (2 lits simples)" },
  { key: "Deluxe", label: "Chambre Deluxe" },
  { key: "Familiale", label: "Chambre Familiale" },
  { key: "Suite Junior", label: "Suite Junior" },
  { key: "Suite", label: "Suite" },
  { key: "Suite Présidentielle", label: "Suite Présidentielle" },
  { key: "Appartement", label: "Appartement" },
];

interface RoomTypeRow {
  id?: string;
  name: string;
  nombre_chambres: string;
  base_price_fcfa: string;
}

interface ProfileForm {
  hotel_name: string;
  adresse_physique: string;
  adresse_postale: string;
  email_principal: string;
  telephone_officiel: string;
  nom_responsable: string;
  telephone_responsable: string;
  email_responsable: string;
  latitude: string;
  longitude: string;
}

const emptyForm: ProfileForm = {
  hotel_name: "",
  adresse_physique: "",
  adresse_postale: "",
  email_principal: "",
  telephone_officiel: "",
  nom_responsable: "",
  telephone_responsable: "",
  email_responsable: "",
  latitude: "",
  longitude: "",
};

export default function ConfigurationPage() {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [configComplete, setConfigComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>(
    ROOM_TYPE_LIST.map((r) => ({ name: r.key, nombre_chambres: "", base_price_fcfa: "" }))
  );
  const [savingRooms, setSavingRooms] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({ "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 });
  const [profileId, setProfileId] = useState<string | null>(null);

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const loadProfile = useCallback(async () => {
    if (isDemoMode) {
      setProfileId(demoUser.id);
      setForm({ ...emptyForm, hotel_name: demoProfile.hotel_name });
      setConfigComplete(demoProfile.config_complete);
      setCounts(demoSegmentCounts);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    setProfileId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("hotel_name, config_complete, adresse_physique, adresse_postale, email_principal, telephone_officiel, nom_responsable, telephone_responsable, email_responsable, latitude, longitude")
      .eq("id", user.id)
      .single();

    if (profile) {
      setForm({
        hotel_name: profile.hotel_name || "",
        adresse_physique: profile.adresse_physique || "",
        adresse_postale: profile.adresse_postale || "",
        email_principal: profile.email_principal || "",
        telephone_officiel: profile.telephone_officiel || "",
        nom_responsable: profile.nom_responsable || "",
        telephone_responsable: profile.telephone_responsable || "",
        email_responsable: profile.email_responsable || "",
        latitude: profile.latitude?.toString() || "",
        longitude: profile.longitude?.toString() || "",
      });
      setConfigComplete(profile.config_complete ?? false);
    }

    const { data: existingRooms } = await supabase
      .from("room_types")
      .select("id, name, nombre_chambres, base_price_fcfa")
      .eq("profile_id", user.id);

    if (existingRooms && existingRooms.length > 0) {
      setRoomTypes(
        ROOM_TYPE_LIST.map((r) => {
          const found = existingRooms.find((e) => e.name === r.key);
          return {
            id: found?.id,
            name: r.key,
            nombre_chambres: found?.nombre_chambres?.toString() || "",
            base_price_fcfa: found?.base_price_fcfa?.toString() || "",
          };
        })
      );
    }

    try {
      const seg = await clients.getSegmentCounts(user.id);
      setCounts(seg);
    } catch {
      setCounts({ "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée par votre navigateur");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
        toast.success("Position détectée");
      },
      () => {
        setGeoLoading(false);
        toast.error("Impossible de détecter la position");
      }
    );
  };

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
          hotel_name: form.hotel_name.trim() || null,
          adresse_physique: form.adresse_physique.trim() || null,
          adresse_postale: form.adresse_postale.trim() || null,
          email_principal: form.email_principal.trim() || null,
          telephone_officiel: form.telephone_officiel.trim() || null,
          nom_responsable: form.nom_responsable.trim() || null,
          telephone_responsable: form.telephone_responsable.trim() || null,
          email_responsable: form.email_responsable.trim() || null,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
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

  const handleSaveRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) { toast.success("Chambres enregistrées (démo)"); return; }
    if (!profileId) return;

    setSavingRooms(true);
    try {
      const supabase = createClient();
      const toSave = roomTypes.filter((r) => r.nombre_chambres || r.base_price_fcfa);

      for (const room of toSave) {
        const payload = {
          profile_id: profileId,
          name: room.name,
          nombre_chambres: room.nombre_chambres ? parseInt(room.nombre_chambres) : 0,
          base_price_fcfa: room.base_price_fcfa ? parseInt(room.base_price_fcfa) : 0,
          updated_at: new Date().toISOString(),
        };

        if (room.id) {
          await supabase.from("room_types").update(payload).eq("id", room.id);
        } else {
          const { data } = await supabase.from("room_types").insert(payload).select("id").single();
          if (data) {
            setRoomTypes((prev) =>
              prev.map((r) => (r.name === room.name ? { ...r, id: data.id } : r))
            );
          }
        }
      }
      toast.success("Types de chambres enregistrés");
    } catch {
      toast.error("Erreur lors de l'enregistrement des chambres");
    } finally {
      setSavingRooms(false);
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
        toast.error("Aucune ligne valide trouvée. Vérifiez le format CSV.");
        setImporting(false);
        return;
      }
      const { inserted, errors } = await clients.importClients(profileId, rows);
      if (inserted > 0) {
        toast.success(`${inserted} client(s) importé(s)`);
        if (errors.length > 0) toast.error(`${errors.length} erreur(s)`);
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

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="space-y-8">
      <header>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
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
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Icons.Settings />
          Informations de l&apos;établissement
        </h2>
        <form onSubmit={handleSaveConfig} className="space-y-6">

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Hôtel</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="hotel" className={labelClass}>Nom de l&apos;hôtel ou établissement</label>
                <input id="hotel" type="text" value={form.hotel_name} onChange={set("hotel_name")} placeholder="Ex. Hôtel Le Baobab" className={inputClass} />
              </div>
              <div>
                <label htmlFor="adresse_physique" className={labelClass}>Adresse physique</label>
                <input id="adresse_physique" type="text" value={form.adresse_physique} onChange={set("adresse_physique")} placeholder="Ex. 12 Avenue de la Paix, Dakar" className={inputClass} />
              </div>
              <div>
                <label htmlFor="adresse_postale" className={labelClass}>Adresse postale</label>
                <input id="adresse_postale" type="text" value={form.adresse_postale} onChange={set("adresse_postale")} placeholder="Ex. BP 1234, Dakar" className={inputClass} />
              </div>
              <div>
                <label htmlFor="email_principal" className={labelClass}>Email principal de l&apos;hôtel</label>
                <input id="email_principal" type="email" value={form.email_principal} onChange={set("email_principal")} placeholder="contact@monhotel.com" className={inputClass} />
              </div>
              <div>
                <label htmlFor="telephone_officiel" className={labelClass}>Numéro officiel de l&apos;hôtel</label>
                <input id="telephone_officiel" type="tel" value={form.telephone_officiel} onChange={set("telephone_officiel")} placeholder="+221 33 000 00 00" className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Responsable du compte</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="nom_responsable" className={labelClass}>Nom du propriétaire ou responsable</label>
                <input id="nom_responsable" type="text" value={form.nom_responsable} onChange={set("nom_responsable")} placeholder="Ex. Amadou Diallo" className={inputClass} />
              </div>
              <div>
                <label htmlFor="telephone_responsable" className={labelClass}>Téléphone personnel</label>
                <input id="telephone_responsable" type="tel" value={form.telephone_responsable} onChange={set("telephone_responsable")} placeholder="+221 77 000 00 00" className={inputClass} />
              </div>
              <div>
                <label htmlFor="email_responsable" className={labelClass}>Email personnel</label>
                <input id="email_responsable" type="email" value={form.email_responsable} onChange={set("email_responsable")} placeholder="responsable@email.com" className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Géolocalisation</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className={labelClass}>Latitude</label>
                <input id="latitude" type="text" value={form.latitude} onChange={set("latitude")} placeholder="Ex. 14.693425" className={inputClass} />
              </div>
              <div>
                <label htmlFor="longitude" className={labelClass}>Longitude</label>
                <input id="longitude" type="text" value={form.longitude} onChange={set("longitude")} placeholder="Ex. -17.447938" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={geoLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {geoLoading ? "Détection en cours…" : "Détecter ma position automatiquement"}
                </button>
              </div>
            </div>
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

      {/* Types de chambres */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Icons.Settings />
          Types de chambres
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Renseignez le nombre de chambres et le prix normal par nuit (en FCFA) pour chaque type.
        </p>
        <form onSubmit={handleSaveRooms}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 font-medium text-slate-700">Type de chambre</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-700">Nombre de chambres</th>
                  <th className="text-left py-2 font-medium text-slate-700">Prix / nuit (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ROOM_TYPE_LIST.map((r, i) => (
                  <tr key={r.key}>
                    <td className="py-3 pr-4 font-medium text-slate-800">{r.label}</td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min="0"
                        value={roomTypes[i]?.nombre_chambres || ""}
                        onChange={(e) =>
                          setRoomTypes((prev) =>
                            prev.map((rt, idx) => idx === i ? { ...rt, nombre_chambres: e.target.value } : rt)
                          )
                        }
                        placeholder="0"
                        className="w-28 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={roomTypes[i]?.base_price_fcfa || ""}
                          onChange={(e) =>
                            setRoomTypes((prev) =>
                              prev.map((rt, idx) => idx === i ? { ...rt, base_price_fcfa: e.target.value } : rt)
                            )
                          }
                          placeholder="Ex. 45000"
                          className="w-36 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                        />
                        <span className="text-slate-500 text-xs">FCFA</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={savingRooms}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-slate-900 font-semibold hover:opacity-90 disabled:opacity-70"
            >
              {savingRooms ? "Enregistrement…" : "Enregistrer les chambres"}
            </button>
          </div>
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

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">Répartition par segment</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(["3mois", "6mois", "9mois", "tous"] as const).map((id) => (
              <div key={id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
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
