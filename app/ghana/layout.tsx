import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Hotel Guest Loyalty in Ghana — Baobab Loyalty",
  description:
    "Grow direct bookings for your Accra hotel with Baobab Loyalty. Targeted WhatsApp campaigns, automatic segmentation and guest retention — built for the Ghanaian hospitality market.",
  keywords: [
    "hotel loyalty Ghana",
    "WhatsApp marketing hotel Accra",
    "hotel CRM Ghana",
    "hotel guest retention Accra",
    "direct bookings hotel Ghana",
    "hotel software Ghana GHS",
  ],
  alternates: { canonical: `/ghana` },
  openGraph: {
    title: "Hotel Guest Loyalty in Ghana — Baobab Loyalty",
    description:
      "Grow direct bookings for your Accra hotel with Baobab Loyalty. WhatsApp campaigns, automatic segmentation and guest retention.",
    url: `https://${config.domainName}/ghana`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
