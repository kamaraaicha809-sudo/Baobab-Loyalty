import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/src/lib/blog";
import { markdownToHtml } from "@/src/lib/markdown";
import { BlogCard } from "@/components/blog/BlogCard";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Baobab Loyalty`,
    description: post.description,
    keywords: [post.category, "hôtel Afrique de l'Ouest", "fidélisation client", "WhatsApp marketing hôtel"],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);
  const contentHtml = markdownToHtml(post.content);

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: config.appName,
      url: `https://${config.domainName}`,
    },
    publisher: {
      "@type": "Organization",
      name: config.appName,
      logo: {
        "@type": "ImageObject",
        url: `https://${config.domainName}/icon.svg`,
      },
    },
    url: `https://${config.domainName}/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://${config.domainName}/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `https://${config.domainName}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `https://${config.domainName}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://${config.domainName}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <article className="pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-slate-400" aria-label="Fil d'Ariane">
              <Link href="/" className="hover:text-slate-600 transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-slate-600 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-slate-500 truncate max-w-[200px]">{post.category}</span>
            </nav>

            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1 rounded-full bg-[#1a2f2a]/10 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
                  {post.category}
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-slate-400 text-xs">{post.readingTime} min de lecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C2C2C] leading-tight mb-5">
                {post.title}
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-6">
                {post.description}
              </p>
              <div className="flex items-center gap-4 pb-8 border-b border-slate-200">
                <div className="w-9 h-9 rounded-full bg-[#1a2f2a] flex items-center justify-center">
                  <span className="text-[#EBC161] font-bold text-sm">B</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2C2C2C]">Baobab Loyalty</p>
                  <time className="text-slate-400 text-xs">{publishedDate}</time>
                </div>
              </div>
            </header>

            {/* Content */}
            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* CTA Box */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#1a2f2a] text-center">
              <p className="text-[#EBC161] text-xs font-semibold uppercase tracking-widest mb-3">
                Baobab Loyalty
              </p>
              <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 leading-snug">
                Prêt à fidéliser vos clients via WhatsApp ?
              </h2>
              <p className="text-[#a3c4b5] text-sm mb-6 leading-relaxed">
                Importez votre base clients, segmentez automatiquement et envoyez
                votre première campagne en moins de 10 minutes.
              </p>
              <Link
                href="/demo"
                className="inline-block px-6 py-3 rounded-lg bg-[#EBC161] text-[#1a2f2a] text-sm font-bold hover:bg-[#d4a94d] transition-colors"
              >
                Essayer gratuitement
              </Link>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="pb-16 sm:pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-6">
                Articles similaires
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <BlogCard key={related.slug} post={related} />
                ))}
              </div>
            </div>
          </section>
        )}

        <NewsletterBanner />
      </main>
      <Footer />
    </>
  );
}
