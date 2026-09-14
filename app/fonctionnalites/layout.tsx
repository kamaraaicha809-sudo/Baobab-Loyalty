import type { Metadata } from "next";
import config from "@/config";

const isEurope = config.region === "europe";

export const metadata: Metadata = {
  title: `Fonctionnalités — Segmentation, WhatsApp, IA | ${config.appName}`,
  description: isEurope
    ? "Import CSV, segmentation auto par inactivité, campagnes WhatsApp + IA en 10 min. Tout ce qu'il faut pour reconquérir vos clients hôtel — sans compétence technique."
    : "Import CSV, segmentation auto par inactivité, campagnes WhatsApp + IA en 10 min. Tout ce qu'il faut pour reconquérir vos clients hôtel en Afrique — sans compétence technique.",
  keywords: isEurope
    ? [
        "logiciel fidélisation hôtel",
        "segmentation clients hôtel",
        "campagne WhatsApp hôtel",
        "CRM hôtel WhatsApp",
        "import CSV clients hôtel",
        "IA message marketing hôtel",
      ]
    : [
        "logiciel fidélisation hôtel Afrique",
        "segmentation clients hôtel",
        "campagne WhatsApp hôtel",
        "CRM hôtel WhatsApp FCFA",
        "import CSV clients hôtel",
        "IA message marketing hôtel",
      ],
  alternates: { canonical: `/fonctionnalites` },
  openGraph: {
    title: `Fonctionnalités — Segmentation, WhatsApp, IA | ${config.appName}`,
    description: isEurope
      ? "Import CSV, segmentation automatique, campagnes WhatsApp, IA de messages — toutes les fonctionnalités pour fidéliser vos clients hôtel."
      : "Import CSV, segmentation automatique, campagnes WhatsApp, IA de messages — toutes les fonctionnalités pour fidéliser vos clients hôtel en Afrique.",
    url: `https://${config.domainName}/fonctionnalites`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
