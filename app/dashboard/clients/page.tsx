"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirection : la page "Clients visés" a été fusionnée avec Segments
export default function ClientsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/segments");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
