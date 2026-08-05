// app/robots.ts — robots.txt natif Next.js
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baobabloyalty.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/login",
          "/inscription",
          "/_next/",
          "/preview/",
          "*.json$",
        ],
      },
      // Bloquer GPTBot, ClaudeBot, etc. si tu ne veux pas être utilisé pour l'entraînement IA.
      // Décommente si tu veux exclure :
      // {
      //   userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot", "anthropic-ai"],
      //   disallow: "/",
      // },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
