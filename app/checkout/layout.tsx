import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Paiement — ${config.appName}`,
  description: `Finalisez votre abonnement ${config.appName}.`,
  robots: { index: false, follow: false },
});

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
