import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fidélisation clients hôtel au Sénégal — Baobab Loyalty",
  description:
    "Hôtels Dakar : 3× plus de réservations directes, zéro commission Booking.com. Campagnes WhatsApp IA, segmentation auto. Démarrez en 10 min — essai gratuit.",
  keywords: [
    "fidélisation hôtel Sénégal",
    "marketing hôtel Dakar",
    "WhatsApp marketing hôtel Dakar",
    "logiciel hôtelier Sénégal",
    "CRM hôtel Dakar FCFA",
    "réservations directes hôtel Dakar",
  ],
  alternates: { canonical: `/senegal` },
  openGraph: {
    title: "Fidélisation clients hôtel au Sénégal — Baobab Loyalty",
    description:
      "Fidélisez vos clients hôtel à Dakar avec Baobab Loyalty. Campagnes WhatsApp, segmentation automatique et réservations directes.",
    url: `https://${config.domainName}/senegal`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
