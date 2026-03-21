import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { ReactNode, Suspense } from "react";

export const metadata = getSEOTags({
  title: `Inscription | ${config.appName}`,
  description: `Créez votre compte ${config.appName}.`,
  canonicalUrlRelative: "/signup",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>{children}</Suspense>;
}
