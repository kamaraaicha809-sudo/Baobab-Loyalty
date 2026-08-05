// Pour les sites > 50 000 URLs : Next.js exige un sitemap découpé.
// Solution : exporter une fonction `generateSitemaps` + un sitemap paginé.

// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baobabloyalty.com";
const PAGE_SIZE = 50_000;

async function countProducts(): Promise<number> {
  // return prisma.product.count();
  return 0;
}

async function getProductsPage(page: number): Promise<{ slug: string; updatedAt: string }[]> {
  // return prisma.product.findMany({
  //   skip: page * PAGE_SIZE,
  //   take: PAGE_SIZE,
  //   orderBy: { id: "asc" },
  //   select: { slug: true, updatedAt: true },
  // });
  return [];
}

// 1. Décrit combien de sitemaps découper.
// Next.js servira /sitemap/0.xml, /sitemap/1.xml, … et un index agrégé.
export async function generateSitemaps() {
  const total = await countProducts();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return Array.from({ length: pages }, (_, i) => ({ id: i }));
}

// 2. Génère le contenu de chaque sitemap.
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsPage(id);
  return products.map((p) => ({
    url: `${SITE_URL}/produits/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));
}
