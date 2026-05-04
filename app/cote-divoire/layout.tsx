import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fidélisation clients hôtel en Côte d'Ivoire — Baobab Loyalty",
  description:
    "Fidélisez vos clients hôtel à Abidjan et en Côte d'Ivoire avec Baobab Loyalty. Campagnes WhatsApp ciblées, segmentation automatique, réservations directes sans commission OTA.",
  keywords: [
    "fidélisation hôtel Côte d'Ivoire",
    "marketing hôtel Abidjan",
    "WhatsApp marketing hôtel Abidjan",
    "logiciel hôtelier Côte d'Ivoire",
    "CRM hôtel Abidjan FCFA",
    "réservations directes hôtel Abidjan",
  ],
  alternates: { canonical: `/cote-divoire` },
  openGraph: {
    title: "Fidélisation clients hôtel en Côte d'Ivoire — Baobab Loyalty",
    description:
      "Fidélisez vos clients hôtel à Abidjan avec Baobab Loyalty. Campagnes WhatsApp, segmentation automatique et réservations directes.",
    url: `https://${config.domainName}/cote-divoire`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
