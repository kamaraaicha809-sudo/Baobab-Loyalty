import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "Présentation — Baobab Loyalty",
  description:
    "Découvrez Baobab Loyalty, la solution de fidélisation client pour hôtels en Afrique de l'Ouest.",
  robots: { index: false, follow: false },
});

export default function PresentationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950">
      {children}
    </div>
  );
}
