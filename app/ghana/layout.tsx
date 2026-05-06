import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Hotel Guest Loyalty in Ghana — Baobab Loyalty",
  description:
    "Ghana hotels: 3× more direct bookings, zero OTA commission. WhatsApp campaigns with AI, auto-segmentation. Up and running in 10 min — free trial.",
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
      "Ghana hotels: 3× more direct bookings, zero OTA commission. WhatsApp campaigns with AI, auto-segmentation. Up and running in 10 min.",
    url: `https://${config.domainName}/ghana`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
