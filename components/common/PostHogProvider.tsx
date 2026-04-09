"use client";

import posthog from "posthog-js";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.location.origin + pathname;
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

// Standalone init component — does NOT wrap children.
// Loaded lazily via dynamic import so posthog-js is NOT in the main bundle.
export default function PostHogInit() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: false,
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true") {
          ph.debug();
        }
      },
    });
  }, []);

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
