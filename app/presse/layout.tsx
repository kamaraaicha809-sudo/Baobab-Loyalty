import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Presse & Médias — Baobab Loyalty",
  description:
    "Page presse de Baobab Loyalty. Communiqués de presse, chiffres clés et contact médias pour les journalistes couvrant l'hôtellerie et le numérique en Afrique de l'Ouest.",
  keywords: [
    "presse Baobab Loyalty",
    "communiqué de presse hôtel Afrique",
    "startup hôtelière Côte d'Ivoire",
    "fidélisation hôtel WhatsApp Afrique",
    "presse tourisme Afrique de l'Ouest",
    "tech hôtelier FCFA",
  ],
  alternates: { canonical: `/presse` },
  openGraph: {
    title: "Presse & Médias — Baobab Loyalty",
    description:
      "Communiqués de presse, chiffres clés et contact médias pour les journalistes couvrant l'hôtellerie africaine.",
    url: `https://${config.domainName}/presse`,
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
