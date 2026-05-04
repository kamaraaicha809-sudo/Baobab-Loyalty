import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "Votre avis compte — Baobab Loyalty",
  description:
    "Partagez votre expérience et aidez votre hôtel à améliorer ses services.",
  robots: { index: false, follow: false },
});

export default function SondageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
