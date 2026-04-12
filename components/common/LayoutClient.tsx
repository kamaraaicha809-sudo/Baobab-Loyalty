"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";
import config from "@/config";
import CookieBanner from "@/components/common/CookieBanner";

interface ClientLayoutProps {
  children: ReactNode;
}

// Loaded after page paint — does not block FCP
const PostHogInit = dynamic(() => import("@/components/common/PostHogProvider"), {
  ssr: false,
});

const Toaster = dynamic(() => import("react-hot-toast").then((m) => ({ default: m.Toaster })), {
  ssr: false,
});

/**
 * Client Layout
 * Wraps the app with client-side features (progress bar, toasts)
 */
const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <>
      {/* Analytics — lazy loaded, never blocks render */}
      <PostHogInit />

      {/* Progress bar */}
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      {/* Page content */}
      {children}

      {/* Toast notifications */}
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Cookie consent banner */}
      <CookieBanner />
    </>
  );
};

export default ClientLayout;
