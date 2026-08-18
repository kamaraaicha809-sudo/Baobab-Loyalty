import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "CRM hôtelier pour l'Afrique francophone — Baobab Loyalty",
  description: "Les CRM internationaux (Salesforce, HubSpot) ne gèrent ni WhatsApp, ni le FCFA, ni le contexte hôtelier africain. Découvrez une alternative pensée pour les hôtels d'Afrique.",
  canonicalUrlRelative: "/crm-hotelier",
});

const faqItems = [
  {
    question: "Qu'est-ce qu'un CRM hôtelier ?",
    answer: "Un CRM hôtelier (Customer Relationship Management) est un outil qui centralise les données de vos clients, les segmente selon des critères pertinents (fréquence de visite, ancienneté), et vous permet de communiquer avec eux de façon ciblée. Il est différent d'un PMS (Property Management System), qui gère les opérations quotidiennes comme le check-in et la facturation.",
  },
  {
    question: "Pourquoi les CRM classiques (Salesforce, HubSpot) ne fonctionnent-ils pas pour les hôtels africains ?",
    answer: "Ces outils sont conçus pour des équipes marketing internationales, avec des tarifs en dollars, un support en anglais, et des canaux de communication centrés sur l'email — alors qu'en Afrique de l'Ouest et centrale, WhatsApp est le canal prioritaire. Résultat : complexité inutile, coûts élevés, et absence de logique FCFA ou de contexte local.",
  },
  {
    question: "Baobab Loyalty est-il un CRM hôtelier ?",
    answer: "Oui, dans sa fonction : centraliser vos clients, les segmenter automatiquement (3, 6, 9 mois d'inactivité) et communiquer avec eux via WhatsApp. Ce n'est pas un PMS — Baobab Loyalty ne gère pas vos réservations ou votre facturation, il se concentre sur la relation client et la réactivation.",
  },
  {
    question: "Combien coûte un CRM hôtelier adapté à l'Afrique ?",
    answer: "Baobab Loyalty démarre à 39 000 FCFA par mois pour les hôtels jusqu'à 30 chambres, contre 25 à 300 USD par utilisateur et par mois pour les CRM internationaux. Sans engagement, résiliable à tout moment.",
  },
];

export default function CrmHotelierPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "CRM hôtelier", urlRelative: "/crm-hotelier" },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              CRM hôtelier
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Un CRM hôtelier pensé pour{" "}
              <span className="text-[#1a2f2a]">l&apos;Afrique francophone</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Salesforce, HubSpot, Zoho : la plupart des hôteliers africains les ont essayés
              et abandonnés. Voici pourquoi — et ce qu&apos;un CRM adapté au marché local
              devrait faire à la place.
            </p>
            <Link
              href="/demo"
              className="inline-block px-7 py-3.5 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              Essayer gratuitement
            </Link>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6">
              Pourquoi les CRM internationaux échouent dans l&apos;hôtellerie africaine
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "La complexité", desc: "Conçus pour des équipes marketing dédiées, ils demandent des semaines de configuration avant le moindre résultat — un luxe qu'un hôtelier qui gère aussi la réception et la comptabilité n'a pas." },
                { title: "Les canaux inadaptés", desc: "Construits autour de l'email et du téléphone, alors qu'en Afrique de l'Ouest et centrale, WhatsApp est le canal de communication prioritaire des clients d'hôtel." },
                { title: "Les prix en dollars", desc: "Entre 25 et 300 USD par utilisateur et par mois — souvent inabordable pour un hôtel de taille moyenne au budget marketing limité." },
                { title: "L'absence de contexte local", desc: "Aucune logique FCFA, aucun repère sur les segments ou usages locaux : tout doit être configuré manuellement, avec un support en anglais basé à des milliers de kilomètres." },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl bg-[#FDFDF9] border border-slate-100">
                  <h3 className="font-bold text-[#2C2C2C] mb-2 text-base">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6 text-center">
              Ce que fait Baobab Loyalty, concrètement
            </h2>
            <ul className="space-y-4">
              {[
                "Import de votre base clients existante (Excel ou CSV) en quelques minutes",
                "Segmentation automatique selon la dernière visite (3, 6, 9 mois, tous)",
                "Envoi de campagnes WhatsApp ciblées, avec messages rédigés par l'IA",
                "Tableau de bord en temps réel : réservations générées, revenus en FCFA",
                "Interface en français, facturation en FCFA, support francophone",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-[#1a2f2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-6 text-center">
              Pour aller plus loin :{" "}
              <Link href="/blog/crm-hotelier-afrique-solutions" className="underline hover:text-slate-600">
                pourquoi les CRM classiques ne marchent pas
              </Link>{" "}
              ·{" "}
              <Link href="/blog/crm-hotel-guide-directeur" className="underline hover:text-slate-600">
                guide CRM hôtel pour directeurs
              </Link>
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-white border-t border-slate-100" id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-10 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              {faqItems.map((item) => (
                <div key={item.question} className="border-b border-slate-100 pb-6 last:border-0">
                  <h3 className="font-bold text-[#2C2C2C] mb-2 text-base">{item.question}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Essayez un CRM pensé pour votre marché
            </h2>
            <p className="text-[#a3c4b5] text-base mb-8 leading-relaxed">
              Sans carte bancaire. Opérationnel en 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/demo" className="inline-block px-8 py-4 rounded-xl bg-[#EBC161] text-[#1a2f2a] text-sm font-bold hover:bg-[#d4a94d] transition-colors">
                Essayer gratuitement
              </Link>
              <Link href="/fonctionnalites" className="inline-block px-8 py-4 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                Voir les fonctionnalités
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
