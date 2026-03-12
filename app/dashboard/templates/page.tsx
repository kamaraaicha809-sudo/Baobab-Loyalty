"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Icons } from "@/components/common/Icons";
import toast from "react-hot-toast";

const SEGMENT_NAMES: Record<string, string> = {
  "3mois": "Clients - 3 mois",
  "6mois": "Clients - 6 mois",
  "9mois": "Clients - 9 mois",
  tous: "Tous les clients",
};

const TEMPLATES = [
  {
    id: "remise",
    name: "Remise Exceptionnelle",
    description: "20% de réduction sur votre chambre",
    icon: "tag",
    message: "🔥 Offre exceptionnelle ! Bénéficiez de 20% de réduction sur votre prochaine chambre. Valable 7 jours.",
  },
  {
    id: "surclassement",
    name: "Surclassement Offert",
    description: "Un surclassement gratuit en Suite Junior",
    icon: "star",
    message: "⭐ Surprise ! Nous vous offrons un surclassement gratuit en Suite Junior pour votre prochain séjour.",
  },
  {
    id: "cocktail",
    name: "Cocktail de Bienvenue",
    description: "Deux cocktails signature offerts à votre arrivée",
    icon: "cocktail",
    message: "🍸 Bienvenue ! Deux cocktails signature vous sont offerts à votre arrivée. À très bientôt !",
  },
  {
    id: "famille",
    name: "Offre Famille",
    description: "-25% sur la deuxième chambre communicante",
    icon: "users",
    message: "👨‍👩‍👧‍👦 Offre famille ! -25% sur la deuxième chambre communicante. Parfait pour vos vacances en famille.",
  },
  {
    id: "evenements",
    name: "Événements Spéciaux",
    description: "Une surprise vous attend pour votre séjour",
    icon: "calendar",
    message: "🎉 Un séjour spécial vous attend ! Une surprise vous sera réservée. Réservez dès maintenant.",
    defaultIntro: "Célébrons ensemble cet événement spécial ! Profitez de notre offre exclusive :",
    fetes: [
      { id: "ramadan", name: "Ramadan", intro: "Ramadan Kareem ! Pour ce mois sacré, nous vous proposons :", avantage: "IFTAR offert et tarif spécial sur les chambres" },
      { id: "paques", name: "Pâques", intro: "Joyeuses Pâques ! Profitez d'un week-end chocolaté :", avantage: "Chasse aux œufs et brunch de Pâques inclus" },
      { id: "saint-valentin", name: "Saint-Valentin", intro: "L'amour est dans l'air. Pour la Saint Valentin, profitez de :", avantage: "Dîner aux chandelles et décoration romantique offerte" },
      { id: "tabaski", name: "Tabaski", intro: "Aïd el-Kebir Mubarak ! Célébrez la Tabaski avec nous :", avantage: "Déjeuner traditionnel offert pour toute la famille" },
      { id: "saint-sylvestre", name: "Saint-Sylvestre", intro: "Terminez l'année en beauté ! Pour le réveillon de la Saint Sylvestre, nous vous proposons :", avantage: "Soirée de gala, champagne et brunch du nouvel an" },
    ],
  },
];

const ICON_MAP = {
  tag: Icons.Tag,
  star: Icons.Star,
  cocktail: Icons.Cocktail,
  users: Icons.Users,
  calendar: Icons.Calendar,
};

type Fete = { id: string; name: string; intro: string; avantage: string };

function TemplatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const segmentId = searchParams.get("segment") || "";
  const segmentName = SEGMENT_NAMES[segmentId] || "un segment";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFete, setSelectedFete] = useState<Fete | null>(null);
  const [avantage, setAvantage] = useState("");

  const selected = TEMPLATES.find((t) => t.id === selectedId);
  const SelectedIcon = selected ? ICON_MAP[selected.icon as keyof typeof ICON_MAP] : null;
  const fetes = selected?.id === "evenements" && "fetes" in selected ? (selected.fetes as Fete[]) : null;

  // Initialiser l'avantage quand on change de template ou de fête
  useEffect(() => {
    if (selected?.id === "evenements" && selectedFete) {
      setAvantage(selectedFete.avantage);
    } else if (selected) {
      setAvantage(selected.description);
    } else {
      setAvantage("");
    }
  }, [selected?.id, selected?.description, selectedFete?.id, selectedFete?.avantage]);

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
    setSelectedFete(null);
  };

  // Message d'aperçu : différent pour Événements Spéciaux (avec ou sans fête)
  const getPreviewMessage = () => {
    if (selected?.id === "evenements") {
      const evt = selected as { defaultIntro?: string; fetes?: Fete[] };
      if (selectedFete) return selectedFete.intro;
      return evt.defaultIntro ?? "Célébrons ensemble cet événement spécial ! Profitez de notre offre exclusive :";
    }
    return "Cher {nom}, revenez nous voir bientôt ! Pour toute réservation ce mois-ci, nous vous offrons : ";
  };
  const previewMessage = getPreviewMessage();

  const handleValiderEnvoyer = () => {
    if (!selected || !avantage.trim()) {
      toast.error("Renseignez l'avantage et sélectionnez une offre.");
      return;
    }
    const params = new URLSearchParams();
    if (segmentId) params.set("segment", segmentId);
    params.set("template", selected.id);
    params.set("avantage", avantage.trim());
    if (selectedFete) params.set("fete", selectedFete.name);
    router.push(`/dashboard/campaign/confirm?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <Link
            href="/dashboard/segments"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Segments
          </Link>
          {segmentId && (
            <>
              <span className="text-slate-400">/</span>
              <span className="text-sm text-slate-700 font-medium">{segmentName}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Quelle offre envoyer ?
        </h1>
        <p className="text-slate-600 text-base">
          {segmentId
            ? `Vous ciblez « ${segmentName} ». Sélectionnez un template parmi nos 5 offres les plus performantes.`
            : "Sélectionnez un template parmi nos 5 offres les plus performantes."}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Colonne gauche : Liste des templates */}
        <div className="lg:w-[380px] shrink-0 space-y-3">
          {TEMPLATES.map((template) => {
            const IconComponent = ICON_MAP[template.icon as keyof typeof ICON_MAP];
            const isSelected = selectedId === template.id;
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-white border-primary/40 shadow-md"
                    : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected && template.id === "evenements" ? "bg-primary/20 text-primary" : "bg-slate-200/80 text-slate-500"}`}>
                    {IconComponent && <IconComponent />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Colonne droite : Personnalisation */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[320px]">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Icons.Menu />
              Personnalisation rapide
            </h3>

            {selected ? (
              <div className="space-y-5">
                {/* Choix fête (événements uniquement) */}
                {fetes ? (
                  <>
                    <p className="text-sm font-medium text-slate-700">Choisissez une fête :</p>
                    <div className="flex flex-wrap gap-2">
                      {fetes.map((fete) => (
                        <button
                          key={fete.id}
                          onClick={() => setSelectedFete(fete)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedFete?.id === fete.id
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {fete.name}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {/* MODIFIER L'AVANTAGE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Modifier l&apos;avantage (1-2 lignes)
                  </label>
                  <textarea
                    value={avantage}
                    onChange={(e) => setAvantage(e.target.value)}
                    placeholder="Ex : Un surclassement gratuit en Suite Junior"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* APERÇU DU MESSAGE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Aperçu du message
                  </label>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-100/80 border border-slate-200 max-w-md">
                    <p className="text-sm text-slate-700">
                      {previewMessage}
                      <span className="text-primary font-medium italic">&quot;{avantage || "…"}&quot;</span>
                    </p>
                  </div>
                </div>

                {/* BOUTON INTERACTIF */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Bouton interactif
                  </label>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200/80 border border-slate-200 text-slate-700 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Réserver
                  </div>
                </div>

                {/* Valider et envoyer */}
                <button
                  onClick={handleValiderEnvoyer}
                  disabled={!avantage.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Valider et envoyer
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Icons.Cursor />
                <p className="mt-4 text-slate-400 text-sm max-w-[260px]">
                  Sélectionnez une offre à gauche pour commencer la personnalisation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
