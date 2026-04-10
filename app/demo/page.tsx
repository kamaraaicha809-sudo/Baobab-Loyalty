"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Données de la démo ──────────────────────────────────────────────────────

const SEGMENTS = [
  {
    id: "3mois",
    label: "Clients - 3 mois",
    count: 124,
    description: "Inactifs depuis 3 mois",
    badge: "Relance facile",
    badgeColor: "bg-amber-100 text-amber-700",
    ringColor: "ring-amber-400",
  },
  {
    id: "6mois",
    label: "Clients - 6 mois",
    count: 89,
    description: "Inactifs depuis 6 mois",
    badge: "Prioritaire",
    badgeColor: "bg-orange-100 text-orange-700",
    ringColor: "ring-orange-400",
  },
  {
    id: "9mois",
    label: "Clients - 9 mois",
    count: 56,
    description: "Inactifs depuis 9 mois",
    badge: "Urgent",
    badgeColor: "bg-red-100 text-red-700",
    ringColor: "ring-red-400",
  },
  {
    id: "tous",
    label: "Tous les clients",
    count: 269,
    description: "Base complète",
    badge: "Grande portée",
    badgeColor: "bg-green-100 text-green-700",
    ringColor: "ring-green-400",
  },
];

const TEMPLATES = [
  {
    id: "remise",
    name: "Remise Exceptionnelle",
    description: "20% de réduction sur votre chambre",
    avantage: "20% de réduction sur votre prochaine chambre",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    id: "surclassement",
    name: "Surclassement Offert",
    description: "Suite Junior gratuite à l'arrivée",
    avantage: "un surclassement gratuit en Suite Junior",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    id: "cocktail",
    name: "Cocktail de Bienvenue",
    description: "2 cocktails signature offerts",
    avantage: "deux cocktails signature offerts à votre arrivée",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "famille",
    name: "Offre Famille",
    description: "-25% sur la 2ème chambre",
    avantage: "-25% sur la deuxième chambre communicante",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const DEMO_MESSAGE: Record<string, (avantage: string) => string> = {
  "3mois": (a) =>
    `Bonjour {{nom}}, cela fait un moment que vous n'êtes pas venus nous voir à l'Hôtel Le Baobab ! Pour votre prochain séjour, nous avons une surprise : ${a}. Réservez avant la fin du mois pour en profiter.`,
  "6mois": (a) =>
    `{{nom}}, vous nous manquez vraiment ! Pour fêter votre retour à l'Hôtel Le Baobab, nous vous offrons ${a}. Cette offre exclusive vous est réservée jusqu'à la fin du mois — profitez-en.`,
  "9mois": (a) =>
    `Cher {{nom}}, cela fait bien longtemps et nous pensons souvent à vous ! Pour votre retour tant attendu, nous avons une surprise : ${a}, rien que pour vous. Répondez simplement OUI et nous nous occupons du reste.`,
  "tous": (a) =>
    `Bonjour {{nom}}, l'équipe de l'Hôtel Le Baobab pense à vous ! Pour votre prochaine visite, profitez de ${a}. Réservez dès maintenant, nous serons ravis de vous accueillir.`,
};

const STEPS = [
  "Segment",
  "Template",
  "Message",
  "Envoi",
  "Réservation",
];

// ─── Composant principal ─────────────────────────────────────────────────────

export default function DemoPage() {
  const [step, setStep] = useState(1);
  const [selectedSegment, setSelectedSegment] = useState<typeof SEGMENTS[0] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [avantage, setAvantage] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [notifVisible, setNotifVisible] = useState(false);

  // Envoi : progression automatique
  useEffect(() => {
    if (step !== 4) return;
    setSendProgress(0);
    setNotifVisible(false);
    const duration = 3000;
    const interval = 40;
    const stepVal = (100 / duration) * interval;
    const timer = setInterval(() => {
      setSendProgress((p) => {
        const next = Math.min(100, p + stepVal);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setStep(5), 400);
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [step]);

  // Notif réservation : apparaît avec délai
  useEffect(() => {
    if (step !== 5) return;
    const t = setTimeout(() => setNotifVisible(true), 600);
    return () => clearTimeout(t);
  }, [step]);

  const handleSelectSegment = (seg: typeof SEGMENTS[0]) => {
    setSelectedSegment(seg);
    setSelectedTemplate(null);
    setAvantage("");
    setGeneratedMessage(null);
    setStep(2);
  };

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSelectedTemplate(tpl);
    setAvantage(tpl.avantage);
    setGeneratedMessage(null);
    setStep(3);
  };

  const handleGenerateAI = async () => {
    if (!selectedSegment || !selectedTemplate) return;
    setGenerating(true);
    setGeneratedMessage(null);
    await new Promise((r) => setTimeout(r, 1400));
    const msg = DEMO_MESSAGE[selectedSegment.id]?.(avantage) ?? DEMO_MESSAGE["tous"](avantage);
    setGeneratedMessage(msg);
    setGenerating(false);
  };

  const handleEnvoyer = () => {
    setStep(4);
  };

  const handleRestart = () => {
    setStep(1);
    setSelectedSegment(null);
    setSelectedTemplate(null);
    setAvantage("");
    setGeneratedMessage(null);
    setSendProgress(0);
    setNotifVisible(false);
  };

  const displayMessage =
    generatedMessage ??
    (selectedSegment && selectedTemplate
      ? DEMO_MESSAGE[selectedSegment.id]?.(avantage) ?? ""
      : "");

  return (
    <div className="min-h-screen bg-[#FDFDF9]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Démo interactive</span>
          </div>
          <Link
            href="/#tarifs"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Je m&apos;abonner
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Titre */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Lancez votre première campagne
          </h1>
          <p className="text-slate-500 text-base">
            Suivez les 5 étapes comme si vous étiez déjà client — aucune inscription requise.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done
                        ? "bg-primary text-white"
                        : active
                        ? "bg-slate-900 text-white ring-4 ring-slate-900/20"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {done ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      n
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${active ? "text-slate-900" : done ? "text-primary" : "text-slate-400"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-10 sm:w-16 h-0.5 mb-5 mx-1 transition-all ${done ? "bg-primary" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Étape 1 : Segments ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">
                Étape 1 / 5
              </span>
              <h2 className="text-xl font-bold text-slate-900">Qui souhaitez-vous relancer ?</h2>
              <p className="text-slate-500 text-sm mt-1">Choisissez le segment de clients à cibler avec votre campagne WhatsApp.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {SEGMENTS.map((seg) => (
                <button
                  key={seg.id}
                  onClick={() => handleSelectSegment(seg)}
                  className="p-5 rounded-xl border-2 border-slate-200 bg-white text-left hover:border-slate-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-base">{seg.label}</p>
                      <p className="text-slate-500 text-sm mt-0.5">{seg.description}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${seg.badgeColor}`}>
                      {seg.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">{seg.count}</span>
                    <span className="text-slate-400 text-sm">clients</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all group-hover:opacity-80"
                      style={{ width: `${Math.round((seg.count / 269) * 100)}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Étape 2 : Template ── */}
        {step === 2 && selectedSegment && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">
                Étape 2 / 5
              </span>
              <h2 className="text-xl font-bold text-slate-900">Quelle offre voulez-vous envoyer ?</h2>
              <p className="text-slate-500 text-sm mt-1">
                Segment sélectionné :{" "}
                <strong className="text-slate-700">{selectedSegment.label}</strong> — {selectedSegment.count} clients
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="p-5 rounded-xl border-2 border-slate-200 bg-white text-left hover:border-slate-400 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                    {tpl.icon}
                  </div>
                  <p className="font-bold text-slate-900">{tpl.name}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{tpl.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
            >
              Changer de segment
            </button>
          </div>
        )}

        {/* ── Étape 3 : Personnaliser + Générer ── */}
        {step === 3 && selectedSegment && selectedTemplate && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">
                Étape 3 / 5
              </span>
              <h2 className="text-xl font-bold text-slate-900">Personnalisez votre message</h2>
              <p className="text-slate-500 text-sm mt-1">
                Offre : <strong className="text-slate-700">{selectedTemplate.name}</strong>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              {/* Avantage */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Avantage proposé
                </label>
                <textarea
                  value={avantage}
                  onChange={(e) => { setAvantage(e.target.value); setGeneratedMessage(null); }}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Bouton IA */}
              <button
                onClick={handleGenerateAI}
                disabled={generating || !avantage.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-primary/40 bg-primary/5 text-primary font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    L&apos;IA rédige votre message...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Générer avec l&apos;IA
                  </>
                )}
              </button>

              {/* Aperçu message */}
              {displayMessage && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {generatedMessage ? "Message généré par l'IA" : "Aperçu du message"}
                  </label>
                  {/* Mockup WhatsApp mini */}
                  <div className="rounded-xl bg-[#ECE5DD] p-3">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-lg rounded-tr-none bg-white shadow-sm px-3 py-2.5">
                        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{displayMessage}</p>
                        <p className="text-slate-400 text-[10px] text-right mt-1">22:22 ✓✓</p>
                      </div>
                    </div>
                  </div>
                  {generatedMessage && (
                    <p className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Message optimisé par l&apos;IA pour le segment {selectedSegment.label}
                    </p>
                  )}
                </div>
              )}

              {/* Bouton envoyer */}
              <button
                onClick={handleEnvoyer}
                disabled={!avantage.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Envoyer via WhatsApp
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
            >
              Changer de template
            </button>
          </div>
        )}

        {/* ── Étape 4 : Envoi en cours ── */}
        {step === 4 && selectedSegment && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              Étape 4 / 5
            </span>
            <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Envoi en cours via WhatsApp...</h2>
              <p className="text-slate-500 text-sm mt-2">
                Baobab Loyalty envoie votre message à{" "}
                <strong className="text-slate-700">{selectedSegment.count} clients</strong> en temps réel.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span>Progression</span>
                <span>{Math.round(sendProgress)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                {sendProgress < 40 ? "Connexion à l'API WhatsApp Business..." : sendProgress < 80 ? "Personnalisation des messages..." : "Finalisation de l'envoi..."}
              </p>
            </div>
          </div>
        )}

        {/* ── Étape 5 : Réservation reçue ── */}
        {step === 5 && selectedSegment && selectedTemplate && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Campagne envoyée
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedSegment.count} messages envoyés !
              </h2>
              <p className="text-slate-500 text-sm mt-1">Et maintenant, regardez ce qui se passe...</p>
            </div>

            {/* Notification de réservation */}
            <div
              className={`transition-all duration-700 ease-out ${
                notifVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Notif style WhatsApp */}
              <div className="bg-white rounded-2xl border-2 border-green-200 shadow-lg overflow-hidden">
                <div className="bg-green-600 px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">WhatsApp Business</p>
                    <p className="text-white/80 text-xs">Hôtel Le Baobab — À l&apos;instant</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-xl font-bold text-green-700">
                      M
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">Moussa Diop a réservé !</p>
                      <p className="text-slate-600 text-sm mt-0.5">
                        Suite Junior — 3 nuits — Check-in le 15 avril
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Réservation confirmée
                        </span>
                        <span className="text-slate-400 text-xs">via lien WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques résultat */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">1</p>
                  <p className="text-slate-500 text-xs mt-1">Réservation</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">95 000</p>
                  <p className="text-slate-500 text-xs mt-1">FCFA générés</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">2 min</p>
                  <p className="text-slate-500 text-xs mt-1">Pour lancer</p>
                </div>
              </div>

              {/* Dashboard clients */}
              <div className="bg-white rounded-2xl border border-slate-200 mt-4 overflow-hidden">
                {/* Header dashboard */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-800">Dashboard campagne en direct</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedSegment?.count} messages · il y a 2 min
                  </span>
                </div>

                {/* Funnel */}
                <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                  {[
                    { label: "Envoyés", value: selectedSegment?.count ?? 0, color: "text-slate-900", pct: null },
                    { label: "Ouverts", value: Math.round((selectedSegment?.count ?? 0) * 0.78), color: "text-blue-600", pct: "78%" },
                    { label: "Clics", value: Math.round((selectedSegment?.count ?? 0) * 0.34), color: "text-amber-600", pct: "34%" },
                    { label: "Réservations", value: 1, color: "text-green-600", pct: null },
                  ].map((item) => (
                    <div key={item.label} className="p-3 text-center">
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">{item.label}</p>
                      {item.pct && (
                        <span className="text-[10px] font-semibold text-slate-400">{item.pct}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Liste clients */}
                <div className="divide-y divide-slate-50">
                  {[
                    { initials: "MD", name: "Moussa Diop", info: "Suite Junior · 3 nuits", status: "Réservé", statusColor: "bg-green-100 text-green-700", dot: "bg-green-500" },
                    { initials: "FS", name: "Fatou Sow", info: "Lien ouvert · il y a 4 min", status: "Lien cliqué", statusColor: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
                    { initials: "IN", name: "Ibrahima Ndiaye", info: "Message lu · il y a 6 min", status: "Lu", statusColor: "bg-slate-100 text-slate-600", dot: "bg-slate-300" },
                    { initials: "MB", name: "Mariama Baldé", info: "Message lu · il y a 8 min", status: "Lu", statusColor: "bg-slate-100 text-slate-600", dot: "bg-slate-300" },
                    { initials: "KA", name: "Kofi Asante", info: "Envoyé · il y a 2 min", status: "En attente", statusColor: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
                  ].map((client) => (
                    <div key={client.name} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-600">{client.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{client.name}</p>
                        <p className="text-xs text-slate-400 truncate">{client.info}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${client.statusColor}`}>
                        {client.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-600">{Math.round((selectedSegment?.count ?? 0) - 5)} autres clients</span> — statut en cours de mise à jour
                  </p>
                </div>
              </div>

              {/* Message final */}
              <div className="bg-slate-900 rounded-2xl p-6 text-center mt-4">
                <p className="text-white font-bold text-lg mb-1">
                  C&apos;est exactement ce que Baobab Loyalty fait pour vous, chaque semaine.
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  Créez votre compte gratuitement et lancez votre première vraie campagne en moins de 5 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/#tarifs"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                  >
                    Je veux m&apos;abonner
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                  >
                    Rejouer la démo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
