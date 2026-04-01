"use client";

import { ReactNode } from "react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import config from "@/config";
import { PostHogProvider } from "@/components/common/PostHogProvider";

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Client Layout
 * Wraps the app with client-side features (progress bar, toasts)
 */
const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <PostHogProvider>
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
    </PostHogProvider>
  );
};

export default ClientLayout;
