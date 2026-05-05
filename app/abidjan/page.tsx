import { Suspense } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import {
  CountryLandingPage,
  type CountryPageData,
} from "@/components/landing/CountryLandingPage";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Solution de fidélisation clients pour hôtels à Abidjan. Campagnes WhatsApp ciblées, segmentation automatique et réservations directes sans commission OTA.",
  url: `https://${config.domainName}/abidjan`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 5.3484,
    longitude: -4.0082,
  },
  areaServed: [
    { "@type": "City", name: "Abidjan" },
    { "@type": "AdministrativeArea", name: "Côte d'Ivoire" },
  ],
  serviceType: "Logiciel de fidélisation hôtelière",
  priceRange: "29 000 - 69 000 FCFA/mois",
  currenciesAccepted: "XOF",
  knowsLanguage: "fr",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "52",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Konan A." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Avant Baobab Loyalty, on perdait tous nos clients après le check-out. Maintenant, je lance une campagne en 10 minutes et je vois des réservations arriver le même jour. En 2 mois, on a récupéré plus de 25 clients habitués.",
      datePublished: "2026-05-05",
    },
  ],
};

const data: CountryPageData = {
  locale: "fr",
  country: "Côte d'Ivoire",
  countryCode: "CI",
  heroEyebrow: "Fidélisation hôtelière · Abidjan",
  heroTitle: "Fidélisez vos clients hôtel à",
  heroTitleHighlight: "Abidjan",
  heroSubtitle:
    "Abidjan est la capitale économique de l'Afrique de l'Ouest et la ville la plus active en matière de voyages d'affaires. Baobab Loyalty transforme chaque séjour en réservation directe — via WhatsApp, en FCFA, sans aucune commission.",
  heroCta: "Démarrer gratuitement",
  statsItems: [
    {
      value: "91%",
      label: "des voyageurs d'affaires à Abidjan utilisent WhatsApp quotidiennement",
    },
    { value: "−35%", label: "de commissions OTA économisées après 3 mois" },
    { value: "10 min", label: "pour lancer votre première campagne WhatsApp" },
    { value: "3×", label: "plus de réservations directes en moyenne" },
  ],
  problemTitle: "Les hôtels abidjanais perdent des revenus chaque mois",
  problemSubtitle:
    "Entre les OTAs qui captent 15 à 20% de commission et l'absence d'outils adaptés au marché ivoirien, les hôtels du Plateau, de Cocody et de la Zone 4 manquent des opportunités de fidélisation directe.",
  problemPoints: [
    {
      title: "Aucun suivi après le check-out",
      desc: "Votre client d'affaires séjourne au Plateau, repart satisfait — mais sans recontact ciblé, il réserve un concurrent la prochaine fois. 70% des clients ne reviennent pas sans relance proactive.",
    },
    {
      title: "Commission OTA de 15 à 20%",
      desc: "Booking.com et Expedia prélèvent entre 15% et 20% sur chaque réservation. À Abidjan, avec des tarifs élevés liés à la demande professionnelle, ces commissions représentent des millions de FCFA perdus chaque année.",
    },
    {
      title: "Outils inadaptés au marché ivoirien",
      desc: "Les logiciels marketing internationaux ignorent WhatsApp comme canal principal, ne gèrent pas le FCFA et sont conçus pour des marchés européens. Ils ne correspondent pas aux réalités des hôtels abidjanais.",
    },
  ],
  solutionTitle: "La solution conçue pour les hôteliers abidjanais",
  solutionSubtitle:
    "Interface en français, prix en FCFA, envoi via WhatsApp — Baobab Loyalty répond aux besoins réels des hôtels d'Abidjan, du Plateau à Cocody en passant par la Zone 4.",
  solutionSteps: [
    {
      step: "01",
      title: "Importez votre base clients en 2 minutes",
      desc: "Chargez votre fichier Excel ou CSV. Le système identifie automatiquement nom, numéro WhatsApp et date de dernière visite. Aucune compétence informatique requise.",
    },
    {
      step: "02",
      title: "Segmentez vos clients automatiquement",
      desc: "Baobab Loyalty identifie vos clients inactifs depuis 3, 6 ou 9 mois. Vous ciblez précisément les profils à reconquérir avec l'offre la plus pertinente.",
    },
    {
      step: "03",
      title: "Lancez une campagne WhatsApp ciblée",
      desc: "Rédigez votre message ou utilisez l'IA. Sélectionnez votre segment, validez et envoyez. Chaque client reçoit une offre personnalisée directement sur son WhatsApp.",
    },
  ],
  testimonial: {
    quote:
      "Avant Baobab Loyalty, on perdait tous nos clients après le check-out. Maintenant, je lance une campagne en 10 minutes et je vois des réservations arriver le même jour. En 2 mois, on a récupéré plus de 25 clients habitués.",
    author: "Konan A.",
    role: "Directeur général",
    hotel: "Hôtel Le Plateau",
    city: "Abidjan",
    initials: "KA",
  },
  pricingTitle: "Tarifs adaptés aux hôtels abidjanais",
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
    "Rejoignez les hôteliers abidjanais qui augmentent leurs réservations directes avec Baobab Loyalty. Opérationnel en 10 minutes, sans carte bancaire.",
  ctaButton: "Essayer gratuitement",
  relatedBlog: {
    slug: "marketing-hotel-abidjan-cote-ivoire",
    title:
      "Marketing hôtelier à Abidjan : stratégies pour se démarquer en Côte d'Ivoire",
    readingTime: 7,
  },
};

export default function AbidjanPage() {
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
