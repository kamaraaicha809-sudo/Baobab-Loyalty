import { getSEOTags } from "@/libs/seo";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "Paiement — Baobab Loyalty",
  description: "Finalisez votre abonnement Baobab Loyalty.",
  robots: { index: false, follow: false },
});

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
