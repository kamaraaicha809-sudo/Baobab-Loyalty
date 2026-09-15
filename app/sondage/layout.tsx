import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Votre avis compte — ${config.appName}`,
  description:
    "Partagez votre expérience et aidez votre hôtel à améliorer ses services.",
  robots: { index: false, follow: false },
});

export default function SondageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
