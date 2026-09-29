import type { Metadata } from "next";
import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";
import config from "@/config";

// Europe : le blog ne contient que des articles Afrique (FCFA, Abidjan,
// Dakar...) signés Baobab Loyalty, il est masqué sur Loyavia (pages en 404).
export const metadata: Metadata = config.region === "europe" ? { robots: { index: false, follow: false } } : getSEOTags({
  title: "Blog — Stratégies de fidélisation hôtelière en Afrique de l'Ouest",
  description:
    "Conseils et stratégies pour fidéliser vos clients d'hôtel en Côte d'Ivoire, Sénégal, Cameroun et Ghana. WhatsApp marketing, segmentation, réservations directes.",
  keywords: [
    "blog fidélisation hôtel Afrique",
    "marketing hôtelier Afrique de l'Ouest",
    "WhatsApp marketing hôtel",
    "fidéliser clients hôtel Abidjan",
    "stratégie hôtelière Dakar",
    "réservations directes hôtel",
    "CRM hôtelier Afrique",
  ],
  canonicalUrlRelative: "/blog",
  openGraph: {
    title: "Blog Baobab Loyalty — Marketing hôtelier en Afrique de l'Ouest",
    description:
      "Conseils pratiques pour les hôteliers en Côte d'Ivoire, Sénégal, Cameroun et Ghana.",
    url: "/blog",
  },
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
