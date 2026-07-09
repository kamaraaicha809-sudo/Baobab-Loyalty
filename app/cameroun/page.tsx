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
  title: "Fidélisation hôtelière au Cameroun — Baobab Loyalty",
  description: "Hôtels de Douala et Yaoundé : campagnes WhatsApp ciblées, −30% commissions OTA, prix en FCFA. 12 réservations en 1 semaine. Essai gratuit.",
  canonicalUrlRelative: "/cameroun",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Solution de fidélisation clients pour hôtels au Cameroun. Campagnes WhatsApp ciblées, segmentation automatique et réservations directes sans commission OTA.",
  url: `https://${config.domainName}/cameroun`,
  areaServed: [
    { "@type": "AdministrativeArea", name: "Cameroun" },
    { "@type": "City", name: "Douala" },
    { "@type": "City", name: "Yaoundé" },
  ],
  serviceType: "Logiciel de fidélisation hôtelière",
  priceRange: "39 000 - 189 000 FCFA/mois",
  currenciesAccepted: "XOF",
  knowsLanguage: "fr",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "35",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Jean-Paul N." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Baobab Loyalty nous a permis de recontacter des clients perdus depuis 9 mois. La campagne de réactivation a généré 12 réservations en une semaine. Pour notre hôtel à Douala, c'est un vrai changement de stratégie.",
      datePublished: "2026-05-05",
    },
  ],
};

const data: CountryPageData = {
  locale: "fr",
  country: "Cameroun",
  countryCode: "CM",
  heroEyebrow: "Fidélisation hôtelière · Cameroun",
  heroTitle: "Fidélisez vos clients hôtel au",
  heroTitleHighlight: "Cameroun",
  heroSubtitle:
    "Douala et Yaoundé sont les deux moteurs hôteliers du Cameroun. Baobab Loyalty transforme chaque séjour en réservation directe — via WhatsApp, en FCFA, sans aucune commission.",
  heroCta: "Démarrer gratuitement",
  statsItems: [
    {
      value: "88%",
      label: "des voyageurs d'affaires à Douala utilisent WhatsApp quotidiennement",
    },
    { value: "−30%", label: "de commissions OTA économisées après 3 mois" },
    { value: "10 min", label: "pour lancer votre première campagne WhatsApp" },
    { value: "3×", label: "plus de réservations directes en moyenne" },
  ],
  problemTitle: "Les hôtels camerounais dépendent trop des intermédiaires",
  problemSubtitle:
    "Entre les OTAs qui prennent 15 à 20% de commission et l'absence d'outils adaptés, les hôtels de Douala et Yaoundé manquent des opportunités de fidélisation à grande échelle.",
  problemPoints: [
    {
      title: "Aucun suivi après le check-out",
      desc: "Vos clients repartent satisfaits — mais sans recontact, ils ne pensent pas à revenir directement. 70% des clients ne retournent pas dans le même hôtel faute de maintien du lien.",
    },
    {
      title: "Commission OTA de 15 à 20%",
      desc: "Booking.com, Expedia et les OTAs captent entre 15% et 20% sur chaque réservation. À Douala ou Yaoundé, ces commissions représentent des millions de FCFA perdus chaque année.",
    },
    {
      title: "Outils inadaptés au marché camerounais",
      desc: "Les logiciels marketing internationaux sont conçus pour l'Europe : ils ignorent WhatsApp comme canal principal, ne gèrent pas le FCFA et coûtent trop cher pour les hôtels africains.",
    },
  ],
  solutionTitle: "La solution adaptée aux hôteliers camerounais",
  solutionSubtitle:
    "Interface en français, prix en FCFA, envoi via WhatsApp — Baobab Loyalty répond aux besoins réels des hôtels de Douala, Yaoundé et de tout le Cameroun.",
  solutionSteps: [
    {
      step: "01",
      title: "Importez votre base clients en 2 minutes",
      desc: "Chargez votre fichier Excel ou CSV. Le système identifie automatiquement nom, numéro WhatsApp et date de dernière visite. Aucune compétence informatique requise.",
    },
    {
      step: "02",
      title: "Segmentez vos clients automatiquement",
      desc: "Le système identifie vos clients inactifs depuis 3, 6 ou 9 mois. Vous ciblez précisément les profils à reconquérir avec l'offre la plus pertinente.",
    },
    {
      step: "03",
      title: "Lancez une campagne WhatsApp ciblée",
      desc: "Rédigez votre message ou utilisez l'IA. Sélectionnez votre segment, validez et envoyez. Chaque client reçoit une offre personnalisée directement sur son WhatsApp.",
    },
  ],
  testimonial: {
    quote:
      "Baobab Loyalty nous a permis de recontacter des clients perdus depuis 9 mois. La campagne de réactivation a généré 12 réservations en une semaine. Pour notre hôtel à Douala, c'est un vrai changement de stratégie.",
    author: "Jean-Paul N.",
    role: "Directeur d'exploitation",
    hotel: "Hôtel Le Wouri",
    city: "Douala",
    initials: "JN",
  },
  pricingTitle: "Tarifs adaptés aux hôtels camerounais",
  pricingSubtitle: "Prix en FCFA, sans engagement. Résiliable à tout moment.",
  plans: [
    {
      name: "Essentiel",
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
      name: "Croissance",
      price: "69 000 FCFA",
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
      price: "189 000 FCFA",
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
  ctaTitle: "Prêt à fidéliser vos clients à Douala ou Yaoundé ?",
  ctaSubtitle:
    "Rejoignez les hôteliers camerounais qui augmentent leurs réservations directes avec Baobab Loyalty. Opérationnel en 10 minutes, sans carte bancaire.",
  ctaButton: "Essayer gratuitement",
  relatedBlog: {
    slug: "crm-hotelier-afrique-solutions",
    title:
      "CRM hôtelier en Afrique : pourquoi les solutions classiques ne marchent pas (et quoi faire)",
    readingTime: 8,
  },
};

export default function CamerounPage() {
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
