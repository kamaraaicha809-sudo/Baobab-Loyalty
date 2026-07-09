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
  title: "Fidélisation hôtelière à Dakar — Baobab Loyalty",
  description: "Hôtels à Dakar : 8 réservations en 48h grâce aux campagnes WhatsApp ciblées. Zéro commission OTA, prix en FCFA. Opérationnel en 10 min. Essai gratuit.",
  canonicalUrlRelative: "/dakar",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Solution de fidélisation clients pour hôtels à Dakar. Campagnes WhatsApp ciblées, segmentation automatique et réservations directes sans commission OTA.",
  url: `https://${config.domainName}/dakar`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 14.7167,
    longitude: -17.4677,
  },
  areaServed: [
    { "@type": "City", name: "Dakar" },
    { "@type": "AdministrativeArea", name: "Sénégal" },
  ],
  serviceType: "Logiciel de fidélisation hôtelière",
  priceRange: "39 000 - 189 000 FCFA/mois",
  currenciesAccepted: "XOF",
  knowsLanguage: "fr",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "38",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Moussa D." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Grâce à Baobab Loyalty, on a relancé des clients inactifs depuis 6 mois avec une offre de weekend. En une semaine, 18 réservations directes supplémentaires. C'est le meilleur investissement marketing qu'on ait fait.",
      datePublished: "2026-05-05",
    },
  ],
};

const data: CountryPageData = {
  locale: "fr",
  country: "Sénégal",
  countryCode: "SN",
  heroEyebrow: "Fidélisation hôtelière · Dakar",
  heroTitle: "Fidélisez vos clients hôtel à",
  heroTitleHighlight: "Dakar",
  heroSubtitle:
    "Dakar est le hub économique et touristique du Sénégal, avec une clientèle d'affaires en forte croissance. Baobab Loyalty transforme chaque séjour en réservation directe — via WhatsApp, en FCFA, sans aucune commission.",
  heroCta: "Démarrer gratuitement",
  statsItems: [
    {
      value: "89%",
      label: "des voyageurs d'affaires à Dakar utilisent WhatsApp quotidiennement",
    },
    { value: "−35%", label: "de commissions OTA économisées après 3 mois" },
    { value: "10 min", label: "pour lancer votre première campagne WhatsApp" },
    { value: "3×", label: "plus de réservations directes en moyenne" },
  ],
  problemTitle: "Les hôtels dakarois perdent des revenus chaque mois",
  problemSubtitle:
    "Entre les OTAs qui captent 15 à 20% de commission et l'absence d'outils adaptés, les hôtels du Plateau, des Almadies et de Point E manquent des opportunités de fidélisation directe.",
  problemPoints: [
    {
      title: "Aucun suivi après le check-out",
      desc: "Votre client séjourne dans votre hôtel, repart satisfait — mais sans recontact, il réserve un concurrent la prochaine fois. 70% des clients hôteliers ne reviennent pas sans relance proactive.",
    },
    {
      title: "Commission OTA de 15 à 20%",
      desc: "Booking.com et Expedia prélèvent entre 15% et 20% sur chaque réservation. À Dakar, avec l'essor du tourisme d'affaires, ces commissions représentent des millions de FCFA perdus chaque année.",
    },
    {
      title: "Outils inadaptés au marché dakarois",
      desc: "Les logiciels marketing internationaux ignorent WhatsApp comme canal principal, ne gèrent pas le FCFA et sont conçus pour des marchés européens. Ils ne correspondent pas aux réalités des hôtels de Dakar.",
    },
  ],
  solutionTitle: "La solution conçue pour les hôteliers dakarois",
  solutionSubtitle:
    "Interface en français, prix en FCFA, envoi via WhatsApp — Baobab Loyalty répond aux besoins réels des hôtels de Dakar, du Plateau aux Almadies en passant par les Mamelles.",
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
      "Grâce à Baobab Loyalty, on a relancé des clients inactifs depuis 6 mois avec une offre de weekend. En une semaine, 18 réservations directes supplémentaires. C'est le meilleur investissement marketing qu'on ait fait.",
    author: "Moussa D.",
    role: "Directeur d'exploitation",
    hotel: "Le Lagon Boutique Hotel",
    city: "Dakar",
    initials: "MD",
  },
  pricingTitle: "Tarifs adaptés aux hôtels dakarois",
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
  ctaTitle: "Prêt à fidéliser vos clients à Dakar ?",
  ctaSubtitle:
    "Rejoignez les hôteliers dakarois qui augmentent leurs réservations directes avec Baobab Loyalty. Opérationnel en 10 minutes, sans carte bancaire.",
  ctaButton: "Essayer gratuitement",
  relatedBlog: {
    slug: "fidelisation-hotel-dakar-senegal",
    title:
      "Fidélisation client hôtel à Dakar : les meilleures pratiques au Sénégal",
    readingTime: 7,
  },
};

export default function DakarPage() {
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
