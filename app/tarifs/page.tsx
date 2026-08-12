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
    description: "Pour démarrer et tester",
    price: "39 000",
    priceRaw: "39000",
    priceDetail: "FCFA HT / mois",
    rooms: "Jusqu'à 30 chambres",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Le meilleur rapport qualité/prix",
    price: "69 000",
    priceRaw: "69000",
    priceDetail: "FCFA HT / mois",
    rooms: "Jusqu'à 100 chambres",
    highlighted: true,
  },
  {
    name: "Premium",
    description: "Pour les grands établissements",
    price: "189 000",
    priceRaw: "189000",
    priceDetail: "FCFA HT / mois",
    rooms: "Chambres illimitées",
    highlighted: false,
  },
];

// Formate un nombre en "189 000" (espace insécable tous les 3 chiffres)
const formatFCFA = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Une seule matrice de fonctionnalités, lue par colonne (Starter, Pro, Premium)
// La ligne "Chambres" affiche un texte, les autres lignes un check/croix
const featureRows: { label: string; values: [string | boolean, string | boolean, string | boolean] }[] = [
  { label: "Chambres", values: ["Jusqu'à 30", "Jusqu'à 100", "Illimité"] },
  { label: "Utilisateurs", values: ["1", "1", "Illimité"] },
  { label: "Import CSV illimité", values: [true, true, true] },
  { label: "Segmentation automatique (3, 6, 9 mois)", values: [true, true, true] },
  { label: "Campagnes WhatsApp ciblées", values: [true, true, true] },
  { label: "Tableau de bord réservations", values: [true, true, true] },
  { label: "IA de génération de messages", values: [false, true, true] },
  { label: "Statistiques campagnes avancées", values: [false, true, true] },
  { label: "Support prioritaire", values: [false, true, true] },
  { label: "API WhatsApp dédiée", values: [false, false, true] },
  { label: "Accès multi-utilisateurs", values: [false, false, true] },
  { label: "Account manager dédié", values: [false, false, true] },
  { label: "Bonus : posts LinkedIn (IA)", values: [false, false, true] },
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

        {/* Grille tarifaire unifiée (prix + comparatif dans un seul tableau) */}
        <section className="pb-16 sm:pb-20 bg-[#FDFDF9]" id="plans">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="w-2/5" />
                    {plans.map((plan, i) => (
                      <th
                        key={i}
                        className={`align-bottom px-4 pt-6 pb-5 text-left ${
                          plan.highlighted
                            ? "bg-[#FCF6E4] border-t border-x border-[#EBC161] rounded-t-2xl"
                            : ""
                        }`}
                      >
                        {plan.highlighted ? (
                          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#EBC161] text-[#1a2f2a] text-[11px] font-bold uppercase tracking-wide">
                            Le choix recommandé
                          </span>
                        ) : (
                          <span className="block mb-3 h-[22px]" />
                        )}
                        <p className="font-bold text-base text-[#2C2C2C]">{plan.name}</p>
                        <p className="mt-1">
                          <span className="text-2xl font-bold text-[#1a2f2a]">{plan.price}</span>
                          <span className="text-xs text-slate-400 ml-1">{plan.priceDetail}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          soit {formatFCFA(Number(plan.priceRaw) * 3)} FCFA / 3 mois
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-snug max-w-[160px]">
                          {plan.description}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureRows.map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-6 text-slate-600 border-b border-slate-100">
                        {row.label}
                      </td>
                      {row.values.map((value, j) => (
                        <td
                          key={j}
                          className={`text-center py-3 px-4 border-b border-slate-100 ${
                            plans[j].highlighted ? "bg-[#FCF6E4] border-x border-[#EBC161]" : ""
                          }`}
                        >
                          {typeof value === "string" ? (
                            <span
                              className={`text-sm ${
                                plans[j].highlighted ? "font-semibold text-[#1a2f2a]" : "text-slate-600"
                              }`}
                            >
                              {value}
                            </span>
                          ) : value ? (
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
                <tfoot>
                  <tr>
                    <td />
                    {plans.map((plan, i) => (
                      <td
                        key={i}
                        className={`px-4 pt-5 pb-6 ${
                          plan.highlighted
                            ? "bg-[#FCF6E4] border-b border-x border-[#EBC161] rounded-b-2xl"
                            : ""
                        }`}
                      >
                        <Link
                          href="/demo"
                          className={`block w-full text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
                            plan.highlighted
                              ? "bg-[#EBC161] text-[#1a2f2a] hover:bg-[#d4a94d]"
                              : "border border-[#1a2f2a] text-[#1a2f2a] hover:bg-slate-50"
                          }`}
                        >
                          Essayer gratuitement
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-center text-slate-400 text-xs mt-6">
              Tous les prix sont en FCFA (XOF) et exprimés hors taxes (HT). Aucune TVA n&apos;est actuellement appliquée (régime d&apos;exonération) ; si ce régime évolue, la TVA sera ajoutée automatiquement au taux légal en vigueur. Facturation mensuelle.
            </p>
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
