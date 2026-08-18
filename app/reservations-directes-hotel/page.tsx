import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Réservations directes hôtel — Réduire la dépendance aux OTA | Baobab Loyalty",
  description: "Booking.com et les OTAs prélèvent 15 à 20% de commission sur chaque réservation. Découvrez comment récupérer des réservations directes via WhatsApp, sans commission.",
  canonicalUrlRelative: "/reservations-directes-hotel",
});

const faqItems = [
  {
    question: "Pourquoi les réservations directes sont-elles plus rentables que via un OTA ?",
    answer: "Les OTAs comme Booking.com ou Expedia prélèvent généralement entre 15% et 20% de commission sur chaque réservation. Une réservation obtenue directement, sans passer par une plateforme tierce, ne vous coûte aucune commission.",
  },
  {
    question: "Pourquoi mes clients repassent-ils toujours par Booking.com pour revenir ?",
    answer: "Parce qu'un OTA ne vous transmet pas les vraies coordonnées de contact du client. Sans son numéro WhatsApp ou son email, vous ne pouvez pas le recontacter directement — et quand il veut revenir, il retourne naturellement sur la plateforme où il vous a trouvé la première fois.",
  },
  {
    question: "Comment récupérer les coordonnées de mes clients qui réservent via un OTA ?",
    answer: "La première étape est de collecter systématiquement le numéro WhatsApp de chaque client à son arrivée, quel que soit son canal de réservation initial. C'est cette base de contacts qui permet ensuite de le recontacter directement pour son prochain séjour.",
  },
  {
    question: "Baobab Loyalty facture-t-il une commission sur les réservations générées ?",
    answer: "Non. Chaque réservation obtenue via une campagne Baobab Loyalty se fait sans commission — vous payez uniquement votre abonnement mensuel, à partir de 39 000 FCFA.",
  },
];

export default function ReservationsDirectesHotelPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "Réservations directes hôtel", urlRelative: "/reservations-directes-hotel" },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Réservations directes
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Récupérez vos réservations directes,{" "}
              <span className="text-[#1a2f2a]">sans commission</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Booking.com vous coûte probablement plus cher que vous ne le pensez. La
              dépendance aux OTA n&apos;est pas une fatalité — voici comment la réduire
              progressivement.
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
              Le vrai coût de la dépendance aux OTA
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#FDFDF9] border border-slate-100">
                <h3 className="font-bold text-[#2C2C2C] mb-2 text-base">La commission visible</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Les OTAs prélèvent généralement entre 15% et 20% sur chaque réservation.
                  Sur un hôtel avec un volume significatif de réservations OTA, cela
                  représente des millions de FCFA de commissions chaque année.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#FDFDF9] border border-slate-100">
                <h3 className="font-bold text-[#2C2C2C] mb-2 text-base">La commission invisible</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Vous ne recevez pas les vraies coordonnées du client. Vous ne pouvez pas le
                  recontacter. Quand il veut revenir, il repasse par l&apos;OTA — et vous
                  payez à nouveau la commission. Un cercle vicieux.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6 text-center">
              Stratégie en 3 étapes
            </h2>
            <ol className="space-y-4">
              {[
                {
                  title: "Capturer les données clients à l'arrivée",
                  desc: "Ajoutez une colonne WhatsApp à votre fiche d'enregistrement. Chaque client qui franchit la porte de votre hôtel doit ressortir avec un lien vers votre WhatsApp Business.",
                },
                {
                  title: "Segmenter et identifier les clients inactifs",
                  desc: "Une fois la base importée dans Baobab Loyalty, les clients sont automatiquement classés par ancienneté de dernière visite (3, 6, 9 mois).",
                },
                {
                  title: "Relancer avec une offre personnalisée",
                  desc: "Une campagne WhatsApp ciblée, au bon moment, suffit souvent à déclencher une réservation directe — sans commission à reverser à un tiers.",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-slate-100">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#1a2f2a] text-[#EBC161] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#2C2C2C] text-sm mb-1">{step.title}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-slate-400 mt-6 text-center">
              Pour aller plus loin :{" "}
              <Link href="/blog/reduire-dependance-booking-reservations-directes" className="underline hover:text-slate-600">
                comment réduire votre dépendance à Booking.com
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
              Reprenez le contrôle de vos réservations
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
