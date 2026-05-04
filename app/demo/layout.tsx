import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "Démo interactive — Baobab Loyalty",
  description:
    "Essayez Baobab Loyalty gratuitement. Créez une campagne WhatsApp pour votre hôtel en 2 minutes. Segmentation clients, messages IA, sans inscription.",
  canonicalUrlRelative: "/demo",
  openGraph: {
    title: "Démo Baobab Loyalty — Campagne hôtel en 2 minutes",
    description:
      "Testez la solution de fidélisation client pour hôtels en Côte d'Ivoire, Sénégal et Cameroun.",
    url: "https://baobabloyalty.com/demo",
  },
});

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
