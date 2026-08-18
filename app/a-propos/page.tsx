import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import { getSEOTags, renderBreadcrumbSchema, renderOrganizationSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "À propos — Baobab Loyalty",
  description: "Baobab Loyalty est une solution SaaS de fidélisation et de réactivation client destinée aux hôtels d'Afrique francophone, basée sur l'IA, la segmentation et WhatsApp.",
  canonicalUrlRelative: "/a-propos",
});

const markets = [
  { name: "Côte d'Ivoire", href: "/cote-divoire" },
  { name: "Sénégal", href: "/senegal" },
  { name: "Cameroun", href: "/cameroun" },
  { name: "Ghana", href: "/ghana" },
];

const facts = [
  { label: "Statut", value: "Baobab Loyalty SAS" },
  { label: "Siège social", value: "Plateau, Abidjan, Côte d'Ivoire" },
  { label: "Secteur", value: "SaaS / Hôtellerie / Technologie pour l'Afrique" },
  { label: "Canal principal", value: "WhatsApp Business API" },
  { label: "Devise", value: "FCFA (XOF) — GHS pour le Ghana" },
];

export default function AProposPage() {
  return (
    <>
      {renderOrganizationSchema()}
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "À propos", urlRelative: "/a-propos" },
      ])}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        {/* Hero */}
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              À propos
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-6">
              Une solution pensée pour l&apos;hôtellerie{" "}
              <span className="text-[#1a2f2a]">en Afrique francophone</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              Baobab Loyalty est une solution SaaS de fidélisation et de réactivation client
              destinée aux hôtels. Elle utilise l&apos;intelligence artificielle, la
              segmentation des données clients et WhatsApp pour aider les hôtels à réactiver
              leurs anciens clients, promouvoir leurs offres et générer davantage de
              réservations directes.
            </p>
          </div>
        </section>

        {/* Le problème */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  Le problème que nous adressons
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Dans l&apos;hôtellerie en Afrique de l&apos;Ouest et centrale, la majorité
                  des clients ayant déjà séjourné dans un établissement n&apos;y reviennent pas
                  faute de relance. Les hôtels dépendent alors fortement des plateformes de
                  réservation en ligne (OTAs), qui prélèvent une commission sur chaque réservation.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Les logiciels de fidélisation existants sont, pour la plupart, conçus pour le
                  marché européen ou nord-américain : ils ne gèrent ni WhatsApp comme canal
                  principal, ni le FCFA, ni les usages propres à la clientèle d&apos;affaires
                  locale.
                </p>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  Notre approche
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Baobab Loyalty permet à un hôtel d&apos;importer sa base clients, de
                  segmenter automatiquement les clients inactifs (3, 6 ou 9 mois) et de leur
                  envoyer des offres personnalisées directement sur WhatsApp, avec l&apos;aide
                  de l&apos;intelligence artificielle pour la rédaction des messages.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Chaque réservation obtenue directement via la plateforme se fait sans
                  commission — contrairement à une réservation passant par un OTA.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Marchés */}
        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Où sommes-nous disponibles ?
            </h2>
            <p className="text-[#a3c4b5] text-sm sm:text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Baobab Loyalty est opérationnel dans quatre marchés d&apos;Afrique francophone
              et anglophone.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {markets.map((market) => (
                <Link
                  key={market.href}
                  href={market.href}
                  className="px-5 py-2.5 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  {market.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Informations clés */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-6 text-center">
              Informations légales
            </h2>
            <div className="bg-[#FDFDF9] rounded-2xl p-6 border border-slate-100">
              <dl className="space-y-3">
                {facts.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <dt className="text-xs font-semibold text-slate-400 w-32 shrink-0 pt-0.5">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-slate-600 leading-snug">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-slate-400 mt-5 leading-relaxed">
                Détails complets dans nos{" "}
                <Link href="/legal/mentions-legales" className="text-[#1a2f2a] underline underline-offset-2">
                  mentions légales
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#F8F8F6] border-t border-slate-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              Une question ?
            </h2>
            <p className="text-slate-500 text-base mb-8 leading-relaxed">
              Notre équipe vous répond par email sous 24 à 48 heures ouvrées.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
