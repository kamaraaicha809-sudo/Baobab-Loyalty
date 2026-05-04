"use client";

import { useState } from "react";
import { BlogCard } from "./BlogCard";
import { CategoryFilter } from "./CategoryFilter";
import type { BlogPost } from "@/src/lib/blog";

interface BlogListingClientProps {
  posts: BlogPost[];
  featuredPosts: BlogPost[];
  categories: string[];
}

export function BlogListingClient({ posts, featuredPosts, categories }: BlogListingClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredPosts = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  const filteredFeatured = activeCategory
    ? featuredPosts.filter((p) => p.category === activeCategory)
    : featuredPosts;

  const regularPosts = filteredPosts.filter((p) => !p.featured || activeCategory !== null);

  return (
    <>
      <div className="mb-8">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {filteredFeatured.length > 0 && activeCategory === null && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {filteredFeatured.map((post) => (
            <BlogCard key={post.slug} post={post} featured />
          ))}
        </div>
      )}

      {activeCategory !== null && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {activeCategory === null && regularPosts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <p className="text-slate-500 text-center py-12">
          Aucun article dans cette catégorie pour l'instant.
        </p>
      )}
    </>
  );
}
