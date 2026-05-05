import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fidélisation clients hôtel à Dakar — Baobab Loyalty",
  description:
    "Fidélisez vos clients hôtel à Dakar avec Baobab Loyalty. Campagnes WhatsApp ciblées, segmentation automatique, réservations directes au Plateau, aux Almadies et à Point E.",
  keywords: [
    "fidélisation hôtel Dakar",
    "marketing WhatsApp hôtel Dakar",
    "logiciel hôtelier Dakar FCFA",
    "réservations directes hôtel Dakar",
    "CRM hôtel Sénégal Dakar Almadies",
    "hôtel Dakar fidéliser clients",
    "campagne WhatsApp hôtel Sénégal",
  ],
  alternates: { canonical: `/dakar` },
  openGraph: {
    title: "Fidélisation clients hôtel à Dakar — Baobab Loyalty",
    description:
      "Fidélisez vos clients hôtel à Dakar avec Baobab Loyalty. Campagnes WhatsApp, segmentation automatique et réservations directes sans commission OTA.",
    url: `https://${config.domainName}/dakar`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
