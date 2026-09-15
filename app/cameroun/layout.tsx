import type { Metadata } from "next";
import config from "@/config";

// Page pays Afrique masquee pour l'Europe (voir app/cameroun/page.tsx) :
// pas de metadata Afrique-only pour une page qui 404 cote Europe.
export const metadata: Metadata = config.region === "europe" ? { robots: { index: false, follow: false } } : {
  title: "Fidélisation clients hôtel au Cameroun — Baobab Loyalty",
  description:
    "Hôtels Douala et Yaoundé : relancez vos clients inactifs via WhatsApp, zéro commission OTA. Segmentation automatique + WhatsApp IA en 10 min. Essai gratuit sans engagement.",
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
