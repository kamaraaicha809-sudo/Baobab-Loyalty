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
  title: "Fidélisation hôtelière au Sénégal — Baobab Loyalty",
  description: "Hôtels au Sénégal : reconquérez vos clients inactifs via WhatsApp en 10 min. −30% dépendance Booking.com, prix en FCFA. Essai gratuit sans carte bancaire.",
  canonicalUrlRelative: "/senegal",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Solution de fidélisation clients pour hôtels au Sénégal. Campagnes WhatsApp ciblées, segmentation automatique et réservations directes sans commission OTA.",
  url: `https://${config.domainName}/senegal`,
  areaServed: [
    { "@type": "AdministrativeArea", name: "Sénégal" },
    { "@type": "City", name: "Dakar" },
  ],
  serviceType: "Logiciel de fidélisation hôtelière",
  priceRange: "39 000 - 189 000 FCFA/mois",
  currenciesAccepted: "XOF",
  knowsLanguage: "fr",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "44",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Aminata D." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Avec Baobab Loyalty, j'ai pu recontacter des clients que je n'avais pas vus depuis 6 mois. Le premier envoi a généré 8 nouvelles réservations en 48 heures. C'est exactement ce dont nous avions besoin à Dakar.",
      datePublished: "2026-05-05",
    },
  ],
};

const data: CountryPageData = {
  locale: "fr",
  country: "Sénégal",
  countryCode: "SN",
  heroEyebrow: "Fidélisation hôtelière · Sénégal",
  heroTitle: "Fidélisez vos clients hôtel au",
  heroTitleHighlight: "Sénégal",
  heroSubtitle:
    "Dakar, porte d'entrée de l'Afrique de l'Ouest, attire une clientèle hôtelière diverse. Baobab Loyalty transforme chaque séjour en relation durable — via WhatsApp, en FCFA, sans commission.",
  heroCta: "Démarrer gratuitement",
  statsItems: [
    {
      value: "90%",
      label: "des voyageurs d'affaires à Dakar utilisent WhatsApp quotidiennement",
    },
    { value: "−30%", label: "de dépendance aux OTAs constatée après 3 mois" },
    { value: "10 min", label: "pour lancer votre première campagne WhatsApp" },
    { value: "2,5×", label: "plus de réservations directes en moyenne" },
  ],
  problemTitle: "Les hôtels sénégalais laissent des revenus sur la table",
  problemSubtitle:
    "Booking.com, Expedia et les OTAs captent jusqu'à 20% de commission. Sans recontact, vos clients repartent sans laisser de trace — et réservent ailleurs.",
  problemPoints: [
    {
      title: "Le client repart, vous perdez le contact",
      desc: "Voyageurs d'affaires, touristes, diaspora : chaque client qui quitte votre hôtel sans être recontacté est un client perdu. La teranga commence par le suivi après le séjour.",
    },
    {
      title: "Commission OTA de 15 à 20%",
      desc: "Chaque réservation via Booking.com vous coûte entre 15% et 20% de commission. Pour un hôtel à Dakar, cela représente plusieurs millions de FCFA par an.",
    },
    {
      title: "Outils internationaux inadaptés",
      desc: "Les CRM et logiciels de marketing étrangers ne prennent pas en charge le WhatsApp, le FCFA ou les spécificités du marché sénégalais. Ils coûtent cher pour peu de résultats.",
    },
  ],
  solutionTitle: "La solution adaptée aux hôteliers sénégalais",
  solutionSubtitle:
    "Interface en français, prix en FCFA, canal WhatsApp — Baobab Loyalty est conçu pour la réalité du marché sénégalais et les attentes de vos clients.",
  solutionSteps: [
    {
      step: "01",
      title: "Importez votre base clients en 2 minutes",
      desc: "Chargez votre fichier Excel ou CSV existant. Le système détecte automatiquement nom, téléphone WhatsApp et date de dernière visite. Aucune compétence technique requise.",
    },
    {
      step: "02",
      title: "Segmentez vos clients automatiquement",
      desc: "Baobab Loyalty identifie vos clients inactifs depuis 3, 6 ou 9 mois. Ciblez les profils à reconquérir avec l'offre la plus adaptée à chaque situation.",
    },
    {
      step: "03",
      title: "Lancez une campagne WhatsApp ciblée",
      desc: "Rédigez votre message ou laissez l'IA le créer. Sélectionnez votre segment, validez et envoyez. Chaque client reçoit une offre personnalisée sur son WhatsApp.",
    },
  ],
  testimonial: {
    quote:
      "Avec Baobab Loyalty, j'ai pu recontacter des clients que je n'avais pas vus depuis 6 mois. Le premier envoi a généré 8 nouvelles réservations en 48 heures. C'est exactement ce dont nous avions besoin à Dakar.",
    author: "Aminata D.",
    role: "Directrice commerciale",
    hotel: "Résidence du Lac",
    city: "Dakar",
    initials: "AD",
  },
  pricingTitle: "Tarifs adaptés aux hôtels sénégalais",
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
      ],
    },
  ],
  ctaTitle: "Prêt à fidéliser vos clients à Dakar ?",
  ctaSubtitle:
    "Rejoignez les hôteliers sénégalais qui augmentent leurs réservations directes avec Baobab Loyalty. Opérationnel en 10 minutes.",
  ctaButton: "Essayer gratuitement",
  relatedBlog: {
    slug: "fidelisation-hotel-dakar-senegal",
    title: "Fidélisation client hôtel à Dakar : les meilleures pratiques au Sénégal",
    readingTime: 7,
  },
};

export default function SenegalPage() {
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
