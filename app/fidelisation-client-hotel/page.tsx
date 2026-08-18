import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Fidélisation client hôtel — Baobab Loyalty",
  description: "Construisez une vraie relation durable avec vos clients d'hôtel : segmentation, offres personnalisées et suivi continu via WhatsApp, en FCFA.",
  canonicalUrlRelative: "/fidelisation-client-hotel",
});

const faqItems = [
  {
    question: "Quelle différence entre fidélisation et réactivation client ?",
    answer: "La réactivation cible un client précis, inactif depuis un moment, pour déclencher un retour ponctuel. La fidélisation est une démarche continue : maintenir le lien avec l'ensemble de votre base clients dans la durée, à chaque étape (avant, pendant, après le séjour).",
  },
  {
    question: "Comment fidéliser des clients d'hôtel sans programme de points complexe ?",
    answer: "Un programme de fidélité n'a pas besoin d'être un système de points. Une segmentation claire de votre base, des offres pertinentes envoyées au bon moment sur WhatsApp, et un suivi des résultats suffisent pour construire une relation durable.",
  },
  {
    question: "Quelle différence entre Baobab Loyalty et une agence marketing ?",
    answer: "Une agence marketing facture un forfait mensuel pour gérer vos campagnes à votre place, souvent sans connaître les spécificités de l'hôtellerie africaine. Baobab Loyalty est un outil que vous utilisez vous-même, conçu spécifiquement pour ce secteur et ce marché, à partir de 39 000 FCFA/mois.",
  },
  {
    question: "Qui reste propriétaire des données clients ?",
    answer: "Vous. Baobab Loyalty ne partage jamais votre base clients avec des tiers, et vous pouvez l'exporter ou la supprimer à tout moment.",
  },
];

export default function FidelisationClientHotelPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "Fidélisation client hôtel", urlRelative: "/fidelisation-client-hotel" },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Fidélisation client
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Construisez une relation durable{" "}
              <span className="text-[#1a2f2a]">avec vos clients d&apos;hôtel</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Fidéliser ne veut pas dire empiler des points de récompense. Ça veut dire rester
              présent dans l&apos;esprit de vos clients — au bon moment, sur le bon canal.
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
                  Fidélisation vs réactivation
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  La <Link href="/reactivation-clients-hotel" className="text-[#1a2f2a] underline underline-offset-2">réactivation</Link> répond à un moment précis : un client inactif depuis 3, 6 ou 9 mois que l&apos;on recontacte. La fidélisation, elle, est une démarche continue — elle s&apos;applique à toute votre base, pas seulement aux clients dormants.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Les deux s&apos;appuient sur la même base : une segmentation claire et un
                  canal de communication que vos clients utilisent vraiment.
                </p>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  Une différence avec une agence marketing
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Une agence gère vos campagnes à votre place, contre un forfait mensuel
                  récurrent, sans que vous gardiez la main sur l&apos;outil.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Baobab Loyalty est un outil que vous pilotez vous-même, conçu pour
                  l&apos;hôtellerie d&apos;Afrique francophone, à partir de 39 000 FCFA/mois.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6 text-center">
              Les piliers d&apos;une fidélisation efficace
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { title: "Segmenter", desc: "Connaître qui sont vos clients récents, vos clients dormants, vos clients réguliers." },
                { title: "Personnaliser", desc: "Adapter chaque offre au segment concerné plutôt qu'un message unique pour tous." },
                { title: "Rester présent", desc: "Utiliser un canal que vos clients consultent vraiment — WhatsApp, pas l'email." },
              ].map((p) => (
                <div key={p.title} className="p-6 rounded-2xl bg-white border border-slate-100 text-center">
                  <p className="font-bold text-[#2C2C2C] mb-2 text-base">{p.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
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

        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Commencez à fidéliser dès aujourd&apos;hui
            </h2>
            <p className="text-[#a3c4b5] text-base mb-8 leading-relaxed">
              Sans carte bancaire. Opérationnel en 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/demo" className="inline-block px-8 py-4 rounded-xl bg-[#EBC161] text-[#1a2f2a] text-sm font-bold hover:bg-[#d4a94d] transition-colors">
                Essayer gratuitement
              </Link>
              <Link href="/tarifs" className="inline-block px-8 py-4 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
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
