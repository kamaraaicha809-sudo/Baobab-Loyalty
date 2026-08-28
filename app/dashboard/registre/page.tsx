"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { user } from "@/src/sdk";
import { clients, type Client } from "@/src/sdk/clients";
import { isDemoMode, demoProfile, demoClients } from "@/src/lib/demo";

const emptyForm = {
  nom: "",
  telephone: "",
  whatsapp: "",
  derniere_visite: new Date().toISOString().split("T")[0],
  type_chambre_preferee: "",
  notes: "",
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

export default function RegistrePage() {
  const [profileId, setProfileId] = useState<string | null>(isDemoMode ? demoProfile.id : null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [recent, setRecent] = useState<Client[]>(isDemoMode ? (demoClients as unknown as Client[]).slice(0, 10) : []);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const loadRecent = useCallback(async (id: string) => {
    try {
      const rows = await clients.getClients(id, 20);
      setRecent(rows);
    } catch {
      toast.error("Impossible de charger le registre.");
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
          setProfileId(profile.id);
          await loadRecent(profile.id);
        } else {
          setLoading(false);
        }
      } catch {
        toast.error("Impossible de charger votre profil.");
        setLoading(false);
      }
    };
    init();
  }, [loadRecent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      toast.success(`${form.nom} ajouté au registre (démo)`);
      setForm(emptyForm);
      return;
    }
    if (!profileId) return;
    if (!form.nom.trim()) {
      toast.error("Le nom du client est requis.");
      return;
    }

    setSaving(true);
    try {
      const created = await clients.addClient(profileId, {
        nom: form.nom,
        telephone: form.telephone || undefined,
        whatsapp: form.whatsapp || undefined,
        derniere_visite: form.derniere_visite,
        type_chambre_preferee: form.type_chambre_preferee || undefined,
        notes: form.notes || undefined,
      });
      setRecent((r) => [created, ...r.filter((c) => c.id !== created.id)].slice(0, 20));
      setForm({ ...emptyForm, derniere_visite: new Date().toISOString().split("T")[0] });
      toast.success(`${created.nom} ajouté au registre`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'ajouter ce client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Registre numérique</h1>
        <p className="text-slate-600 text-base">
          Saisissez ici chaque nouveau client à la réception, à la place du cahier papier — chaque fiche est
          enregistrée immédiatement dans votre base clients Baobab Loyalty et disponible pour vos segments et
          campagnes.
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Nouveau client</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={set("nom")}
                placeholder="Ex : Fatou Ndiaye"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={set("telephone")}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={set("whatsapp")}
                  placeholder="+221771234567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de visite *</label>
              <input
                type="date"
                required
                value={form.derniere_visite}
                onChange={set("derniere_visite")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de chambre</label>
              <input
                type="text"
                value={form.type_chambre_preferee}
                onChange={set("type_chambre_preferee")}
                placeholder="Ex : Suite Junior"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={set("notes")}
                placeholder="Préférences, occasion particulière..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "Ajout..." : "Ajouter au registre"}
            </button>
          </form>
        </section>

        <section className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Derniers clients ajoutés</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Aucun client dans le registre pour le moment.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.nom}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {c.whatsapp || c.telephone || "Pas de contact"}
                      {c.type_chambre_preferee ? ` · ${c.type_chambre_preferee}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(c.derniere_visite)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
