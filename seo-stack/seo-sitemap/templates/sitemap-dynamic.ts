// app/sitemap.ts — Sitemap avec routes statiques + dynamiques (articles, produits…)
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baobabloyalty.com";

// Revalidate toutes les heures pour rafraîchir les routes dynamiques
export const revalidate = 3600;

// === Sources de données — adapte à ton stack ===
async function getBlogPosts(): Promise<{ slug: string; updatedAt: string }[]> {
  // Exemple Prisma:
  // return prisma.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  return [];
}

async function getCustomerCases(): Promise<{ slug: string; updatedAt: string }[]> {
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Routes statiques principales
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/fonctionnalites`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/tarifs`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/cas-clients`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // 2. Articles de blog (dynamique)
  const posts = await getBlogPosts();
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // 3. Cas clients
  const cases = await getCustomerCases();
  const caseRoutes: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${SITE_URL}/cas-clients/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 4. Pages légales (faible priorité)
  const legalRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/mentions-legales`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/cgv`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/politique-confidentialite`, lastModified: now, priority: 0.2 },
  ];

  return [...staticRoutes, ...postRoutes, ...caseRoutes, ...legalRoutes];
}
