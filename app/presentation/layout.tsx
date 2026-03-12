import config from "@/config";
import { ReactNode } from "react";

export const metadata = {
  title: `Présentation | ${config.appName}`,
  description: `Découvrez ${config.appName} - ${config.appDescription}`,
};

export default function PresentationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950">
      {children}
    </div>
  );
}
