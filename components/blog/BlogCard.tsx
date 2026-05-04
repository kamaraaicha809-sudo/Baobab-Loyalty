import Link from "next/link";
import type { BlogPost } from "@/src/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const publishedDate = new Date(post.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="bg-[#1a2f2a] rounded-2xl p-8 sm:p-10 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#EBC161]">
              {post.category}
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-white/40 text-xs">{post.readingTime} min de lecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-4 group-hover:text-[#EBC161] transition-colors">
            {post.title}
          </h2>
          <p className="text-[#a3c4b5] text-sm sm:text-base leading-relaxed flex-1 mb-6">
            {post.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <time className="text-white/30 text-xs">{publishedDate}</time>
            <span className="text-[#EBC161] text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
              Lire l'article &rarr;
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-2xl p-6 sm:p-7 h-full flex flex-col border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#1a2f2a]">
            {post.category}
          </span>
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-slate-400 text-xs">{post.readingTime} min</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-[#2C2C2C] leading-snug mb-3 group-hover:text-[#1a2f2a] transition-colors flex-1">
          {post.title}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">
          {post.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <time className="text-slate-400 text-xs">{publishedDate}</time>
          <span className="text-[#1a2f2a] text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
            Lire &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}
