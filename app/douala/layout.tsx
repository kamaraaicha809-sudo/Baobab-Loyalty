import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fidélisation clients hôtel à Douala — Baobab Loyalty",
  description:
    "Fidélisez vos clients hôtel à Douala avec Baobab Loyalty. Campagnes WhatsApp ciblées, segmentation automatique, réservations directes à Akwa, Bonanjo et Bonapriso.",
  keywords: [
    "fidélisation hôtel Douala",
    "marketing WhatsApp hôtel Douala",
    "logiciel hôtelier Douala FCFA",
    "réservations directes hôtel Douala",
    "CRM hôtel Cameroun Douala Akwa",
    "hôtel Douala fidéliser clients",
    "campagne WhatsApp hôtel Cameroun",
  ],
  alternates: { canonical: `/douala` },
  openGraph: {
    title: "Fidélisation clients hôtel à Douala — Baobab Loyalty",
    description:
      "Fidélisez vos clients hôtel à Douala avec Baobab Loyalty. Campagnes WhatsApp, segmentation automatique et réservations directes sans commission OTA.",
    url: `https://${config.domainName}/douala`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
