import type { Metadata } from "next";
import config from "@/config";

// Page pays Afrique masquee pour l'Europe (voir app/abidjan/page.tsx) :
// pas de metadata Afrique-only pour une page qui 404 cote Europe.
export const metadata: Metadata = config.region === "europe" ? { robots: { index: false, follow: false } } : {
  title: "Fidélisation clients hôtel à Abidjan — Baobab Loyalty",
  description:
    "Fidélisez vos clients hôtel à Abidjan avec Baobab Loyalty. Campagnes WhatsApp ciblées, segmentation automatique, réservations directes au Plateau, Cocody et Zone 4.",
  keywords: [
    "fidélisation hôtel Abidjan",
    "marketing WhatsApp hôtel Abidjan",
    "logiciel hôtelier Abidjan FCFA",
    "réservations directes hôtel Abidjan",
    "CRM hôtel Plateau Cocody Abidjan",
    "hôtel Abidjan fidéliser clients",
    "campagne WhatsApp hôtel Côte d'Ivoire",
  ],
  alternates: { canonical: `/abidjan` },
  openGraph: {
    title: "Fidélisation clients hôtel à Abidjan — Baobab Loyalty",
    description:
      "Fidélisez vos clients hôtel à Abidjan avec Baobab Loyalty. Campagnes WhatsApp, segmentation automatique et réservations directes sans commission OTA.",
    url: `https://${config.domainName}/abidjan`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
