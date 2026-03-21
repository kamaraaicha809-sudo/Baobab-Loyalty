"use client";

import { useState, ReactNode } from "react";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

const faqList: FAQItem[] = [
  {
    question: "Comment fonctionne Baobab Loyalty ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Baobab Loyalty analyse votre base de données clients grâce à l&apos;IA pour identifier 
        les segments les plus pertinents (clients inactifs depuis 3, 6 ou 9 mois). Vous choisissez 
        un template d&apos;offre, personnalisez le message, et l&apos;envoi se fait automatiquement 
        via WhatsApp en moins de 2 minutes.
      </div>
    ),
  },
  {
    question: "Ai-je besoin de compétences techniques ?",
    answer: (
      <p>
        Non, Baobab Loyalty est conçu pour les hôteliers, pas pour les développeurs. 
        L&apos;interface est simple et intuitive : quelques clics suffisent pour lancer 
        une campagne de relance. Aucune connaissance technique n&apos;est requise.
      </p>
    ),
  },
  {
    question: "Pourquoi WhatsApp plutôt que l'email ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        WhatsApp affiche un taux d&apos;ouverture de 98%, contre 20% pour l&apos;email. 
        Vos clients lisent et répondent beaucoup plus rapidement sur WhatsApp, ce qui 
        augmente considérablement vos chances de convertir une relance en réservation.
      </div>
    ),
  },
  {
    question: "Quels types d'offres puis-je envoyer ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Baobab Loyalty propose 5 templates d&apos;offres prêts à l&apos;emploi : remise 
        exceptionnelle, surclassement offert, cocktail de bienvenue, offre famille, et 
        événements spéciaux (Ramadan, Pâques, Saint-Valentin, etc.). Chaque offre est 
        personnalisable selon vos besoins.
      </div>
    ),
  },
  {
    question: "Comment importer ma base de clients ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Depuis la page Configuration de votre dashboard, vous pouvez importer votre 
        base clients facilement. L&apos;IA se charge ensuite de segmenter automatiquement 
        vos clients pour des campagnes ciblées et efficaces.
      </div>
    ),
  },
  {
    question: "Puis-je essayer avant de m'abonner ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Oui ! Vous pouvez accéder à une démo complète de la plateforme pour découvrir 
        toutes les fonctionnalités avant de vous engager. Cliquez sur &quot;Voir la démo&quot; 
        sur la page d&apos;accueil pour commencer.
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
