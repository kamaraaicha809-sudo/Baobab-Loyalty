// app/sitemap.ts — Sitemap multilingue avec hreflang (FR + EN)
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baobabloyalty.com";

const routes = [
  { fr: "/", en: "/en" },
  { fr: "/fonctionnalites", en: "/en/features" },
  { fr: "/tarifs", en: "/en/pricing" },
  { fr: "/cas-clients", en: "/en/case-studies" },
  { fr: "/a-propos", en: "/en/about" },
  { fr: "/contact", en: "/en/contact" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Pour chaque route, on génère 2 entrées (une par langue)
  // avec le bloc `alternates.languages` qui pointe vers les autres versions.
  const entries: MetadataRoute.Sitemap = [];

  for (const r of routes) {
    const languages = {
      "fr-FR": `${SITE_URL}${r.fr}`,
      "en-US": `${SITE_URL}${r.en}`,
      "x-default": `${SITE_URL}${r.fr}`, // langue par défaut si Google ne sait pas
    };

    entries.push(
      {
        url: `${SITE_URL}${r.fr}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: r.fr === "/" ? 1.0 : 0.8,
        alternates: { languages },
      },
      {
        url: `${SITE_URL}${r.en}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: r.en === "/en" ? 0.9 : 0.7,
        alternates: { languages },
      }
    );
  }

  return entries;
}
