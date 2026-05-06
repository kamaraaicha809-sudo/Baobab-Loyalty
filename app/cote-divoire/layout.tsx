import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Logiciel fidélisation hôtel Côte d'Ivoire — Baobab Loyalty",
  description:
    "Logiciel de fidélisation hôtel pour la Côte d'Ivoire : 3× plus de réservations directes, zéro commission Booking.com. WhatsApp IA, FCFA, opérationnel en 10 min.",
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
    title: "Logiciel fidélisation hôtel Côte d'Ivoire — Baobab Loyalty",
    description:
      "Logiciel de fidélisation hôtel pour la Côte d'Ivoire. Campagnes WhatsApp IA, segmentation automatique, réservations directes sans commission OTA.",
    url: `https://${config.domainName}/cote-divoire`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
