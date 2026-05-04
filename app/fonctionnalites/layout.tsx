import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Fonctionnalités — Segmentation, WhatsApp, IA | Baobab Loyalty",
  description:
    "Importez vos clients, segmentez automatiquement et lancez des campagnes WhatsApp ciblées en 10 minutes. Découvrez toutes les fonctionnalités de Baobab Loyalty pour les hôtels d'Afrique.",
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
