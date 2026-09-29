import type { Metadata } from "next";
import config from "@/config";

// Page pays Afrique masquee pour l'Europe (voir app/ghana/page.tsx) :
// pas de metadata Afrique-only pour une page qui 404 cote Europe.
export const metadata: Metadata = config.region === "europe" ? { robots: { index: false, follow: false } } : {
  title: "Hotel Guest Loyalty in Ghana — Baobab Loyalty",
  description:
    "Ghana hotels: win back inactive guests via WhatsApp, zero OTA commission. WhatsApp campaigns with AI, auto-segmentation. Ghana launch in preparation.",
  keywords: [
    "hotel loyalty Ghana",
    "WhatsApp marketing hotel Accra",
    "hotel CRM Ghana",
    "hotel guest retention Accra",
    "direct bookings hotel Ghana",
    "hotel software Ghana GHS",
  ],
  alternates: {
    canonical: `/ghana`,
    languages: { en: `/ghana` },
  },
  openGraph: {
    title: "Hotel Guest Loyalty in Ghana — Baobab Loyalty",
    description:
      "Ghana hotels: win back inactive guests via WhatsApp, zero OTA commission. WhatsApp campaigns with AI, auto-segmentation. Ghana launch in preparation.",
    url: `https://${config.domainName}/ghana`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
