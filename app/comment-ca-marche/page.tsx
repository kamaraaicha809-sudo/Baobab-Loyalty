import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Comment fonctionne Baobab Loyalty — Guide étape par étape",
  description: "Importez votre CSV → segmentez vos clients → lancez une campagne WhatsApp en 10 min. Zéro commission, zéro compétence technique. Résultats dès le premier envoi.",
  canonicalUrlRelative: "/comment-ca-marche",
});

const steps = [
  {
    number: "01",
    title: "Créez votre compte gratuitement",
    desc: "Inscrivez-vous en 30 secondes avec votre email. Aucune carte bancaire requise. Vous accédez immédiatement à votre tableau de bord.",
    detail:
      "Dès la création de votre compte, un assistant de configuration vous guide pour renseigner les informations de base de votre hôtel : nom de l'établissement, nombre de chambres, ville.",
    duration: "~2 minutes",
  },
  {
    number: "02",
    title: "Importez votre base clients",
    desc: "Chargez votre fichier Excel ou CSV existant. Le système détecte automatiquement les colonnes et importe vos clients en quelques secondes.",
    detail:
      "Baobab Loyalty reconnaît automatiquement les colonnes nom, prénom, téléphone WhatsApp, email et date de dernière visite. Si votre fichier a des noms de colonnes différents, vous pouvez les associer manuellement. Import par batch de 100 contacts.",
    duration: "~2 minutes",
  },
  {
    number: "03",
    title: "Consultez vos segments de clients",
    desc: "Le système analyse votre base et regroupe vos clients selon leur inactivité : 3 mois, 6 mois, 9 mois et tous les clients.",
    detail:
      "Vous voyez immédiatement combien de clients sont dans chaque segment. Un client inactif depuis 3 mois est un client à reconquérir rapidement. Un client inactif depuis 9 mois nécessite une offre plus généreuse. Baobab Loyalty vous aide à calibrer votre approche.",
    duration: "Instantané",
  },
  {
    number: "04",
    title: "Créez votre offre et rédigez votre campagne",
    desc: "Choisissez un segment, créez une offre (réduction, upgrade, cocktail de bienvenue...) et rédigez votre message WhatsApp — ou laissez l'IA le faire.",
    detail:
      "L'IA de Baobab Loyalty génère un message adapté au segment ciblé et à l'offre choisie. Vous pouvez l'accepter tel quel ou le modifier. Un aperçu du message est affiché avant envoi.",
    duration: "~3 minutes",
  },
  {
    number: "05",
    title: "Envoyez et suivez vos résultats",
    desc: "Confirmez l'envoi. Vos clients reçoivent le message directement sur WhatsApp. Suivez les clics, les réservations et les revenus générés en temps réel.",
    detail:
      "Chaque lien envoyé est unique et traçable. Votre tableau de bord se met à jour en temps réel dès qu'un client clique sur l'offre ou effectue une réservation. Les revenus générés sont affichés directement en FCFA.",
    duration: "Continu",
  },
];

const faqs = [
  {
    q: "Est-ce que j'ai besoin de compétences techniques ?",
    a: "Non. Baobab Loyalty est conçu pour les hôteliers, pas pour les développeurs. Toute l'interface est en français et chaque étape est guidée. Si vous savez utiliser Excel, vous savez utiliser Baobab Loyalty.",
  },
  {
    q: "Quel format de fichier est accepté pour l'import ?",
    a: "Les formats Excel (.xlsx) et CSV (.csv) sont pris en charge. Votre fichier doit contenir au minimum un nom et un numéro de téléphone WhatsApp. La date de dernière visite est utilisée pour la segmentation.",
  },
  {
    q: "Combien de temps faut-il pour envoyer une première campagne ?",
    a: "De la création du compte à l'envoi de la première campagne, il faut en moyenne 10 minutes. La majorité du temps est consacrée à l'import de votre base clients.",
  },
  {
    q: "Mes clients reçoivent-ils les messages sur leur WhatsApp personnel ?",
    a: "Oui. Les messages sont envoyés directement sur le numéro WhatsApp de vos clients. C'est pourquoi WhatsApp est le canal le plus efficace : le taux d'ouverture dépasse 90% en Afrique de l'Ouest.",
  },
  {
    q: "Puis-je personaliser les messages pour chaque segment ?",
    a: "Oui. Vous créez une campagne par segment avec un message et une offre adaptés. L'IA vous aide à rédiger des messages cohérents avec le niveau d'inactivité de vos clients.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment fidéliser vos clients hôtel avec Baobab Loyalty",
  description:
    "Guide pas-à-pas pour créer votre compte, importer vos clients, segmenter et lancer votre première campagne WhatsApp en moins de 10 minutes.",
  totalTime: "PT10M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "XOF",
    value: "29000",
  },
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.detail,
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
      name: "Comment ça marche",
      item: `https://${config.domainName}/comment-ca-marche`,
    },
  ],
};

export default function CommentCaMarchePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
              Comment ça marche
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              De zéro à votre{" "}
              <span className="text-[#1a2f2a]">première campagne WhatsApp</span>{" "}
              en 10 minutes
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Pas de complexité technique, pas d'intégration longue. Importez votre base
              clients, segmentez et envoyez — en moins de 10 minutes, vos anciens clients
              reçoivent une offre personnalisée sur WhatsApp.
            </p>
            <Link
              href="/demo"
              className="inline-block px-7 py-3.5 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              Essayer maintenant
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="space-y-6">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-6 sm:gap-8 items-start bg-[#FDFDF9] p-6 sm:p-8 rounded-2xl border border-slate-100"
                >
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#1a2f2a] flex items-center justify-center">
                      <span className="text-[#EBC161] font-bold text-sm">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="font-bold text-[#2C2C2C] text-base sm:text-lg">
                        {step.title}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-3">
                      {step.desc}
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Result summary */}
        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                Ce que vous obtenez concrètement
              </h2>
              <p className="text-[#a3c4b5] text-base sm:text-lg max-w-2xl mx-auto">
                Résultats constatés chez les hôteliers qui utilisent Baobab Loyalty.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { value: "10 min", label: "Pour lancer votre première campagne" },
                { value: "3×", label: "Plus de réservations directes en moyenne" },
                { value: "−35%", label: "De dépendance aux OTAs après 3 mois" },
                { value: "90%+", label: "Taux d'ouverture des messages WhatsApp" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-[#EBC161] mb-1">{stat.value}</p>
                  <p className="text-[#a3c4b5] text-xs leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
                Questions fréquentes
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
        <section className="py-16 sm:py-20 bg-[#FDFDF9] border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4 leading-snug">
              Prêt à lancer votre première campagne ?
            </h2>
            <p className="text-slate-500 text-base sm:text-lg mb-8 leading-relaxed">
              Rejoignez les hôteliers d'Afrique qui fidélisent leurs clients via WhatsApp.
              Démarrez gratuitement, sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/demo"
                className="inline-block px-8 py-4 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
              >
                Essayer gratuitement
              </Link>
              <Link
                href="/tarifs"
                className="inline-block px-8 py-4 rounded-xl border border-slate-200 text-[#2C2C2C] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              Aucune carte bancaire requise. Fonctionnel en 10 minutes.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
