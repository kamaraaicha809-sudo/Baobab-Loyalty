"use client";

import { useState, ReactNode } from "react";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

const faqList: FAQItem[] = [
  {
    question: "Qu'est-ce qui est inclus dans Kodefast ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Kodefast inclut tout ce dont vous avez besoin pour lancer un Micro SaaS : authentification 
        Supabase (email, OAuth), paiements Stripe (checkout, abonnements, webhooks), 
        emails transactionnels via Resend, dashboard admin, Edge Functions prêtes à l&apos;emploi, 
        et une documentation complète.
      </div>
    ),
  },
  {
    question: "Ai-je besoin de configurer Supabase moi-même ?",
    answer: (
      <p>
        Non, tout est préconfiguré ! Il vous suffit de créer un projet Supabase, copier vos clés 
        API dans les variables d&apos;environnement, et appliquer les migrations SQL fournies. 
        Le guide de déploiement vous accompagne étape par étape.
      </p>
    ),
  },
  {
    question: "Le template est-il compatible TypeScript ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Oui ! Le SDK et les Edge Functions sont écrits en TypeScript pour un typage robuste. 
        Les composants React sont également en TypeScript pour une meilleure maintenabilité. 
        Le projet est entièrement configuré pour TypeScript.
      </div>
    ),
  },
  {
    question: "Comment personnaliser le design ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Le design utilise TailwindCSS 4 avec une palette de couleurs centralisée dans 
        <code className="bg-slate-100 px-1 rounded mx-1 text-xs sm:text-sm">config.js</code>. 
        Changez simplement les couleurs dans ce fichier et elles seront automatiquement appliquées 
        dans toute l&apos;application. Tous les composants sont modulaires et faciles à modifier.
      </div>
    ),
  },
  {
    question: "Puis-je utiliser Kodefast pour des projets commerciaux ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Absolument ! La licence vous permet d&apos;utiliser Kodefast pour vos projets personnels 
        et commerciaux. Vous pouvez créer autant de Micro SaaS que vous voulez avec le template.
      </div>
    ),
  },
  {
    question: "Quel est le support disponible ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        La documentation couvre tous les aspects du template. Pour les questions techniques, 
        vous avez accès au support par email. Les mises à jour et corrections de bugs sont 
        incluses avec votre licence.
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
