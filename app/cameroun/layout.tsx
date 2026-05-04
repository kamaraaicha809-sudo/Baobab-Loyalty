import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fidélisation clients hôtel au Cameroun — Baobab Loyalty",
  description:
    "Fidélisez vos clients hôtel à Douala, Yaoundé et dans tout le Cameroun avec Baobab Loyalty. Campagnes WhatsApp ciblées, segmentation automatique, réservations directes.",
  keywords: [
    "fidélisation hôtel Cameroun",
    "marketing hôtel Douala",
    "WhatsApp marketing hôtel Douala",
    "logiciel hôtelier Cameroun",
    "CRM hôtel Yaoundé FCFA",
    "réservations directes hôtel Douala",
  ],
  alternates: { canonical: `/cameroun` },
  openGraph: {
    title: "Fidélisation clients hôtel au Cameroun — Baobab Loyalty",
    description:
      "Fidélisez vos clients hôtel à Douala et Yaoundé avec Baobab Loyalty. Campagnes WhatsApp, segmentation automatique et réservations directes.",
    url: `https://${config.domainName}/cameroun`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
