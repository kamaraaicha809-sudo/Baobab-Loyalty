import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Hotel Loyalty Software for Accra, Ghana — Baobab Loyalty",
  description:
    "Accra hotels: automate guest re-engagement via WhatsApp. Cut OTA commissions 35%, launch campaigns in 10 min. Built for Ghana's hospitality market.",
  keywords: [
    "hotel loyalty software Accra",
    "WhatsApp marketing hotel Accra",
    "hotel direct bookings Accra Ghana",
    "CRM hotel Accra GHS",
    "guest retention hotel Accra",
    "reduce OTA commission Accra hotels",
    "hotel management software Accra",
  ],
  alternates: {
    canonical: `/accra`,
    languages: { en: `/accra` },
  },
  openGraph: {
    title: "Hotel Loyalty Software for Accra, Ghana — Baobab Loyalty",
    description:
      "Grow direct bookings for your Accra hotel with targeted WhatsApp campaigns. Auto-segmentation, AI messages, zero OTA commission.",
    url: `https://${config.domainName}/accra`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
