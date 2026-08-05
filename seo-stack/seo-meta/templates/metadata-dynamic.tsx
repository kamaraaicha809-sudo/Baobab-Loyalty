// app/blog/[slug]/page.tsx — Metadata dynamique générée à partir des données
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// Récupère l'article (à adapter à ta source : DB, CMS, MDX…)
async function getArticle(slug: string) {
  // const article = await db.article.findUnique({ where: { slug } });
  // return article;
  return null; // placeholder
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const url = `https://baobabloyalty.com/blog/${slug}`;
  const ogImage = article.coverImage ?? "https://baobabloyalty.com/og/blog-default.jpg";

  return {
    title: `${article.title} | Blog Baobab Loyalty`,
    description: article.excerpt, // 140-160 car.
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url,
      siteName: "Baobab Loyalty",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author?.name ?? "Baobab Loyalty"],
      tags: article.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@baobabloyalty",
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  return <article>{/* … */}</article>;
}
