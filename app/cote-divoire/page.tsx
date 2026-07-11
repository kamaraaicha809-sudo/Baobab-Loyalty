import { Suspense } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import {
  CountryLandingPage,
  type CountryPageData,
} from "@/components/landing/CountryLandingPage";

export const metadata = getSEOTags({
  title: "Logiciel fidélisation hôtel Côte d'Ivoire — Baobab Loyalty",
  description: "Logiciel fidélisation hôtel Côte d'Ivoire : 3× plus de réservations directes, −35% commissions OTA. Campagnes WhatsApp IA en FCFA, opérationnel en 10 min. Essai gratuit.",
  canonicalUrlRelative: "/cote-divoire",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Solution de fidélisation clients pour hôtels en Côte d'Ivoire. Campagnes WhatsApp ciblées, segmentation automatique et réservations directes sans commission OTA.",
  url: `https://${config.domainName}/cote-divoire`,
  areaServed: [
    { "@type": "AdministrativeArea", name: "Côte d'Ivoire" },
    { "@type": "City", name: "Abidjan" },
  ],
  serviceType: "Logiciel de fidélisation hôtelière",
  priceRange: "39 000 - 189 000 FCFA/mois",
  currenciesAccepted: "XOF",
  knowsLanguage: "fr",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "61",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Kouamé A." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Avant Baobab Loyalty, je n'avais aucun moyen de recontacter mes anciens clients. Maintenant je lance une campagne en 10 minutes et je vois des réservations arriver dans la journée. En 2 mois, j'ai récupéré plus de 15 clients réguliers.",
      datePublished: "2026-05-05",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce qu'un logiciel de fidélisation hôtel ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un logiciel de fidélisation hôtel automatise la relance de vos anciens clients via WhatsApp. Il identifie automatiquement les clients inactifs depuis 3, 6 ou 9 mois, génère des messages personnalisés avec l'IA, et vous permet de lancer une campagne ciblée en moins de 10 minutes — sans compétence technique.",
      },
    },
    {
      "@type": "Question",
      name: "Combien coûte un logiciel de fidélisation hôtel en Côte d'Ivoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Baobab Loyalty propose des formules adaptées aux hôtels ivoiriens à partir de 39 000 FCFA/mois pour les établissements jusqu'à 30 chambres. Le plan Pro (69 000 FCFA/mois) convient aux hôtels jusqu'à 100 chambres. Le plan Premium (189 000 FCFA/mois) est illimité. Pas d'engagement, résiliable à tout moment.",
      },
    },
    {
      "@type": "Question",
      name: "Comment réduire les commissions Booking.com pour un hôtel en Côte d'Ivoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La méthode la plus efficace est de reconnecter directement avec vos anciens clients via WhatsApp, sans passer par les OTAs. Avec Baobab Loyalty, les hôtels ivoiriens observent une réduction de 35% de leur dépendance aux OTAs après 3 mois : chaque réservation directe vous fait économiser 15 à 20% de commission Booking.com.",
      },
    },
    {
      "@type": "Question",
      name: "En combien de temps peut-on lancer une première campagne WhatsApp ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Avec Baobab Loyalty, vous pouvez lancer votre première campagne WhatsApp en moins de 10 minutes : importez votre fichier CSV clients, choisissez un segment (clients inactifs depuis 3, 6 ou 9 mois), laissez l'IA rédiger le message, et envoyez. Aucune compétence technique requise.",
      },
    },
    {
      "@type": "Question",
      name: "Baobab Loyalty est-il adapté aux petits hôtels en Côte d'Ivoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Baobab Loyalty est conçu spécifiquement pour les hôtels d'Afrique francophone, quelle que soit leur taille. Le plan Starter à 39 000 FCFA/mois est rentabilisé dès 2 à 3 réservations directes supplémentaires par mois. L'interface est en français, les prix sont en FCFA, et le support est francophone.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "Qu'est-ce qu'un logiciel de fidélisation hôtel ?",
    a: "Un logiciel de fidélisation hôtel automatise la relance de vos anciens clients via WhatsApp. Il identifie les clients inactifs depuis 3, 6 ou 9 mois, génère des messages personnalisés avec l'IA, et vous permet de lancer une campagne ciblée en moins de 10 minutes.",
  },
  {
    q: "Combien coûte un logiciel de fidélisation hôtel en Côte d'Ivoire ?",
    a: "Baobab Loyalty propose des formules en FCFA à partir de 39 000 FCFA/mois pour les hôtels jusqu'à 30 chambres. Le plan Pro (69 000 FCFA/mois) couvre jusqu'à 100 chambres, et le plan Premium (189 000 FCFA/mois) est illimité. Sans engagement.",
  },
  {
    q: "Comment réduire les commissions Booking.com pour mon hôtel en Côte d'Ivoire ?",
    a: "En relançant directement vos anciens clients via WhatsApp, vous les faites réserver sans passer par les OTAs. Les hôtels ivoiriens utilisant Baobab Loyalty observent −35% de dépendance aux OTAs en 3 mois, économisant 15 à 20% de commission sur chaque réservation directe.",
  },
  {
    q: "En combien de temps peut-on lancer une campagne WhatsApp ?",
    a: "Moins de 10 minutes : importez votre CSV clients, sélectionnez un segment d'inactifs, laissez l'IA rédiger le message, envoyez. Aucune compétence technique requise. Vos clients reçoivent l'offre directement sur WhatsApp.",
  },
  {
    q: "Baobab Loyalty fonctionne-t-il pour les petits hôtels ivoiriens ?",
    a: "Oui. Le logiciel est conçu pour les hôtels africains dès 20 chambres. Interface en français, prix en FCFA, support francophone. Le plan Starter est rentabilisé dès 2-3 réservations directes supplémentaires par mois.",
  },
];

const data: CountryPageData = {
  locale: "fr",
  country: "Côte d'Ivoire",
  countryCode: "CI",
  heroEyebrow: "Logiciel fidélisation hôtel · Côte d'Ivoire",
  heroTitle: "Logiciel de fidélisation hôtel en",
  heroTitleHighlight: "Côte d'Ivoire",
  heroSubtitle:
    "Abidjan concentre les plus grands hôtels d'affaires d'Afrique de l'Ouest. Baobab Loyalty transforme chaque séjour en réservation directe — via WhatsApp, en FCFA, sans commission.",
  heroCta: "Démarrer gratuitement",
  statsItems: [
    {
      value: "85%",
      label: "des voyageurs d'affaires à Abidjan utilisent WhatsApp quotidiennement",
    },
    { value: "−35%", label: "de dépendance aux OTAs constatée après 3 mois" },
    { value: "10 min", label: "pour lancer votre première campagne WhatsApp" },
    { value: "3×", label: "plus de réservations directes en moyenne" },
  ],
  problemTitle: "Les hôtels ivoiriens perdent des revenus chaque mois",
  problemSubtitle:
    "Booking.com et les autres OTAs captent 15 à 20% de commission. Sans outil de fidélisation adapté, vos clients vous oublient dès leur départ.",
  problemPoints: [
    {
      title: "Clients perdus après le check-out",
      desc: "Votre client a passé un excellent séjour à Abidjan. Mais sans recontact, il réservera chez un concurrent la prochaine fois. 70% des clients ne reviennent pas faute de suivi.",
    },
    {
      title: "Commission OTA de 15 à 20%",
      desc: "Booking.com prend entre 15% et 20% sur chaque réservation. Pour un hôtel ivoirien, cela représente des millions de FCFA perdus chaque année au profit d'une plateforme étrangère.",
    },
    {
      title: "Pas d'outil adapté au marché local",
      desc: "Les CRM internationaux sont complexes, chers et pensés pour l'Europe. Ils ne gèrent ni le WhatsApp, ni le FCFA, ni les usages des clients ivoiriens.",
    },
  ],
  solutionTitle: "La solution pensée pour les hôtels ivoiriens",
  solutionSubtitle:
    "Interface en français, prix en FCFA, envoi via WhatsApp — le canal numéro un en Côte d'Ivoire. Baobab Loyalty est conçu pour votre marché.",
  solutionSteps: [
    {
      step: "01",
      title: "Importez votre base clients en 2 minutes",
      desc: "Chargez votre fichier Excel ou CSV. Le système détecte automatiquement les colonnes : nom, téléphone WhatsApp, date de dernière visite. Aucune compétence technique requise.",
    },
    {
      step: "02",
      title: "Segmentez vos clients automatiquement",
      desc: "Baobab Loyalty identifie vos clients inactifs depuis 3, 6 ou 9 mois. Ciblez précisément les profils à reconquérir et adaptez votre offre à chaque segment.",
    },
    {
      step: "03",
      title: "Lancez une campagne WhatsApp ciblée",
      desc: "Rédigez votre message ou laissez l'IA le générer. Choisissez votre segment, confirmez et envoyez. Vos clients reçoivent une offre personnalisée directement sur WhatsApp.",
    },
  ],
  testimonial: {
    quote:
      "Avant Baobab Loyalty, je n'avais aucun moyen de recontacter mes anciens clients. Maintenant je lance une campagne en 10 minutes et je vois des réservations arriver dans la journée. En 2 mois, j'ai récupéré plus de 15 clients réguliers.",
    author: "Kouamé A.",
    role: "Directeur général",
    hotel: "Hôtel Les Flamboyants",
    city: "Abidjan",
    initials: "KA",
  },
  pricingTitle: "Tarifs adaptés aux hôtels ivoiriens",
  pricingSubtitle: "Prix en FCFA, sans engagement. Résiliable à tout moment.",
  plans: [
    {
      name: "Starter",
      price: "39 000 FCFA",
      priceDetail: "/ mois",
      rooms: "Jusqu'à 30 chambres",
      highlighted: false,
      features: [
        "Importation CSV illimitée",
        "Segmentation automatique (3, 6, 9 mois)",
        "Campagnes WhatsApp ciblées",
        "Tableau de bord réservations",
        "Support par email en français",
      ],
    },
    {
      name: "Pro",
      price: "69 000 FCFA",
      priceDetail: "/ mois",
      rooms: "Jusqu'à 100 chambres",
      highlighted: true,
      features: [
        "Tout Starter inclus",
        "IA de génération de messages",
        "Suivi des réservations en temps réel",
        "Statistiques campagnes avancées",
        "Support prioritaire",
      ],
    },
    {
      name: "Premium",
      price: "189 000 FCFA",
      priceDetail: "/ mois",
      rooms: "Chambres illimitées",
      highlighted: false,
      features: [
        "Tout Pro inclus",
        "API WhatsApp dédiée",
        "Accès multi-utilisateurs",
        "Onboarding personnalisé",
        "Account manager dédié",
        "Bonus : génération de posts LinkedIn (IA)",
      ],
    },
  ],
  ctaTitle: "Prêt à fidéliser vos clients à Abidjan ?",
  ctaSubtitle:
    "Rejoignez les hôteliers ivoiriens qui augmentent leurs réservations directes. Lancez-vous en 10 minutes, sans carte bancaire.",
  ctaButton: "Essayer gratuitement",
  relatedBlog: {
    slug: "marketing-hotel-abidjan-cote-ivoire",
    title:
      "Marketing hôtelier à Abidjan : stratégies pour se démarquer en Côte d'Ivoire",
    readingTime: 7,
  },
};

export default function CoteDIvoirePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Suspense>
        <Header />
      </Suspense>
      <CountryLandingPage data={data} />
      <section className="py-16 sm:py-20 bg-[#FDFDF9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-10 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-slate-100 pb-6 last:border-0">
                <h3 className="font-bold text-[#2C2C2C] mb-2 text-base">{item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
