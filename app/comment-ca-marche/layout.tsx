import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Comment ça marche — 5 étapes pour fidéliser vos clients | Baobab Loyalty",
  description:
    "Créez votre compte, importez vos clients, segmentez et lancez votre première campagne WhatsApp en moins de 10 minutes. Guide complet pour les hôteliers d'Afrique.",
  keywords: [
    "comment fidéliser clients hôtel WhatsApp",
    "guide campagne WhatsApp hôtel Afrique",
    "tutoriel fidélisation hôtelier",
    "mise en place logiciel hôtel Afrique",
    "démarrer Baobab Loyalty hôtel",
  ],
  alternates: { canonical: `/comment-ca-marche` },
  openGraph: {
    title: "Comment ça marche — 5 étapes pour fidéliser vos clients | Baobab Loyalty",
    description:
      "De l'import CSV à la première campagne WhatsApp : guide pas-à-pas pour les hôteliers d'Afrique.",
    url: `https://${config.domainName}/comment-ca-marche`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
