import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Tarifs Baobab Loyalty — À partir de 39 000 FCFA/mois",
  description: "Plans Starter, Pro et Premium : 39 000, 69 000 et 189 000 FCFA/mois. Sans engagement, résiliable à tout moment. Pour hôtels d'Afrique de l'Ouest.",
  canonicalUrlRelative: "/tarifs",
});

const plans = [
  {
    name: "Starter",
    price: "39 000",
    priceRaw: "39000",
    priceDetail: "FCFA / mois",
    rooms: "Jusqu'à 30 chambres",
    highlighted: false,
    features: [
      "Importation CSV illimitée",
      "Segmentation automatique (3, 6, 9 mois)",
      "Campagnes WhatsApp ciblées",
      "Tableau de bord réservations",
      "Support par email en français",
    ],
    notIncluded: ["IA de génération de messages", "API WhatsApp dédiée"],
  },
  {
    name: "Pro",
    price: "69 000",
    priceRaw: "69000",
    priceDetail: "FCFA / mois",
    rooms: "Jusqu'à 100 chambres",
    highlighted: true,
    features: [
      "Tout Starter inclus",
      "IA de génération de messages",
      "Suivi des réservations en temps réel",
      "Statistiques campagnes avancées",
      "Support prioritaire",
    ],
    notIncluded: ["API WhatsApp dédiée"],
  },
  {
    name: "Premium",
    price: "189 000",
    priceRaw: "189000",
    priceDetail: "FCFA / mois",
    rooms: "Chambres illimitées",
    highlighted: false,
    features: [
      "Tout Pro inclus",
      "API WhatsApp dédiée",
      "Accès multi-utilisateurs",
      "Onboarding personnalisé",
      "Account manager dédié",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    q: "Est-ce qu'il y a un engagement ou une durée minimale ?",
    a: "Non. Baobab Loyalty est sans engagement. Vous êtes facturé mois par mois et pouvez résilier à tout moment depuis votre espace client, sans frais ni préavis.",
  },
  {
    q: "Est-ce que je peux changer de plan en cours d'abonnement ?",
    a: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement prend effet au prochain cycle de facturation.",
  },
  {
    q: "Est-ce que les prix incluent l'envoi WhatsApp ?",
    a: "Les plans incluent l'accès à la plateforme et l'envoi de campagnes via l'API WhatsApp partagée. Le plan Premium inclut une API WhatsApp dédiée pour un volume élevé d'envois.",
  },
  {
    q: "Puis-je essayer avant de payer ?",
    a: "Oui. Vous pouvez tester Baobab Loyalty gratuitement en mode démo, sans créer de compte ni fournir de carte bancaire. Toutes les fonctionnalités sont accessibles.",
  },
  {
    q: "Les prix sont-ils en FCFA pour tous les pays ?",
    a: "Les plans FCFA s'appliquent aux hôtels en Côte d'Ivoire, au Sénégal, au Cameroun, au Bénin et dans les pays de la zone FCFA. Pour le Ghana, des plans en GHS sont disponibles.",
  },
  {
    q: "Comment fonctionne le support ?",
    a: "Le support est assuré par email en français pour tous les plans. Le plan Pro bénéficie d'un support prioritaire avec réponse sous 4 heures. Le plan Premium inclut un account manager dédié.",
  },
];

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: config.appName,
  description:
    "Logiciel de fidélisation clients pour hôtels en Afrique. Segmentation, campagnes WhatsApp et tableau de bord en temps réel.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: `https://${config.domainName}`,
  offers: plans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    description: `Plan ${plan.name} — ${plan.rooms}`,
    price: plan.priceRaw,
    priceCurrency: "XOF",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: plan.priceRaw,
      priceCurrency: "XOF",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "MON",
      },
    },
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: `https://${config.domainName}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Tarifs",
      item: `https://${config.domainName}/tarifs`,
    },
  ],
};

export default function TarifsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        {/* Hero */}
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Tarifs
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Des prix pensés pour{" "}
              <span className="text-[#1a2f2a]">les hôtels africains</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-3">
              Facturation en FCFA. Sans engagement. Résiliable à tout moment.
            </p>
            <p className="text-slate-400 text-sm">
              Vous démarrez avec un essai gratuit — aucune carte bancaire requise.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-16 sm:pb-20 bg-[#FDFDF9]" id="plans">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-7 flex flex-col ${
                    plan.highlighted
                      ? "bg-[#1a2f2a] text-white ring-2 ring-[#EBC161]"
                      : "bg-white border border-slate-100 shadow-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="text-[#EBC161] text-xs font-bold uppercase tracking-widest mb-3">
                      Populaire
                    </span>
                  )}
                  <h2
                    className={`font-bold text-lg mb-1 ${
                      plan.highlighted ? "text-white" : "text-[#2C2C2C]"
                    }`}
                  >
                    {plan.name}
                  </h2>
                  <p
                    className={`text-xs mb-4 ${
                      plan.highlighted ? "text-[#a3c4b5]" : "text-slate-400"
                    }`}
                  >
                    {plan.rooms}
                  </p>
                  <div className="mb-5">
                    <span
                      className={`text-3xl font-bold ${
                        plan.highlighted ? "text-[#EBC161]" : "text-[#2C2C2C]"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ml-1 ${
                        plan.highlighted ? "text-[#a3c4b5]" : "text-slate-400"
                      }`}
                    >
                      {plan.priceDetail}
                    </span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <svg
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            plan.highlighted ? "text-[#EBC161]" : "text-[#1a2f2a]"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span
                          className={`text-sm leading-snug ${
                            plan.highlighted ? "text-[#d4e8df]" : "text-slate-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, j) => (
                      <li key={`no-${j}`} className="flex items-start gap-2.5 opacity-40">
                        <svg
                          className="w-4 h-4 mt-0.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span
                          className={`text-sm leading-snug ${
                            plan.highlighted ? "text-[#a3c4b5]" : "text-slate-500"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/demo"
                    className={`w-full text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      plan.highlighted
                        ? "bg-[#EBC161] text-[#1a2f2a] hover:bg-[#d4a94d]"
                        : "border border-[#1a2f2a] text-[#1a2f2a] hover:bg-slate-50"
                    }`}
                  >
                    Démarrer gratuitement
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-400 text-xs mt-6">
              Tous les prix sont en FCFA (XOF), hors taxes applicables. Facturation mensuelle.
            </p>
          </div>
        </section>

        {/* What's included comparison */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
                Comparatif des fonctionnalités
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 pr-6 text-slate-500 font-normal w-2/5">Fonctionnalité</th>
                    <th className="text-center py-3 px-4 text-[#2C2C2C] font-semibold">Starter</th>
                    <th className="text-center py-3 px-4 text-[#1a2f2a] font-bold">Pro</th>
                    <th className="text-center py-3 px-4 text-[#2C2C2C] font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Import CSV illimité", true, true, true],
                    ["Segmentation automatique", true, true, true],
                    ["Campagnes WhatsApp", true, true, true],
                    ["Tableau de bord réservations", true, true, true],
                    ["IA de génération de messages", false, true, true],
                    ["Statistiques avancées", false, true, true],
                    ["Support prioritaire", false, true, true],
                    ["API WhatsApp dédiée", false, false, true],
                    ["Accès multi-utilisateurs", false, false, true],
                    ["Account manager dédié", false, false, true],
                  ].map(([label, ess, cro, pre], i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-6 text-slate-600">{label as string}</td>
                      {[ess, cro, pre].map((has, j) => (
                        <td key={j} className="text-center py-3 px-4">
                          {has ? (
                            <svg className="w-4 h-4 text-[#1a2f2a] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-200 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
                Questions fréquentes sur les tarifs
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h3 className="font-semibold text-[#2C2C2C] mb-2 text-sm sm:text-base">
                    {faq.q}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
              Commencez gratuitement aujourd'hui
            </h2>
            <p className="text-[#a3c4b5] text-base sm:text-lg mb-8 leading-relaxed">
              Aucune carte bancaire requise. Fonctionnel en 10 minutes.
              Passez à un plan payant uniquement si vous êtes convaincu.
            </p>
            <Link
              href="/demo"
              className="inline-block px-8 py-4 rounded-xl bg-[#EBC161] text-[#1a2f2a] text-sm font-bold hover:bg-[#d4a94d] transition-colors"
            >
              Essayer gratuitement
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
