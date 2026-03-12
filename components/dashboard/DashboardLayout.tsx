"use client";

import { ReactNode, Suspense } from "react";
import BaseLayout from "@/components/dashboard/BaseLayout";

/**
 * Layout privé avec Sidebar pour le Dashboard
 * Note: L'auth est vérifiée côté serveur dans app/dashboard/layout.tsx
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <BaseLayout>{children}</BaseLayout>
    </Suspense>
  );
}
