import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accès Bêta Privé — Baobab Loyalty",
  description: "Rejoignez les premiers hôteliers à tester Baobab Loyalty gratuitement.",
  robots: "noindex, nofollow",
};

export default function BetaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
