import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import { getSEOTags, renderBreadcrumbSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Espace Presse — Baobab Loyalty",
  description: "Communiqués de presse, chiffres clés et ressources pour journalistes. Baobab Loyalty, solution de fidélisation hôtelière pour l'Afrique francophone.",
  canonicalUrlRelative: "/presse",
});

const keyFacts = [
  { value: "4", label: "marchés disponibles", detail: "Côte d'Ivoire, Sénégal, Cameroun, Ghana" },
  { value: "10 min", label: "pour lancer une campagne", detail: "De l'import CSV au premier envoi WhatsApp" },
  { value: "0%", label: "commission sur les réservations directes", detail: "Contre 15 à 20% chez les OTAs" },
  { value: "39 000 FCFA", label: "prix d'entrée par mois", detail: "Sans engagement" },
  { value: "FCFA", label: "facturation locale", detail: "Adapté au marché Afrique francophone" },
];

const pressSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Page Presse — Baobab Loyalty",
  description:
    "Communiqués de presse, chiffres clés et contact médias de Baobab Loyalty, solution de fidélisation hôtelière pour l'Afrique francophone.",
  url: `https://${config.domainName}/presse`,
  publisher: {
    "@type": "Organization",
    name: "Baobab Loyalty",
    url: `https://${config.domainName}`,
  },
};

export default function PressePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pressSchema) }}
      />
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "Presse", urlRelative: "/presse" },
      ])}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        {/* Hero */}
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Presse & Médias
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Baobab Loyalty dans{" "}
              <span className="text-[#1a2f2a]">les médias</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Retrouvez ici nos communiqués de presse, chiffres clés et ressources pour les
              journalistes couvrant l&apos;hôtellerie, la tech et l&apos;économie numérique en
              Afrique de l&apos;Ouest et centrale.
            </p>
            <a
              href="mailto:presse@baobabloyalty.com"
              className="inline-block px-7 py-3.5 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              Contacter le service presse
            </a>
          </div>
        </section>

        {/* Key facts */}
        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Baobab Loyalty en chiffres
              </h2>
              <p className="text-[#a3c4b5] text-base">
                Données clés pour vos articles et publications.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {keyFacts.map((fact, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10"
                >
                  <p className="text-3xl font-bold text-[#EBC161] mb-1">{fact.value}</p>
                  <p className="text-white font-semibold text-sm mb-1">{fact.label}</p>
                  <p className="text-[#a3c4b5] text-xs leading-snug">{fact.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About boilerplate */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  À propos de Baobab Loyalty
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Baobab Loyalty est une solution SaaS de fidélisation clients pour hôtels en
                  Afrique francophone. La plateforme permet aux hôteliers de segmenter
                  automatiquement leur base clients, de créer des campagnes WhatsApp ciblées et
                  de générer des réservations directes sans commission OTA.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Conçue spécifiquement pour le marché africain — WhatsApp comme canal
                  principal, facturation en FCFA, interface en français — Baobab Loyalty est
                  disponible pour les hôteliers de Côte d&apos;Ivoire, du Sénégal, du Cameroun et du Ghana.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  La plateforme est accessible à partir de 39 000 FCFA par mois, sans
                  engagement, et fonctionnelle en moins de 10 minutes.
                </p>
              </div>
              <div className="bg-[#FDFDF9] rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-[#2C2C2C] mb-4 text-sm">Informations clés</h3>
                <dl className="space-y-3">
                  {[
                    { label: "Secteur", value: "SaaS / Hôtellerie / Tech for Africa" },
                    { label: "Marchés", value: "Côte d'Ivoire, Sénégal, Cameroun, Ghana" },
                    { label: "Canal principal", value: "WhatsApp Business API" },
                    { label: "Devise", value: "FCFA (XOF)" },
                    { label: "Site web", value: "baobabloyalty.com" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <dt className="text-xs font-semibold text-slate-400 w-28 shrink-0 pt-0.5">
                        {item.label}
                      </dt>
                      <dd className="text-xs text-slate-600 leading-snug">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Kit média */}
        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              Kit média
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-2">
              Aucun communiqué de presse n&apos;a encore été publié à ce jour. Pour toute demande
              d&apos;information, de chiffres actualisés ou de mise en relation avec l&apos;équipe
              fondatrice en vue d&apos;un article, contactez directement le service presse.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              Logo, captures d&apos;écran et éléments de langage disponibles sur demande par email.
            </p>
          </div>
        </section>

        {/* Media contact */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              Contact presse
            </h2>
            <p className="text-slate-500 text-base sm:text-lg mb-8 leading-relaxed">
              Pour toute demande d&apos;interview, de visuels supplémentaires ou d&apos;informations
              complémentaires, contactez notre équipe presse.
            </p>
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:presse@baobabloyalty.com"
                className="inline-block px-8 py-4 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
              >
                presse@baobabloyalty.com
              </a>
              <Link
                href="/demo"
                className="inline-block px-8 py-4 rounded-xl border border-slate-200 text-[#2C2C2C] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Tester la plateforme
              </Link>
            </div>
            <p className="text-slate-400 text-xs mt-6">
              Réponse sous 24 heures ouvrées. Interviews disponibles en français et en anglais.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
