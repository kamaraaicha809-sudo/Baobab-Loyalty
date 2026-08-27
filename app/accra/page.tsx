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
  title: "Hotel Loyalty Software for Accra — Baobab Loyalty",
  description:
    "Accra hotels: win back past guests with targeted WhatsApp campaigns. Zero OTA commission, AI-generated messages. Start free in 10 minutes.",
  canonicalUrlRelative: "/accra",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Baobab Loyalty",
  description:
    "Hotel guest loyalty software for Accra. Targeted WhatsApp campaigns, automatic segmentation, and direct bookings without OTA commission.",
  url: `https://${config.domainName}/accra`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 5.6037,
    longitude: -0.187,
  },
  areaServed: [
    { "@type": "City", name: "Accra" },
    { "@type": "AdministrativeArea", name: "Greater Accra" },
    { "@type": "Country", name: "Ghana" },
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
  heroEyebrow: "Hotel Guest Loyalty · Accra",
  heroTitle: "Win back past guests for your",
  heroTitleHighlight: "Accra hotel",
  heroSubtitle:
    "Accra's hospitality market is booming — but most hotels still lose guests after checkout. Baobab Loyalty helps Accra hotels re-engage past guests via WhatsApp and convert them into repeat direct bookings.",
  heroCta: "Start for free",
  statsItems: [
    { value: "0%", label: "commission on your direct bookings" },
    { value: "10 min", label: "to launch your first WhatsApp campaign" },
    { value: "FCFA", label: "billed in West African CFA francs (XOF)" },
    { value: "2 bookings", label: "guaranteed or next month is free" },
  ],
  problemTitle: "Accra hotels are leaving money on the table",
  problemSubtitle:
    "Every month, Accra hotels pay 15–20% commission to OTAs and watch past guests book competitors — simply because there was no system to bring them back.",
  problemPoints: [
    {
      title: "Guests check out and disappear",
      desc: "Your guest loved their stay in East Legon or Osu. But without a follow-up system, they book through Booking.com next time — and you pay 15–20% commission on a guest you already had.",
    },
    {
      title: "OTA commissions eat your margins",
      desc: "Booking.com and Expedia take 15–20% on every reservation. For an Accra hotel with nightly rates of GHS 400–1200, that's thousands of cedis lost every month to platforms that own your guests.",
    },
    {
      title: "No tools built for the Ghana market",
      desc: "International CRMs are built for European hotels. They don't support WhatsApp as a primary channel and cost far more than they're worth for the Ghanaian hospitality market.",
    },
  ],
  solutionTitle: "The direct booking platform built for Accra hotels",
  solutionSubtitle:
    "English-first, WhatsApp-native — Baobab Loyalty is designed around how Accra hotels actually operate.",
  solutionSteps: [
    {
      step: "01",
      title: "Import your guest list in 2 minutes",
      desc: "Upload your Excel or CSV file. The system automatically detects columns: name, WhatsApp number, last visit date. No technical knowledge required.",
    },
    {
      step: "02",
      title: "Automatically identify guests to re-engage",
      desc: "Baobab Loyalty segments guests who haven't returned in 3, 6, or 9 months. Target the right profile with the right offer — at exactly the right moment.",
    },
    {
      step: "03",
      title: "Send a WhatsApp campaign in under 10 minutes",
      desc: "Write your message or let the AI draft it. Choose your segment, confirm and send. Each guest receives a personalized offer directly on WhatsApp — with a link to book directly.",
    },
  ],
  guarantee: {
    title: "Why we can afford to guarantee results",
    text: "Baobab Loyalty is still new in Accra — we don't have hundreds of reviews to show you. So instead, we prove it differently: if you don't recover at least 2 extra direct bookings in your first full month, we give you the next month free, provided your guest database was correctly imported and at least one campaign was sent.",
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
  ctaTitle: "Ready to grow direct bookings for your Accra hotel?",
  ctaSubtitle:
    "Join Ghanaian hoteliers who are cutting OTA dependency with Baobab Loyalty. Up and running in 10 minutes, no credit card required.",
  ctaButton: "Start for free",
  relatedBlog: {
    slug: "hotel-loyalty-program-ghana-accra",
    title:
      "Hotel Guest Loyalty in Ghana: How Accra Hotels Can Win Back Direct Bookings",
    readingTime: 7,
  },
};

export default function AccraPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {renderBreadcrumbSchema([
        { name: "Home", urlRelative: "/" },
        { name: "Accra", urlRelative: "/accra" },
      ])}
      <Suspense>
        <Header />
      </Suspense>
      <CountryLandingPage data={data} />
      <Footer />
    </>
  );
}
