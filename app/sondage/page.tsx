"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type QuestionType = "stars" | "yesno" | "yesnoNA" | "nps" | "text";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  optional?: boolean;
}

interface Category {
  title: string;
  questions: Question[];
}

const CATEGORIES: Category[] = [
  {
    title: "Accueil & Check-in",
    questions: [
      { id: "q1", text: "Comment évaluez-vous la qualité de votre accueil à l'arrivée ?", type: "stars" },
      { id: "q2", text: "Le personnel était-il aimable et attentionné ?", type: "stars" },
      { id: "q3", text: "Le temps d'attente au check-in était-il raisonnable ?", type: "yesno" },
    ],
  },
  {
    title: "Chambre & Hébergement",
    questions: [
      { id: "q4", text: "Comment évaluez-vous le confort de votre chambre ?", type: "stars" },
      { id: "q5", text: "La chambre était-elle propre et bien rangée à votre arrivée ?", type: "stars" },
      { id: "q6", text: "La climatisation / chauffage fonctionnait-il correctement ?", type: "yesno" },
    ],
  },
  {
    title: "Salle de bain",
    questions: [
      { id: "q7", text: "Comment évaluez-vous la propreté de la salle de bain ?", type: "stars" },
      { id: "q8", text: "Les équipements de toilette fournis étaient-ils suffisants ?", type: "yesno" },
    ],
  },
  {
    title: "Restauration",
    questions: [
      { id: "q9", text: "Comment évaluez-vous la qualité du petit-déjeuner ?", type: "stars" },
      { id: "q10", text: "La variété des plats proposés était-elle satisfaisante ?", type: "stars" },
      { id: "q11", text: "Le service au restaurant était-il rapide et courtois ?", type: "stars" },
    ],
  },
  {
    title: "Service en chambre",
    questions: [
      { id: "q12", text: "Avez-vous utilisé le service en chambre ?", type: "yesno" },
      { id: "q13", text: "Si oui, comment évaluez-vous la rapidité et la qualité du service ?", type: "stars", optional: true },
    ],
  },
  {
    title: "Espace Bien-être",
    questions: [
      { id: "q14", text: "Avez-vous utilisé la piscine, le spa ou la salle de sport ?", type: "yesno" },
      { id: "q15", text: "Si oui, comment évaluez-vous la qualité de ces installations ?", type: "stars", optional: true },
    ],
  },
  {
    title: "Personnel & Service",
    questions: [
      { id: "q16", text: "Le personnel était-il disponible et réactif à vos demandes ?", type: "stars" },
      { id: "q17", text: "Vos demandes spéciales ont-elles été prises en compte ?", type: "yesnoNA" },
    ],
  },
  {
    title: "Rapport qualité-prix",
    questions: [
      { id: "q18", text: "Comment évaluez-vous le rapport qualité-prix de votre séjour ?", type: "stars" },
    ],
  },
  {
    title: "Recommandation générale",
    questions: [
      { id: "q19", text: "Sur une échelle de 0 à 10, recommanderiez-vous notre hôtel à vos proches ?", type: "nps" },
      { id: "q20", text: "Avez-vous des commentaires ou suggestions pour améliorer nos services ?", type: "text", optional: true },
    ],
  },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "#F59E0B" : "none"}
            stroke={(hovered || value) >= star ? "#F59E0B" : "#CBD5E1"}
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function YesNoButton({ value, onChange, withNA = false }: { value: string; onChange: (v: string) => void; withNA?: boolean }) {
  const options = withNA
    ? [{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }, { id: "na", label: "Sans objet" }]
    : [{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }];

  return (
    <div className="flex gap-3 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            value === opt.id
              ? "bg-[#075E54] text-white border-[#075E54]"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NpsSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
              value === i
                ? "bg-[#075E54] text-white border-[#075E54]"
                : i <= 6
                ? "bg-red-50 text-red-600 border-red-100 hover:border-red-300"
                : i <= 8
                ? "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300"
                : "bg-green-50 text-green-700 border-green-100 hover:border-green-300"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400 px-1">
        <span>Pas du tout</span>
        <span>Absolument</span>
      </div>
    </div>
  );
}

function QuestionBlock({
  question,
  answer,
  onAnswer,
}: {
  question: Question;
  answer: string | number;
  onAnswer: (v: string | number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-slate-800 font-medium leading-snug">
        {question.text}
        {question.optional && (
          <span className="ml-1.5 text-xs text-slate-400 font-normal">(optionnel)</span>
        )}
      </p>
      {question.type === "stars" && (
        <StarRating value={Number(answer)} onChange={(v) => onAnswer(v)} />
      )}
      {question.type === "yesno" && (
        <YesNoButton value={String(answer)} onChange={onAnswer} />
      )}
      {question.type === "yesnoNA" && (
        <YesNoButton value={String(answer)} onChange={onAnswer} withNA />
      )}
      {question.type === "nps" && (
        <NpsSelector value={answer === "" ? -1 : Number(answer)} onChange={(v) => onAnswer(v)} />
      )}
      {question.type === "text" && (
        <textarea
          value={String(answer)}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Votre réponse (optionnel)..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#075E54]/20 focus:border-[#075E54] transition-all resize-none text-sm"
        />
      )}
    </div>
  );
}

function SondageContent() {
  const searchParams = useSearchParams();
  const hotel = searchParams.get("hotel") || "notre hôtel";
  const discount = Number(searchParams.get("discount") || "50");

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const currentCategory = CATEGORIES[step];
  const totalSteps = CATEGORIES.length;
  const progress = ((step) / totalSteps) * 100;

  const setAnswer = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const isCategoryAnswered = () => {
    return currentCategory.questions.every((q) => {
      if (q.optional) return true;
      const a = answers[q.id];
      if (a === undefined || a === "" || a === 0) return false;
      if (q.type === "nps" && Number(a) < 0) return false;
      return true;
    });
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const discountCode = `${hotel.replace(/\s+/g, "").toUpperCase().slice(0, 4)}${discount}`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#ECE5DD] flex flex-col">
        <header className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {hotel.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{hotel}</p>
            <p className="text-white/70 text-xs">Questionnaire de satisfaction</p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Merci pour votre avis !</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Votre satisfaction est notre priorité.
                </p>
              </div>

              <div className="bg-[#075E54]/5 border border-[#075E54]/20 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-600">Votre réduction :</p>
                <p className="text-4xl font-black text-[#075E54]">{discount}%</p>
                <p className="text-xs text-slate-500">sur votre prochain séjour</p>
                <div className="mt-3 px-4 py-2 bg-white rounded-lg border border-[#075E54]/30">
                  <p className="text-xs text-slate-400 mb-0.5">Code promo</p>
                  <p className="font-mono font-bold text-[#075E54] text-lg tracking-widest">{discountCode}</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Présentez ce code à la réception lors de votre prochaine réservation.
                Offre valable 90 jours. Non cumulable avec d&apos;autres promotions.
              </p>

              <button
                onClick={() => { navigator.clipboard?.writeText(discountCode); }}
                className="w-full py-3 rounded-xl bg-[#075E54] text-white font-semibold text-sm hover:bg-[#064A42] transition-colors"
              >
                Copier le code
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE5DD] flex flex-col">
      {/* En-tête WhatsApp */}
      <header className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {hotel.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">{hotel}</p>
          <p className="text-white/70 text-xs">Questionnaire de satisfaction</p>
        </div>
        <div className="text-white/70 text-xs text-right shrink-0">
          {step + 1} / {totalSteps}
        </div>
      </header>

      {/* Barre de progression */}
      <div className="h-1.5 bg-white/30">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Badge récompense */}
        <div className="bg-[#075E54]/10 border border-[#075E54]/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#075E54] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <p className="text-xs text-[#075E54] font-semibold">
            Complétez le questionnaire et obtenez <span className="font-black">{discount}% de réduction</span> sur votre prochain séjour
          </p>
        </div>

        {/* Carte de la catégorie */}
        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-5 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#075E54] uppercase tracking-wider mb-1">
              Catégorie {step + 1} sur {totalSteps}
            </p>
            <h2 className="text-lg font-bold text-slate-900">{currentCategory.title}</h2>
          </div>

          <div className="space-y-7">
            {currentCategory.questions.map((question) => (
              <QuestionBlock
                key={question.id}
                question={question}
                answer={answers[question.id] ?? (question.type === "nps" ? -1 : "")}
                onAnswer={(v) => setAnswer(question.id, v)}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Précédent
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCategoryAnswered()}
            className="flex-1 py-3.5 rounded-xl bg-[#075E54] text-white font-semibold text-sm hover:bg-[#064A42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step === totalSteps - 1 ? "Envoyer mon avis" : "Suivant"}
          </button>
        </div>

        {/* Indicateur de progression */}
        <div className="flex justify-center gap-1.5">
          {CATEGORIES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === step ? "w-4 h-1.5 bg-[#075E54]" : i < step ? "w-1.5 h-1.5 bg-[#075E54]/50" : "w-1.5 h-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SondagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ECE5DD] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#075E54] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SondageContent />
    </Suspense>
  );
}
