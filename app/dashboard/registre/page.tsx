"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { user } from "@/src/sdk";
import { clients, type Client, type ChannelConsents, type ConsentChannel } from "@/src/sdk/clients";
import { isDemoMode, demoProfile, demoClients } from "@/src/lib/demo";
import config from "@/config";

const isEurope = config.region === "europe";

// Europe : accord recueilli canal par canal (RGPD / ePrivacy), jamais global.
const EUROPE_CHANNELS: { channel: ConsentChannel; label: string }[] = [
  { channel: "whatsapp", label: "WhatsApp" },
  { channel: "email", label: "E-mail" },
  { channel: "sms", label: "SMS" },
];

const emptyForm = {
  nom: "",
  telephone: "",
  whatsapp: "",
  derniere_visite: new Date().toISOString().split("T")[0],
  date_naissance: "",
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
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [channelChoices, setChannelChoices] = useState<ConsentChannel[]>([]);
  const [consents, setConsents] = useState<Record<string, ChannelConsents>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const loadRecent = useCallback(async (id: string) => {
    try {
      const rows = await clients.getClients(id, 20);
      setRecent(rows);
      if (isEurope) setConsents(await clients.getChannelConsents(rows.map((r) => r.id)));
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
      setWhatsappConsent(false);
      setChannelChoices([]);
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
        date_naissance: form.date_naissance || undefined,
        type_chambre_preferee: form.type_chambre_preferee || undefined,
        notes: form.notes || undefined,
        whatsappConsent: !isEurope && whatsappConsent,
        channelConsents: isEurope ? channelChoices : undefined,
      });
      if (isEurope) {
        const fresh = await clients.getChannelConsents([created.id]);
        setConsents((c) => ({ ...c, ...fresh }));
      }
      setRecent((r) => [created, ...r.filter((c) => c.id !== created.id)].slice(0, 20));
      setForm({ ...emptyForm, derniere_visite: new Date().toISOString().split("T")[0] });
      setWhatsappConsent(false);
      setChannelChoices([]);
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
        {isEurope ? (
          <>
            <p className="text-slate-600 text-base">
              Saisissez ici chaque nouveau client à la réception — chaque fiche est enregistrée immédiatement dans
              votre base clients {config.appName} et disponible pour vos segments et campagnes.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ce registre sert uniquement à la fidélisation. Il ne remplace pas les formalités d&apos;enregistrement
              des voyageurs imposées par la loi de votre pays — en France, la fiche individuelle de police que tout
              client de nationalité étrangère doit remplir et signer à son arrivée (articles R. 814-1 et suivants du
              CESEDA). N&apos;y saisissez pas de données d&apos;identité (numéro de passeport, nationalité) : seules
              les informations utiles à la relation client ont leur place ici.
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-600 text-base">
              Saisissez ici chaque nouveau client à la réception — chaque fiche est enregistrée immédiatement dans
              votre base clients {config.appName} et disponible pour vos segments et campagnes.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ce registre sert à la fidélisation. Il ne remplace pas la fiche de police que votre hôtel doit
              continuer à remplir pour chaque voyageur.
            </p>
          </>
        )}
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
                placeholder={isEurope ? "Ex : Claire Martin" : "Ex : Fatou Ndiaye"}
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
                  placeholder={isEurope ? "+33 6 12 34 56 78" : "+221 77 123 45 67"}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={set("whatsapp")}
                  placeholder={isEurope ? "+33612345678" : "+221771234567"}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
              <input
                type="date"
                value={form.date_naissance}
                onChange={set("date_naissance")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-slate-400">Optionnel — permet d&apos;envoyer un message d&apos;anniversaire automatique (voir Anniversaires).</p>
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
            {isEurope && (
              <fieldset className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <legend className="px-1 text-sm font-medium text-slate-700">Accord pour recevoir les offres de l&apos;hôtel</legend>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                  {EUROPE_CHANNELS.map(({ channel, label }) => (
                    <label key={channel} htmlFor={`registre-consent-${channel}`} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                      <input
                        id={`registre-consent-${channel}`}
                        type="checkbox"
                        checked={channelChoices.includes(channel)}
                        onChange={(e) =>
                          setChannelChoices((prev) =>
                            e.target.checked ? [...prev, channel] : prev.filter((c) => c !== channel)
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Cochez uniquement les canaux pour lesquels le client vient de donner son accord explicite. La date et
                  l&apos;origine (registre) sont enregistrées automatiquement. Sans case cochée, il ne recevra aucune
                  campagne ni message d&apos;anniversaire sur ce canal.
                </p>
              </fieldset>
            )}
            {!isEurope && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="registre-whatsapp-consent" className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    id="registre-whatsapp-consent"
                    type="checkbox"
                    checked={whatsappConsent}
                    onChange={(e) => setWhatsappConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700">
                    Le client accepte de recevoir les offres de l&apos;hôtel par WhatsApp
                  </span>
                </label>
                <p className="mt-1.5 pl-6 text-xs text-slate-500">
                  Cochez seulement si le client vient de vous donner son accord. Sans accord, il ne recevra
                  aucune campagne ni message d&apos;anniversaire (loi n° 2013-546, art. 14).
                </p>
              </div>
            )}
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
                  <div className="shrink-0 flex items-center gap-2">
                    {isEurope &&
                      EUROPE_CHANNELS.filter(({ channel }) => consents[c.id]?.[channel]?.optedIn).map(({ channel, label }) => (
                        <span
                          key={channel}
                          title={`Accord enregistré le ${formatDate(consents[c.id]?.[channel]?.updatedAt ?? "")}`}
                          className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"
                        >
                          Accord {label}
                        </span>
                      ))}
                    {!isEurope && c.marketing_consent === true && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                        Accord WhatsApp
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{formatDate(c.derniere_visite)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
