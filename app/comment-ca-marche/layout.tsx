import type { Metadata } from "next";
import config from "@/config";

const isEurope = config.region === "europe";

export const metadata: Metadata = {
  title: `Comment ça marche — 5 étapes pour fidéliser vos clients | ${config.appName}`,
  description: isEurope
    ? "Créez votre compte, importez vos clients, segmentez et lancez votre première campagne WhatsApp en moins de 10 minutes. Guide complet pour les hôteliers."
    : "Créez votre compte, importez vos clients, segmentez et lancez votre première campagne WhatsApp en moins de 10 minutes. Guide complet pour les hôteliers d'Afrique.",
  keywords: isEurope
    ? [
        "comment fidéliser clients hôtel WhatsApp",
        "guide campagne WhatsApp hôtel",
        "tutoriel fidélisation hôtelier",
        "mise en place logiciel hôtel",
        `démarrer ${config.appName} hôtel`,
      ]
    : [
        "comment fidéliser clients hôtel WhatsApp",
        "guide campagne WhatsApp hôtel Afrique",
        "tutoriel fidélisation hôtelier",
        "mise en place logiciel hôtel Afrique",
        "démarrer Baobab Loyalty hôtel",
      ],
  alternates: { canonical: `/comment-ca-marche` },
  openGraph: {
    title: `Comment ça marche — 5 étapes pour fidéliser vos clients | ${config.appName}`,
    description: isEurope
      ? "De l'import CSV à la première campagne WhatsApp : guide pas-à-pas pour les hôteliers."
      : "De l'import CSV à la première campagne WhatsApp : guide pas-à-pas pour les hôteliers d'Afrique.",
    url: `https://${config.domainName}/comment-ca-marche`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
