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
  title: "Fidélisation hôtelière en Côte d'Ivoire — Baobab Loyalty",
  description: "Hôtels ivoiriens : 3× plus de réservations directes, −35% commissions OTA. Campagnes WhatsApp ciblées en FCFA, opérationnel en 10 min. Essai gratuit.",
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
  priceRange: "29 000 - 69 000 FCFA/mois",
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

const data: CountryPageData = {
  locale: "fr",
  country: "Côte d'Ivoire",
  countryCode: "CI",
  heroEyebrow: "Fidélisation hôtelière · Côte d'Ivoire",
  heroTitle: "Fidélisez vos clients hôtel en",
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
      name: "Essentiel",
      price: "29 000 FCFA",
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
      name: "Croissance",
      price: "49 000 FCFA",
      priceDetail: "/ mois",
      rooms: "Jusqu'à 100 chambres",
      highlighted: true,
      features: [
        "Tout Essentiel inclus",
        "IA de génération de messages",
        "Suivi des réservations en temps réel",
        "Statistiques campagnes avancées",
        "Support prioritaire",
      ],
    },
    {
      name: "Premium",
      price: "69 000 FCFA",
      priceDetail: "/ mois",
      rooms: "Chambres illimitées",
      highlighted: false,
      features: [
        "Tout Croissance inclus",
        "API WhatsApp dédiée",
        "Accès multi-utilisateurs",
        "Onboarding personnalisé",
        "Account manager dédié",
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
      <Suspense>
        <Header />
      </Suspense>
      <CountryLandingPage data={data} />
      <Footer />
    </>
  );
}
