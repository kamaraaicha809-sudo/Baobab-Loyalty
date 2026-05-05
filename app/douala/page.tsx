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
    "Solution de fidélisation clients pour hôtels à Douala. Campagnes WhatsApp ciblées, segmentation automatique et réservations directes sans commission OTA.",
  url: `https://${config.domainName}/douala`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 4.0511,
    longitude: 9.7679,
  },
  areaServed: [
    { "@type": "City", name: "Douala" },
    { "@type": "AdministrativeArea", name: "Cameroun" },
  ],
  serviceType: "Logiciel de fidélisation hôtelière",
  priceRange: "29 000 - 69 000 FCFA/mois",
  currenciesAccepted: "XOF",
  knowsLanguage: "fr",
};

const data: CountryPageData = {
  locale: "fr",
  country: "Cameroun",
  countryCode: "CM",
  heroEyebrow: "Fidélisation hôtelière · Douala",
  heroTitle: "Fidélisez vos clients hôtel à",
  heroTitleHighlight: "Douala",
  heroSubtitle:
    "Douala est la capitale économique du Cameroun et le premier hub d'affaires de l'Afrique centrale. Baobab Loyalty transforme chaque séjour en réservation directe — via WhatsApp, en FCFA, sans aucune commission.",
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
  problemTitle: "Les hôtels doualais perdent des revenus chaque mois",
  problemSubtitle:
    "Entre les OTAs qui captent 15 à 20% de commission et l'absence d'outils adaptés, les hôtels d'Akwa, de Bonanjo et de Bonapriso manquent des opportunités de fidélisation directe.",
  problemPoints: [
    {
      title: "Aucun suivi après le check-out",
      desc: "Vos clients d'affaires séjournent à Akwa ou Bonanjo, repartent satisfaits — mais sans recontact, ils réservent un concurrent la prochaine fois. 70% des clients ne reviennent pas sans relance proactive.",
    },
    {
      title: "Commission OTA de 15 à 20%",
      desc: "Booking.com et Expedia prélèvent entre 15% et 20% sur chaque réservation. À Douala, avec une clientèle d'affaires à fort pouvoir d'achat, ces commissions représentent des millions de FCFA perdus chaque année.",
    },
    {
      title: "Outils inadaptés au marché doualais",
      desc: "Les logiciels marketing internationaux ignorent WhatsApp comme canal principal, ne gèrent pas le FCFA et sont conçus pour des marchés européens. Ils ne correspondent pas aux réalités des hôtels de Douala.",
    },
  ],
  solutionTitle: "La solution conçue pour les hôteliers doualais",
  solutionSubtitle:
    "Interface en français, prix en FCFA, envoi via WhatsApp — Baobab Loyalty répond aux besoins réels des hôtels de Douala, d'Akwa à Bonapriso.",
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
      "On avait une base de 300 clients mais aucun moyen de les recontacter. Baobab Loyalty nous a permis de lancer une campagne de réactivation en 15 minutes. Résultat : 22 réservations directes en 3 jours, sans passer par Booking.",
    author: "Sandrine M.",
    role: "Responsable commerciale",
    hotel: "Hôtel Akwa Palace Suites",
    city: "Douala",
    initials: "SM",
  },
  pricingTitle: "Tarifs adaptés aux hôtels de Douala",
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
  ctaTitle: "Prêt à fidéliser vos clients à Douala ?",
  ctaSubtitle:
    "Rejoignez les hôteliers doualais qui augmentent leurs réservations directes avec Baobab Loyalty. Opérationnel en 10 minutes, sans carte bancaire.",
  ctaButton: "Essayer gratuitement",
  relatedBlog: {
    slug: "crm-hotelier-afrique-solutions",
    title:
      "CRM hôtelier en Afrique : pourquoi les solutions classiques ne marchent pas (et quoi faire)",
    readingTime: 8,
  },
};

export default function DoualaPage() {
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
