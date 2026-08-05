// app/layout.tsx — Metadata globale appliquée à toutes les pages
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://baobabloyalty.com"),

  // Template appliqué à tous les title des pages enfant.
  // Une page enfant qui définit `title: "Tarifs"` deviendra "Tarifs | Baobab Loyalty"
  title: {
    default: "Baobab Loyalty — Programme de fidélité B2B simple et puissant",
    template: "%s | Baobab Loyalty",
  },
  description:
    "Lancez votre programme de fidélité en 7 jours. Cartes digitales, points, récompenses, analytics. +250 enseignes françaises nous font confiance.",

  applicationName: "Baobab Loyalty",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  // Icônes
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

  // Open Graph par défaut
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Baobab Loyalty",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Baobab Loyalty — Programme de fidélité B2B",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@baobabloyalty",
    creator: "@baobabloyalty",
  },

  // Verifications (à remplir avec les codes des outils respectifs)
  verification: {
    google: "TON-CODE-GOOGLE-SEARCH-CONSOLE",
    // bing: "TON-CODE-BING",
    // other: { me: ["..."] },
  },

  // Robots
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
