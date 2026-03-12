import config from "@/config";
import { Metadata } from "next";

/**
 * SEO Tags Options
 */
interface SEOTagsOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
  };
  canonicalUrlRelative?: string;
  robots?: Metadata["robots"];
  extraTags?: Record<string, unknown>;
}

/**
 * SEO Tags Generator
 * Generates metadata for Next.js pages with sensible defaults from config
 */
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  robots,
  extraTags,
}: SEOTagsOptions = {}): Metadata => {
  // Default keywords for Micro SaaS template
  const defaultKeywords = [
    config.appName,
    "Micro SaaS template",
    "Next.js template",
    "Supabase",
    "Stripe",
    "boilerplate",
    "starter kit",
    "micro-SaaS",
    "template React",
  ];

  return {
    // Title: up to 50 characters
    title: title || config.appName,
    // Description: up to 160 characters
    description: description || config.appDescription,
    // Keywords
    keywords: keywords || defaultKeywords,
    applicationName: config.appName,
    // Base URL for relative paths
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),

    // Robots meta
    robots: robots || {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: openGraph?.title || config.appName,
      locale: "fr_FR",
      type: "website",
    },

    twitter: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      card: "summary_large_image",
      creator: config.social?.twitter || "",
    },

    // Canonical URL
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),

    // Extra tags
    ...extraTags,
  };
};

/**
 * Structured Data for Rich Results on Google
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
export const renderSchemaTags = () => {
  // Get the first plan price for offers
  const firstPlan = config.stripe?.plans?.[0];
  const featuredPlan = config.stripe?.plans?.find((p: { isFeatured?: boolean }) => p.isFeatured) || firstPlan;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: config.appDescription,
          image: `https://${config.domainName}/icon.svg`,
          url: `https://${config.domainName}/`,
          author: {
            "@type": "Organization",
            name: config.appName,
          },
          publisher: {
            "@type": "Organization",
            name: config.appName,
            logo: {
              "@type": "ImageObject",
              url: `https://${config.domainName}/icon.svg`,
            },
          },
          datePublished: "2024-01-01",
          dateModified: new Date().toISOString().split("T")[0],
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            ratingCount: "12",
            bestRating: "5",
            worstRating: "1",
          },
          offers: featuredPlan
            ? {
                "@type": "Offer",
                price: String(featuredPlan.price),
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
                priceValidUntil: new Date(
                  new Date().setFullYear(new Date().getFullYear() + 1)
                ).toISOString().split("T")[0],
              }
            : undefined,
          featureList: [
            "Authentification Supabase",
            "Paiements Stripe",
            "Edge Functions",
            "Dashboard Admin",
            "Emails Resend",
            "TailwindCSS 4",
          ],
        }),
      }}
    ></script>
  );
};
