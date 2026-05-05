import { getAllPosts, getFeaturedPosts, getAllCategories } from "@/src/lib/blog";
import { BlogListingClient } from "@/components/blog/BlogListingClient";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Suspense } from "react";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Blog Baobab Loyalty — Fidélisation hôtelière en Afrique",
  description: "Guides pratiques, stratégies WhatsApp et conseils CRM pour hôteliers en Afrique de l'Ouest. Côte d'Ivoire, Sénégal, Cameroun, Ghana — en français et en anglais.",
  canonicalUrlRelative: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPosts = getFeaturedPosts();
  const categories = getAllCategories();

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-10 sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1a2f2a] mb-3">
                Le Blog
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] leading-tight mb-4">
                Stratégies pour remplir votre hôtel<br className="hidden sm:block" />
                {" "}en Afrique de l&apos;Ouest
              </h1>
              <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
                Conseils pratiques sur la fidélisation client, le marketing WhatsApp
                et les réservations directes — adaptés aux hôtels de Côte d&apos;Ivoire,
                Sénégal, Cameroun et Ghana.
              </p>
            </div>

            <BlogListingClient
              posts={posts}
              featuredPosts={featuredPosts}
              categories={categories}
            />
          </div>
        </section>

        <NewsletterBanner />
      </main>
      <Footer />
    </>
  );
}
