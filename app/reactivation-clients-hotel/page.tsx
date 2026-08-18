import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Réactivation clients hôtel — Baobab Loyalty",
  description: "Vos anciens clients ne reviennent pas faute de relance. Découvrez comment identifier vos clients inactifs et les réactiver via des campagnes WhatsApp ciblées.",
  canonicalUrlRelative: "/reactivation-clients-hotel",
});

const faqItems = [
  {
    question: "Qu'est-ce que la réactivation client dans l'hôtellerie ?",
    answer: "La réactivation client consiste à identifier les clients qui ont déjà séjourné dans votre hôtel mais ne sont pas revenus depuis un certain temps, puis à les recontacter avec une offre pertinente pour déclencher une nouvelle réservation.",
  },
  {
    question: "Comment identifier mes clients inactifs ?",
    answer: "Baobab Loyalty segmente automatiquement votre base clients importée selon la date de dernière visite : 3 mois, 6 mois, 9 mois ou plus. Vous voyez immédiatement combien de clients sont concernés par segment.",
  },
  {
    question: "Quel type d'offre fonctionne pour réactiver un client ?",
    answer: "Une remise, un surclassement (upgrade) ou une attention particulière (cocktail de bienvenue) sont les leviers les plus courants. L'IA de Baobab Loyalty aide à rédiger un message adapté au segment et à l'offre choisis.",
  },
  {
    question: "Combien de temps prend une campagne de réactivation ?",
    answer: "Une fois votre base importée, sélectionner un segment, générer le message et envoyer la campagne prend moins de 10 minutes.",
  },
];

export default function ReactivationClientsHotelPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "Réactivation clients hôtel", urlRelative: "/reactivation-clients-hotel" },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Réactivation clients
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Vos anciens clients existent déjà.{" "}
              <span className="text-[#1a2f2a]">Recontactez-les.</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              La majorité des clients d&apos;hôtel ne reviennent pas, faute de relance après
              leur séjour — pas faute d&apos;intérêt. Voici comment identifier et réactiver
              les vôtres.
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
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-8 text-center">
              La segmentation par ancienneté
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: "3 mois", desc: "Clients inactifs depuis 3 mois — la fenêtre idéale pour une première relance légère." },
                { label: "6 mois", desc: "Une offre plus incitative peut être nécessaire pour raviver l'intérêt." },
                { label: "9 mois et +", desc: "Clients plus anciens : une offre de bienvenue renouvelée fonctionne souvent bien." },
              ].map((seg) => (
                <div key={seg.label} className="p-6 rounded-2xl bg-[#FDFDF9] border border-slate-100 text-center">
                  <p className="text-2xl font-bold text-[#1a2f2a] mb-2">{seg.label}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{seg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6 text-center">
              Comment ça marche
            </h2>
            <ul className="space-y-4">
              {[
                "Importez votre base clients (Excel ou CSV) — détection automatique des colonnes",
                "Consultez le nombre de clients par segment d'inactivité",
                "Générez un message personnalisé avec l'IA, ou rédigez le vôtre",
                "Envoyez la campagne WhatsApp et suivez les clics, réservations et revenus",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-[#1a2f2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
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
              Réactivez votre base clients dès aujourd&apos;hui
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
