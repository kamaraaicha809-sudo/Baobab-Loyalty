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

interface WhatsAppForm {
  phone_number_id: string;
  access_token: string;
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
  const [importStatus, setImportStatus] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>({ "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 });
  const [profileId, setProfileId] = useState<string | null>(null);
  const [waForm, setWaForm] = useState<WhatsAppForm>({ phone_number_id: "", access_token: "" });
  const [waConfigured, setWaConfigured] = useState(false);
  const [savingWa, setSavingWa] = useState(false);

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
      .select("hotel_name, config_complete, adresse_physique, adresse_postale, email_principal, telephone_officiel, nom_responsable, telephone_responsable, email_responsable, latitude, longitude, whatsapp_phone_number_id, whatsapp_access_token")
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
      if (profile.whatsapp_phone_number_id) {
        setWaForm({ phone_number_id: profile.whatsapp_phone_number_id, access_token: "" });
        setWaConfigured(true);
      }
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

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) { toast.success("WhatsApp configuré (démo)"); setWaConfigured(true); return; }
    if (!profileId) return;
    if (!waForm.phone_number_id.trim()) { toast.error("Le Phone Number ID est requis"); return; }

    setSavingWa(true);
    try {
      const supabase = createClient();
      const update: Record<string, string> = { whatsapp_phone_number_id: waForm.phone_number_id.trim() };
      if (waForm.access_token.trim()) {
        update.whatsapp_access_token = waForm.access_token.trim();
      }
      const { error } = await supabase.from("profiles").update(update).eq("id", profileId);
      if (error) throw error;
      setWaConfigured(true);
      setWaForm((f) => ({ ...f, access_token: "" }));
      toast.success("Identifiants WhatsApp enregistrés");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingWa(false);
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
    setImportStatus("Lecture du fichier CSV...");
    try {
      const text = await csvFile.text();
      const rows = clients.parseClientsCSV(text);
      if (rows.length === 0) {
        toast.error("Aucune ligne valide trouvée. Vérifiez le format CSV.");
        setImporting(false);
        setImportStatus("");
        return;
      }
      setImportStatus(`Importation de ${rows.length} client(s) détecté(s)...`);
      const { inserted, errors } = await clients.importClients(profileId, rows);
      if (inserted > 0) {
        toast.success(`${inserted} client(s) importé(s)`);
        if (errors.length > 0) toast.error(`${errors.length} erreur(s)`);
        setImportStatus(`${inserted} client(s) importé(s) avec succès`);
        const seg = await clients.getSegmentCounts(profileId);
        setCounts(seg);
      } else if (errors.length > 0) {
        toast.error(errors[0] || "Erreur d'import");
        setImportStatus("");
      }
      setCsvFile(null);
    } catch {
      toast.error("Erreur lors de l'import");
      setImportStatus("");
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

        {/* Avertissement ordinateur requis */}
        <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Cette étape nécessite un ordinateur</p>
            <p className="text-sm text-amber-700 mt-0.5">
              L&apos;import de votre base clients (fichier CSV) et la configuration complète de votre hôtel doivent être effectués depuis un ordinateur, là où se trouve votre fichier clients.
            </p>
          </div>
        </div>
      </header>

      {/* Informations de l'établissement */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Icons.Settings />
            Informations de l&apos;établissement
          </h2>
          {/* H4 — Badge configuration complète */}
          {configComplete && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Configuration complète
            </span>
          )}
        </div>
        <form onSubmit={handleSaveConfig} className="space-y-6">

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Hôtel</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="hotel" className={labelClass}>
                  Nom de l&apos;hôtel ou établissement
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="hotel" type="text" required value={form.hotel_name} onChange={set("hotel_name")} placeholder="Ex. Hôtel Le Baobab" className={inputClass} />
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
                <label htmlFor="nom_responsable" className={labelClass}>
                  Nom du propriétaire ou responsable
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="nom_responsable" type="text" required value={form.nom_responsable} onChange={set("nom_responsable")} placeholder="Ex. Amadou Diallo" className={inputClass} />
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
                  {geoLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      Détection en cours…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      Détecter ma position automatiquement
                    </>
                  )}
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

      {/* WhatsApp Business API */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp Business API
          </h2>
          {waConfigured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Connecté
            </span>
          )}
        </div>
        <p className="text-slate-600 text-sm mb-5">
          Connectez votre compte WhatsApp Business pour que vos clients reçoivent les messages directement depuis le numéro de votre hôtel.
        </p>

        {/* Info banner */}
        <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-sm text-blue-800">
            Vous ne savez pas où trouver ces identifiants ?{" "}
            <a
              href="/docs/guide-whatsapp-business-hoteliers.md"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Consultez le guide étape par étape
            </a>{" "}
            pour créer votre compte Meta WhatsApp Business en 30 minutes.
          </p>
        </div>

        <form onSubmit={handleSaveWhatsApp} className="space-y-4">
          <div>
            <label className={labelClass}>Phone Number ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={waForm.phone_number_id}
              onChange={(e) => setWaForm((f) => ({ ...f, phone_number_id: e.target.value }))}
              placeholder="Ex : 123456789012345"
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Trouvez cette valeur dans Meta for Developers → WhatsApp → Démarrage rapide</p>
          </div>
          <div>
            <label className={labelClass}>
              Access Token {waConfigured && <span className="text-xs font-normal text-slate-400">(laisser vide pour conserver l&apos;actuel)</span>}
              {!waConfigured && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type="password"
              value={waForm.access_token}
              onChange={(e) => setWaForm((f) => ({ ...f, access_token: e.target.value }))}
              placeholder={waConfigured ? "••••••••••••••••" : "EAABcd..."}
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Token permanent généré depuis les Utilisateurs Système de votre compte Meta Business</p>
          </div>
          <button
            type="submit"
            disabled={savingWa}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-70"
          >
            {savingWa ? "Enregistrement…" : waConfigured ? "Mettre à jour" : "Connecter WhatsApp"}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Import en cours…
              </>
            ) : "Importer"}
          </button>
        </form>
        {/* M2 — Feedback progression import */}
        {importStatus && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            {importing && <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin shrink-0" />}
            {!importing && (
              <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
            <span className={importing ? "" : "text-green-700 font-medium"}>{importStatus}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Synchronisation planifiée via API</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Si votre PMS dispose d&apos;une API, nous créons une Edge Function qui tourne toutes les nuits pour récupérer automatiquement les nouveaux clients et mettre à jour les existants.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-slate-200">
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
