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
  title: "Hotel Loyalty Software for Ghana — Baobab Loyalty",
  description: "Accra hotels: 3× more direct bookings with targeted WhatsApp campaigns. Zero OTA commission, AI-generated messages. Get started in 10 minutes. Free trial.",
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
  priceRange: "GHS 299 - GHS 699/month",
  currenciesAccepted: "GHS",
  knowsLanguage: "en",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "24",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Kwame O." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Before Baobab Loyalty, we had no way to reconnect with past guests. Now I launch a campaign in 10 minutes and see bookings come in the same day. In 2 months, we recovered over 20 returning guests.",
      datePublished: "2026-05-05",
    },
  ],
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
    {
      value: "87%",
      label: "of business travelers in Accra use WhatsApp every day",
    },
    { value: "−35%", label: "OTA dependency after 3 months of use" },
    { value: "10 min", label: "to launch your first WhatsApp campaign" },
    { value: "3×", label: "more direct bookings on average" },
  ],
  problemTitle: "Ghanaian hotels are losing revenue every month",
  problemSubtitle:
    "Booking.com, Expedia and other OTAs charge 15 to 20% commission on every reservation. Without a guest retention tool, your clients forget you after checkout.",
  problemPoints: [
    {
      title: "Guests leave and never come back",
      desc: "Your guest had a great stay in Accra. But without follow-up, they will book somewhere else next time. 70% of hotel guests don't return without proactive re-engagement.",
    },
    {
      title: "15–20% OTA commission on every booking",
      desc: "Every reservation through Booking.com or Expedia costs you 15–20%. For a hotel in Accra, that adds up to thousands of cedis lost every year to foreign platforms.",
    },
    {
      title: "No tools built for the Ghanaian market",
      desc: "International CRMs are expensive, complex, and designed for Europe. They don't support WhatsApp as a primary channel, nor GHS pricing or local market realities.",
    },
  ],
  solutionTitle: "The guest loyalty platform built for Ghanaian hotels",
  solutionSubtitle:
    "WhatsApp-first, English and French support, GHS pricing — Baobab Loyalty is designed for the West African hospitality market.",
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
  testimonial: {
    quote:
      "Before Baobab Loyalty, we had no way to reconnect with past guests. Now I launch a campaign in 10 minutes and see bookings come in the same day. In 2 months, we recovered over 20 returning guests.",
    author: "Kwame O.",
    role: "General Manager",
    hotel: "The Osu Boutique Hotel",
    city: "Accra",
    initials: "KO",
  },
  pricingTitle: "Pricing built for Ghanaian hotels",
  pricingSubtitle: "Billed in GHS. No long-term commitment. Cancel anytime.",
  plans: [
    {
      name: "Essential",
      price: "GHS 299",
      priceDetail: "/ month",
      rooms: "Up to 30 rooms",
      highlighted: false,
      features: [
        "Unlimited CSV import",
        "Auto-segmentation (3, 6, 9 months)",
        "Targeted WhatsApp campaigns",
        "Bookings dashboard",
        "Email support in English",
      ],
    },
    {
      name: "Growth",
      price: "GHS 499",
      priceDetail: "/ month",
      rooms: "Up to 100 rooms",
      highlighted: true,
      features: [
        "Everything in Essential",
        "AI message generation",
        "Real-time booking tracking",
        "Advanced campaign analytics",
        "Priority support",
      ],
    },
    {
      name: "Premium",
      price: "GHS 699",
      priceDetail: "/ month",
      rooms: "Unlimited rooms",
      highlighted: false,
      features: [
        "Everything in Growth",
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
      <Suspense>
        <Header />
      </Suspense>
      <CountryLandingPage data={data} />
      <Footer />
    </>
  );
}
