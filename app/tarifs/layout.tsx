import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Tarifs — Plans FCFA pour hôtels en Afrique | Baobab Loyalty",
  description:
    "Essentiel 39 000 · Croissance 69 000 · Premium 189 000 FCFA/mois. Sans engagement. Résultats dès la 1ère campagne WhatsApp — résiliable à tout moment.",
  keywords: [
    "tarif logiciel hôtel Afrique FCFA",
    "prix CRM hôtel Côte d'Ivoire",
    "abonnement fidélisation hôtel Dakar",
    "logiciel hôtelier pas cher Afrique",
    "plan WhatsApp marketing hôtel",
  ],
  alternates: { canonical: `/tarifs` },
  openGraph: {
    title: "Tarifs — Plans FCFA pour hôtels en Afrique | Baobab Loyalty",
    description:
      "Plans Essentiel, Croissance et Premium en FCFA. Sans engagement, résiliable à tout moment.",
    url: `https://${config.domainName}/tarifs`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
