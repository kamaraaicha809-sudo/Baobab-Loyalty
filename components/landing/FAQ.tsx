"use client";

import { useState, ReactNode } from "react";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

const faqList: FAQItem[] = [
  {
    question: "Est-ce que ça vaut vraiment le coût ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Le plan Starter coûte 39 000 FCFA par mois. Si une seule campagne te génère 3 nuits supplémentaires à 30 000 FCFA la nuit, tu as déjà rentabilisé 2,3x ton investissement — ce mois-là. Nos hôteliers récupèrent en moyenne 120 000 à 600 000 FCFA supplémentaires par mois. Et si ça ne marche pas, nous t&apos;offrons le mois suivant.
      </div>
    ),
  },
  {
    question: "Est-ce que mes clients vont vraiment répondre et réserver ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        WhatsApp affiche un taux d&apos;ouverture de 98%. Tes anciens clients ont déjà séjourné chez toi — ils te connaissent et te font confiance. Une offre personnalisée au bon moment suffit à déclencher la réservation. Nos beta testeurs voient en moyenne 2 à 5 nuits supplémentaires dès la première campagne.
      </div>
    ),
  },
  {
    question: "Mes données clients sont-elles en sécurité ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Oui. Tes données sont hébergées sur des serveurs sécurisés (chiffrement SSL, accès protégé). Tu restes propriétaire de ta base clients — nous n&apos;y accédons pas et ne la partageons jamais avec des tiers. Tu peux exporter ou supprimer tes données à tout moment.
      </div>
    ),
  },
  {
    question: "Est-ce facile à utiliser ? Je ne suis pas technique.",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Très facile. En 15 minutes, tu importes ta base clients, tu choisis un segment, l&apos;IA rédige le message, et tu envoies. Pas de formation nécessaire. Et si tu bloques quelque part, notre équipe t&apos;accompagne personnellement les 30 premiers jours.
      </div>
    ),
  },
  {
    question: "Est-ce que je m'engage sur la durée ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Non, aucun engagement. Tu peux résilier à tout moment depuis ton dashboard, sans frais ni justification. Et pour être honnêtes : si tu ne récupères pas au moins 2 nuits le premier mois, on t&apos;offre le mois suivant. On préfère te prouver que ça marche plutôt que de te retenir par contrat.
      </div>
    ),
  },
];

interface ItemProps {
  item: FAQItem;
}

const Item = ({ item }: ItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`group rounded-xl sm:rounded-2xl border bg-white overflow-hidden transition-all duration-200 ${
        isOpen ? "border-primary/30 shadow-lg shadow-primary/5" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <button
        className="relative flex items-center w-full p-4 sm:p-5 md:p-6 text-left"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-sm sm:text-base font-semibold transition-colors pr-2 ${
            isOpen ? "text-primary" : "text-slate-900"
          }`}
        >
          {item.question}
        </span>
        <span
          className={`ml-2 sm:ml-4 flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isOpen
              ? "bg-primary text-white rotate-180"
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          }`}
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-4 sm:pb-5 md:pb-6 px-4 sm:px-5 md:px-6 text-slate-600 leading-relaxed text-sm sm:text-base">{item.answer}</div>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section className="bg-slate-50 py-16 sm:py-20 md:py-24" id="faq">
      <div className="px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <p className="font-semibold text-primary mb-3 sm:mb-4 tracking-widest uppercase text-xs sm:text-sm">
            FAQ
          </p>
          <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-slate-900">
            Questions fréquentes
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {faqList.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
