// app/robots.ts — Bloque l'indexation sur preview/staging, autorise en production.
// IMPORTANT : sans ça, Google peut indexer ton URL Vercel preview.
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baobabloyalty.com";

// Vercel expose VERCEL_ENV ∈ "production" | "preview" | "development"
const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV; // hors Vercel

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    // Sur preview/staging : bloquer TOUT
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  // En prod : règles normales
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
