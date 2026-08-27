import { Suspense } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import { getSEOTags, renderBreadcrumbSchema } from "@/libs/seo";
import {
  CountryLandingPage,
  type CountryPageData,
} from "@/components/landing/CountryLandingPage";

export const metadata = getSEOTags({
  title: "Hotel Loyalty Software for Ghana — Baobab Loyalty",
  description: "Accra hotels: win back inactive guests with targeted WhatsApp campaigns. Zero OTA commission, AI-generated messages. Get started in 10 minutes. Free trial.",
  canonicalUrlRelative: "/ghana",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Hotel loyalty software for Ghana. Targeted WhatsApp campaigns, automatic segmentation and direct bookings without OTA commission.",
  url: `https://${config.domainName}/ghana`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 5.56,
    longitude: -0.2057,
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Ghana" },
    { "@type": "City", name: "Accra" },
  ],
  serviceType: "Hotel loyalty software",
  priceRange: "39,000 - 189,000 FCFA/month",
  currenciesAccepted: "XOF",
  knowsLanguage: "en",
};

const data: CountryPageData = {
  locale: "en",
  country: "Ghana",
  countryCode: "GH",
  heroEyebrow: "Hotel Guest Loyalty · Ghana",
  heroTitle: "Grow your hotel's direct bookings in",
  heroTitleHighlight: "Ghana",
  heroSubtitle:
    "Accra is West Africa's fastest-growing business travel hub. Baobab Loyalty helps Ghanaian hotels turn every stay into a direct repeat booking — via WhatsApp, with no OTA commission.",
  heroCta: "Start for free",
  statsItems: [
    { value: "0%", label: "commission on your direct bookings" },
    { value: "10 min", label: "to launch your first WhatsApp campaign" },
    { value: "FCFA", label: "billed in West African CFA francs (XOF)" },
    { value: "2 bookings", label: "guaranteed or next month is free" },
  ],
  problemTitle: "Ghanaian hotels are losing revenue every month",
  problemSubtitle:
    "Booking.com, Expedia and other OTAs charge 15 to 20% commission on every reservation. Without a guest retention tool, your clients forget you after checkout.",
  problemPoints: [
    {
      title: "Guests leave and never come back",
      desc: "Your guest had a great stay in Accra. But without follow-up, they are far more likely to book somewhere else next time.",
    },
    {
      title: "15–20% OTA commission on every booking",
      desc: "Every reservation through Booking.com or Expedia costs you 15–20%. For a hotel in Accra, that adds up to thousands of cedis lost every year to foreign platforms.",
    },
    {
      title: "No tools built for the Ghanaian market",
      desc: "International CRMs are expensive, complex, and designed for Europe. They don't support WhatsApp as a primary channel, nor West African market realities.",
    },
  ],
  solutionTitle: "The guest loyalty platform built for Ghanaian hotels",
  solutionSubtitle:
    "WhatsApp-first, English and French support — Baobab Loyalty is designed for the West African hospitality market.",
  solutionSteps: [
    {
      step: "01",
      title: "Import your guest database in 2 minutes",
      desc: "Upload your Excel or CSV file. The system automatically detects columns: name, WhatsApp number, last visit date. No technical skills required.",
    },
    {
      step: "02",
      title: "Automatically segment your guests",
      desc: "Baobab Loyalty identifies guests inactive for 3, 6 or 9 months. Target the right profiles with the right offer at the right time.",
    },
    {
      step: "03",
      title: "Launch a targeted WhatsApp campaign",
      desc: "Write your message or let the AI draft it. Select your segment, confirm and send. Each guest receives a personalized offer directly on WhatsApp.",
    },
  ],
  guarantee: {
    title: "Why we can afford to guarantee results",
    text: "Baobab Loyalty is still new in Ghana — we don't have hundreds of reviews to show you. So instead, we prove it differently: if you don't recover at least 2 extra direct bookings in your first full month, we give you the next month free, provided your guest database was correctly imported and at least one campaign was sent.",
    points: ["No commitment", "Your data stays 100% yours", "30-day personal support included"],
  },
  pricingTitle: "Pricing built for West African hotels",
  pricingSubtitle: "Billed in FCFA (XOF), the currency used across our payment platform. No long-term commitment. Cancel anytime.",
  plans: [
    {
      name: "Starter",
      price: "39,000 FCFA",
      priceDetail: "/ month",
      rooms: "Up to 30 rooms",
      highlighted: false,
      features: [
        "Unlimited CSV import",
        "Auto-segmentation (3, 6, 9 months)",
        "Targeted WhatsApp campaigns",
        "Bookings dashboard",
        "Email support",
      ],
    },
    {
      name: "Pro",
      price: "69,000 FCFA",
      priceDetail: "/ month",
      rooms: "Up to 60 rooms",
      highlighted: true,
      features: [
        "Everything in Starter",
        "AI message generation",
        "Real-time booking tracking",
        "Advanced campaign analytics",
        "Priority support",
      ],
    },
    {
      name: "Premium",
      price: "189,000 FCFA",
      priceDetail: "/ month",
      rooms: "Unlimited rooms",
      highlighted: false,
      features: [
        "Everything in Pro",
        "Dedicated WhatsApp API",
        "Multi-user access",
        "Personalized onboarding",
        "Dedicated account manager",
      ],
    },
  ],
  ctaTitle: "Ready to grow your Accra hotel's direct bookings?",
  ctaSubtitle:
    "Join Ghanaian hoteliers who are increasing direct reservations with Baobab Loyalty. Up and running in 10 minutes, no credit card required.",
  ctaButton: "Start for free",
  relatedBlog: {
    slug: "hotel-loyalty-program-ghana-accra",
    title: "Hotel Guest Loyalty in Ghana: How Accra Hotels Can Win Back Direct Bookings",
    readingTime: 7,
  },
};

export default function GhanaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {renderBreadcrumbSchema([
        { name: "Home", urlRelative: "/" },
        { name: "Ghana", urlRelative: "/ghana" },
      ])}
      <Suspense>
        <Header />
      </Suspense>
      <CountryLandingPage data={data} />
      <Footer />
    </>
  );
}
