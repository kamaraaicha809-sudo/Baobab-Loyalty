"use client";

import { ReactNode } from "react";
import BaseLayout from "@/components/dashboard/BaseLayout";

/**
 * Admin Layout Client Component
 * Note: L'auth et le rôle admin sont vérifiés côté serveur dans app/admin/layout.tsx
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout 
      bannerColor="amber"
      requireAdmin={true}
    >
      {children}
    </BaseLayout>
  );
}
