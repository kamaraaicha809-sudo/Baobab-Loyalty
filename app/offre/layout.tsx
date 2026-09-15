import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Votre offre exclusive — ${config.appName}`,
  description:
    "Votre hôtel vous a préparé une offre exclusive. Confirmez votre réservation et profitez de votre avantage personnalisé.",
  robots: { index: false, follow: false },
});

export default function OffreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
