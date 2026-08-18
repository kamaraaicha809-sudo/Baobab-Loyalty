import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "WhatsApp Marketing pour hôtels — Baobab Loyalty",
  description: "WhatsApp est le canal de communication prioritaire des clients d'hôtel en Afrique. Découvrez comment lancer des campagnes WhatsApp ciblées, avec l'IA, en 2 minutes.",
  canonicalUrlRelative: "/whatsapp-marketing-hotel",
});

const faqItems = [
  {
    question: "Pourquoi utiliser WhatsApp plutôt que l'email pour un hôtel en Afrique ?",
    answer: "En Afrique de l'Ouest et centrale, le smartphone est l'outil de communication principal et WhatsApp en est l'application reine. Les clients le consultent plusieurs fois par jour, contrairement à l'email, largement délaissé sur ce marché. WhatsApp affiche un taux d'ouverture moyen de 98% pour les messages professionnels (donnée Meta).",
  },
  {
    question: "Faut-il un compte WhatsApp Business pour faire du marketing hôtelier ?",
    answer: "Oui. Baobab Loyalty utilise l'API WhatsApp Business (Meta Cloud API). Chaque hôtelier connecte son propre compte, ce qui garantit la personnalisation des messages et la conformité avec les règles de Meta.",
  },
  {
    question: "Comment personnaliser mes messages WhatsApp sans y passer des heures ?",
    answer: "L'IA intégrée à Baobab Loyalty génère un message adapté au segment ciblé (client inactif depuis 3, 6 ou 9 mois) et à l'offre choisie. Vous relisez, ajustez si besoin, et envoyez.",
  },
  {
    question: "Est-ce que l'envoi de campagnes WhatsApp est légal et respecte la vie privée des clients ?",
    answer: "Oui. Chaque campagne passe par l'API officielle WhatsApp Business de Meta, et chaque message inclut une option de désinscription. Les données clients restent la propriété de l'hôtel.",
  },
];

export default function WhatsappMarketingHotelPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "WhatsApp Marketing hôtel", urlRelative: "/whatsapp-marketing-hotel" },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              WhatsApp Marketing
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Le marketing hôtelier passe{" "}
              <span className="text-[#1a2f2a]">par WhatsApp</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              En Afrique de l&apos;Ouest et centrale, vos clients consultent WhatsApp des
              dizaines de fois par jour — et rarement leur boîte email. Voici comment en
              faire un vrai canal de fidélisation.
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
            <div className="grid sm:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  Pourquoi l&apos;email sous-performe sur ce marché
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  L&apos;email marketing reste construit pour des marchés où la boîte de
                  réception est un réflexe quotidien. Ce n&apos;est pas le cas ici : les
                  offres envoyées par email restent souvent non lues, arrivent trop tard, ou
                  finissent en spam.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  WhatsApp, lui, s&apos;est imposé comme le canal de communication de
                  référence — aussi bien pour la clientèle d&apos;affaires que pour les
                  voyageurs loisirs.
                </p>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  Ce que permet une campagne WhatsApp bien ciblée
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Une offre personnalisée, envoyée au bon segment de clients inactifs, au bon
                  moment. Vos anciens clients vous connaissent déjà et vous font confiance —
                  il suffit souvent d&apos;un rappel pertinent pour déclencher une réservation.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Contrairement à l&apos;email, une réponse WhatsApp engage une vraie
                  conversation, directement avec votre équipe.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6 text-center">
              Comment ça marche avec Baobab Loyalty
            </h2>
            <ol className="space-y-4">
              {[
                "Connectez votre compte WhatsApp Business (API officielle Meta)",
                "Choisissez un segment de clients inactifs (3, 6 ou 9 mois)",
                "Laissez l'IA rédiger un message adapté, ou écrivez le vôtre",
                "Envoyez la campagne et suivez les résultats en temps réel",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-4 bg-white rounded-xl p-4 border border-slate-100">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#1a2f2a] text-[#EBC161] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-slate-600 text-sm leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-slate-400 mt-6 text-center">
              Pour aller plus loin :{" "}
              <Link href="/blog/whatsapp-marketing-hotel-vs-email" className="underline hover:text-slate-600">
                WhatsApp vs email marketing pour hôtels
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
              Lancez votre première campagne WhatsApp
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
