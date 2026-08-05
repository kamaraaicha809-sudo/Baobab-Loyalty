// app/(routes)/about/page.tsx — Exemple de Metadata statique pour une page Next.js App Router
import type { Metadata } from "next";

export const metadata: Metadata = {
  // === Essentiel ===
  title: "À propos de Baobab Loyalty — Notre mission",
  description:
    "Baobab Loyalty aide +250 enseignes françaises à fidéliser leurs clients depuis 2022. Découvrez notre équipe, notre vision et nos engagements.",

  // === Indexabilité ===
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://baobabloyalty.com/a-propos",
    languages: {
      "fr-FR": "https://baobabloyalty.com/a-propos",
      // "en-US": "https://baobabloyalty.com/en/about",
    },
  },

  // === Open Graph (Facebook, LinkedIn, WhatsApp, Slack) ===
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://baobabloyalty.com/a-propos",
    siteName: "Baobab Loyalty",
    title: "À propos de Baobab Loyalty",
    description:
      "Notre mission : rendre la fidélisation client accessible à toutes les enseignes, du commerce de quartier à la chaîne nationale.",
    images: [
      {
        url: "https://baobabloyalty.com/og/about.jpg",
        width: 1200,
        height: 630,
        alt: "L'équipe Baobab Loyalty",
      },
    ],
  },

  // === Twitter Card ===
  twitter: {
    card: "summary_large_image",
    site: "@baobabloyalty",
    creator: "@baobabloyalty",
    title: "À propos de Baobab Loyalty",
    description: "+250 enseignes nous font confiance pour leur fidélisation client.",
    images: ["https://baobabloyalty.com/og/about.jpg"],
  },

  // === Divers ===
  authors: [{ name: "Baobab Loyalty", url: "https://baobabloyalty.com" }],
  creator: "Baobab Loyalty",
  publisher: "Baobab Loyalty",
  category: "business",
  keywords: ["fidélisation client", "programme fidélité B2B", "loyalty France"],
};

export default function AboutPage() {
  return <main>{/* … */}</main>;
}
