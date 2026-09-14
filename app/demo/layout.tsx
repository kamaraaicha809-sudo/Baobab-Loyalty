import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";

const isEurope = config.region === "europe";

export const metadata = getSEOTags({
  title: `Démo interactive — ${config.appName}`,
  description: `Essayez ${config.appName} gratuitement. Créez une campagne WhatsApp pour votre hôtel en 2 minutes. Segmentation clients, messages IA, sans inscription.`,
  canonicalUrlRelative: "/demo",
  openGraph: {
    title: `Démo ${config.appName} — Campagne hôtel en 2 minutes`,
    description: isEurope
      ? "Testez la solution de fidélisation client pour hôtels."
      : "Testez la solution de fidélisation client pour hôtels en Côte d'Ivoire, Sénégal et Cameroun.",
    url: `https://${config.domainName}/demo`,
  },
});

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
