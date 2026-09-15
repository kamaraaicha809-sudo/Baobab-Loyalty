import type { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: `Accès Bêta Privé — ${config.appName}`,
  description: `Rejoignez les premiers hôteliers à tester ${config.appName} gratuitement.`,
  robots: "noindex, nofollow",
};

export default function BetaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
