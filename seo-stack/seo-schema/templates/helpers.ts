// lib/schemas.ts — Helpers pour générer du JSON-LD type-safe en TypeScript
import type { Organization, WebSite, Article, FAQPage, BreadcrumbList, SoftwareApplication, Product } from "schema-dts";
// `npm i -D schema-dts` pour avoir les types

const SITE_URL = "https://baobabloyalty.com";

export const organizationSchema: Organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Baobab Loyalty",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Plateforme française de fidélisation client B2B",
  sameAs: [
    "https://www.linkedin.com/company/baobabloyalty",
    "https://twitter.com/baobabloyalty",
  ],
};

export const websiteSchema: WebSite = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Baobab Loyalty",
  inLanguage: "fr-FR",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  } as any,
};

export function buildBreadcrumb(items: { name: string; url?: string }[]): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildArticle(input: {
  title: string;
  description: string;
  slug: string;
  image: string;
  publishedAt: string; // ISO 8601
  updatedAt: string;
  authorName: string;
  authorUrl?: string;
  wordCount?: number;
  keywords?: string[];
}): Article {
  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: [input.image],
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: {
      "@type": "Person",
      name: input.authorName,
      url: input.authorUrl,
    },
    publisher: { "@id": `${SITE_URL}/#organization` } as any,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${input.slug}`,
    },
    inLanguage: "fr-FR",
    wordCount: input.wordCount,
    keywords: input.keywords?.join(", "),
  };
}

export function buildFAQ(items: { question: string; answer: string }[]): FAQPage {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

// Helper d'enveloppe avec @context
export function withContext<T>(schema: T): T & { "@context": "https://schema.org" } {
  return { "@context": "https://schema.org", ...(schema as object) } as any;
}
