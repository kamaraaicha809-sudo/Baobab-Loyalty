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
  // Mots-clés SEO : le marché ("Afrique"/"FCFA") est propre à l'Afrique,
  // jamais vrai pour l'Europe — ne pas inventer un équivalent tant que les
  // pages publiques Europe n'ont pas été rédigées (voir config.region).
  const defaultKeywords =
    config.region === "europe"
      ? [
          config.appName,
          "fidélisation clients hôtel",
          "campagnes WhatsApp hôtel",
          "segmentation clients",
          "CRM hôtelier",
          "engagement client hôtellerie",
          "automatisation WhatsApp",
        ]
      : [
          config.appName,
          "fidélisation clients hôtel",
          "campagnes WhatsApp hôtel",
          "segmentation clients",
          "CRM hôtelier Afrique",
          "marketing hôtel FCFA",
          "engagement client hôtellerie",
          "automatisation WhatsApp",
          "loyauté client Afrique francophone",
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
        : process.env.NEXT_PUBLIC_SITE_URL || `https://${config.domainName}/`
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
  // config.billing.plans reste la liste Afrique (FCFA) ; plansEurope est la
  // seule autre source de vérité, jamais les mêmes montants relabellisés
  // (même bug déjà corrigé dans components/landing/Pricing.tsx).
  const plansForRegion = config.region === "europe" ? config.billing.plansEurope : config.billing.plans;
  const firstPlan = plansForRegion?.[0];
  const featuredPlan = plansForRegion?.find((p: { isFeatured?: boolean }) => p.isFeatured) || firstPlan;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: config.appDescription,
          image: `https://${config.domainName}${config.region === "europe" ? "/brand/loyavia-emblem.png" : "/brand/baobab-tree.png"}`,
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
              url: `https://${config.domainName}${config.region === "europe" ? "/brand/loyavia-emblem.png" : "/brand/baobab-tree.png"}`,
            },
          },
          datePublished: "2024-01-01",
          dateModified: new Date().toISOString().split("T")[0],
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: featuredPlan
            ? {
                "@type": "Offer",
                price: String(featuredPlan.price),
                priceCurrency: config.region === "europe" ? "EUR" : "XOF",
                availability: "https://schema.org/InStock",
                priceValidUntil: new Date(
                  new Date().setFullYear(new Date().getFullYear() + 1)
                ).toISOString().split("T")[0],
              }
            : undefined,
          featureList: [
            "Segmentation clients hôtel",
            "Campagnes WhatsApp automatisées",
            "Génération de messages par IA",
            "Tracking des réservations",
            "Dashboard temps réel",
            "Import CSV clients",
          ],
        }),
      }}
    ></script>
  );
};

export const renderOrganizationSchema = () => {
  const sameAs = [config.social?.facebook, config.social?.instagram].filter(Boolean);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: config.appName,
          url: `https://${config.domainName}/`,
          logo: {
            "@type": "ImageObject",
            url: `https://${config.domainName}${config.region === "europe" ? "/brand/loyavia-emblem.png" : "/brand/baobab-tree.png"}`,
          },
          description: config.appDescription,
          email: config.resend.supportEmail,
          ...(sameAs.length > 0 && { sameAs }),
          // Pays desservis propres à l'Afrique — l'équivalent Europe (quels
          // pays, dans quelle langue) n'a pas encore été décidé, ne pas
          // inventer une liste ici tant que ce n'est pas validé.
          ...(config.region !== "europe" && {
            areaServed: [
              { "@type": "Country", name: "Côte d'Ivoire" },
              { "@type": "Country", name: "Sénégal" },
              { "@type": "Country", name: "Cameroun" },
              { "@type": "Country", name: "Ghana" },
            ],
          }),
          knowsLanguage: ["fr", "en"],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: config.resend.supportEmail,
            availableLanguage: ["fr", "en"],
          },
        }),
      }}
    ></script>
  );
};

export const renderWebSiteSchema = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: config.appName,
          url: `https://${config.domainName}/`,
          inLanguage: "fr-FR",
          publisher: {
            "@type": "Organization",
            name: config.appName,
          },
        }),
      }}
    ></script>
  );
};

interface BreadcrumbItem {
  name: string;
  urlRelative: string;
}

export const renderBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `https://${config.domainName}${item.urlRelative}`,
          })),
        }),
      }}
    ></script>
  );
};

interface FAQItem {
  question: string;
  answer: string;
}

export const renderFAQSchema = (items: FAQItem[]) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }),
      }}
    ></script>
  );
};
