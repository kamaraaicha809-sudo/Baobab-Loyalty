import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "Votre offre exclusive — Baobab Loyalty",
  description:
    "Votre hôtel vous a préparé une offre exclusive. Confirmez votre réservation et profitez de votre avantage personnalisé.",
  robots: { index: false, follow: false },
});

export default function OffreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
