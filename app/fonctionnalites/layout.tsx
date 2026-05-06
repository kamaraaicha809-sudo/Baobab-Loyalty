import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fonctionnalités — Segmentation, WhatsApp, IA | Baobab Loyalty",
  description:
    "Import CSV, segmentation auto par inactivité, campagnes WhatsApp + IA en 10 min. Tout ce qu'il faut pour reconquérir vos clients hôtel en Afrique — sans compétence technique.",
  keywords: [
    "logiciel fidélisation hôtel Afrique",
    "segmentation clients hôtel",
    "campagne WhatsApp hôtel",
    "CRM hôtel WhatsApp FCFA",
    "import CSV clients hôtel",
    "IA message marketing hôtel",
  ],
  alternates: { canonical: `/fonctionnalites` },
  openGraph: {
    title: "Fonctionnalités — Segmentation, WhatsApp, IA | Baobab Loyalty",
    description:
      "Import CSV, segmentation automatique, campagnes WhatsApp, IA de messages — toutes les fonctionnalités pour fidéliser vos clients hôtel en Afrique.",
    url: `https://${config.domainName}/fonctionnalites`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
