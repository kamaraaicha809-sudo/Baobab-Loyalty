import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Logiciel de fidélisation hôtel — Baobab Loyalty",
  description: "Baobab Loyalty est un logiciel de fidélisation et de réactivation client pour hôtels, basé sur l'IA, la segmentation et WhatsApp. Pensé pour l'Afrique francophone.",
  canonicalUrlRelative: "/logiciel-fidelisation-hotel",
});

const faqItems = [
  {
    question: "Qu'est-ce qu'un logiciel de fidélisation hôtel ?",
    answer: "Un logiciel de fidélisation hôtel automatise la relance de vos anciens clients. Il identifie les clients inactifs depuis un certain temps, génère des messages personnalisés et vous permet de lancer une campagne ciblée en quelques minutes, sans compétence technique.",
  },
  {
    question: "En quoi Baobab Loyalty diffère-t-il d'un logiciel marketing classique ?",
    answer: "Baobab Loyalty est spécifiquement conçu pour l'hôtellerie en Afrique francophone : segmentation par ancienneté de séjour, canal WhatsApp natif, facturation en FCFA, interface en français. Un logiciel marketing généraliste ne couvre généralement aucun de ces points nativement.",
  },
  {
    question: "Un logiciel de fidélisation remplace-t-il mon PMS ?",
    answer: "Non. Le PMS (Property Management System) gère vos opérations quotidiennes — check-in, facturation, disponibilités. Un logiciel de fidélisation comme Baobab Loyalty se concentre sur la relation client avant, pendant et après le séjour. Les deux outils sont complémentaires.",
  },
  {
    question: "Combien coûte un logiciel de fidélisation hôtel ?",
    answer: "Baobab Loyalty propose trois formules en FCFA : Starter à 39 000 FCFA/mois (jusqu'à 30 chambres), Pro à 69 000 FCFA/mois (jusqu'à 60 chambres) et Premium à 189 000 FCFA/mois (illimité). Sans engagement.",
  },
  {
    question: "Dans quels pays Baobab Loyalty est-il disponible ?",
    answer: "Baobab Loyalty est disponible en Côte d'Ivoire, au Sénégal, au Cameroun et au Ghana.",
  },
];

const pillars = [
  { title: "Segmentation automatique", desc: "Vos clients sont classés selon leur dernière visite : 3, 6, 9 mois ou plus.", href: "/reactivation-clients-hotel" },
  { title: "Campagnes WhatsApp", desc: "Le canal de communication prioritaire de vos clients, avec messages générés par l'IA.", href: "/whatsapp-marketing-hotel" },
  { title: "Réservations sans commission", desc: "Chaque réservation directe obtenue via la plateforme ne vous coûte aucune commission.", href: "/reservations-directes-hotel" },
  { title: "Alternative aux CRM internationaux", desc: "Pensé pour le FCFA, le français et WhatsApp — pas adapté après coup.", href: "/crm-hotelier" },
];

export default function LogicielFidelisationHotelPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "Logiciel de fidélisation hôtel", urlRelative: "/logiciel-fidelisation-hotel" },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Logiciel de fidélisation hôtel
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Le logiciel de fidélisation pensé{" "}
              <span className="text-[#1a2f2a]">pour l&apos;hôtellerie africaine</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Baobab Loyalty est une solution SaaS de fidélisation et de réactivation client
              destinée aux hôtels. Elle utilise l&apos;intelligence artificielle, la
              segmentation des données clients et WhatsApp pour aider les hôtels à réactiver
              leurs anciens clients et générer davantage de réservations directes.
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-8 text-center">
              Ce que couvre le logiciel
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map((pillar) => (
                <Link
                  key={pillar.href}
                  href={pillar.href}
                  className="p-6 rounded-2xl bg-[#FDFDF9] border border-slate-100 hover:border-[#1a2f2a]/30 transition-colors group"
                >
                  <h3 className="font-bold text-[#2C2C2C] mb-2 text-base group-hover:text-[#1a2f2a]">
                    {pillar.title} →
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{pillar.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Disponible dans 4 marchés
            </h2>
            <p className="text-[#a3c4b5] text-sm sm:text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Baobab Loyalty s&apos;adapte à chaque marché : langue, devise, spécificités locales.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "Côte d'Ivoire", href: "/cote-divoire" },
                { name: "Sénégal", href: "/senegal" },
                { name: "Cameroun", href: "/cameroun" },
                { name: "Ghana", href: "/ghana" },
              ].map((market) => (
                <Link key={market.href} href={market.href} className="px-5 py-2.5 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                  {market.name}
                </Link>
              ))}
            </div>
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

        <section className="py-16 sm:py-20 bg-[#F8F8F6] border-t border-slate-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              Prêt à tester Baobab Loyalty ?
            </h2>
            <p className="text-slate-500 text-base mb-8 leading-relaxed">
              Sans carte bancaire. Opérationnel en 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/demo" className="inline-block px-8 py-4 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors">
                Essayer gratuitement
              </Link>
              <Link href="/tarifs" className="inline-block px-8 py-4 rounded-xl border border-slate-200 text-[#2C2C2C] text-sm font-medium hover:bg-slate-50 transition-colors">
                Voir les tarifs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
