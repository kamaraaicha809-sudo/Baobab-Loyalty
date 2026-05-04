import Link from "next/link";
import config from "@/config";

export interface CountryPlan {
  name: string;
  price: string;
  priceDetail: string;
  rooms: string;
  features: string[];
  highlighted: boolean;
}

export interface CountryTestimonial {
  quote: string;
  author: string;
  role: string;
  hotel: string;
  city: string;
  initials: string;
}

export interface CountryPageData {
  locale: "fr" | "en";
  country: string;
  countryCode: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroCta: string;
  statsItems: Array<{ value: string; label: string }>;
  problemTitle: string;
  problemSubtitle: string;
  problemPoints: Array<{ title: string; desc: string }>;
  solutionTitle: string;
  solutionSubtitle: string;
  solutionSteps: Array<{ step: string; title: string; desc: string }>;
  testimonial: CountryTestimonial;
  pricingTitle: string;
  pricingSubtitle: string;
  plans: CountryPlan[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  relatedBlog?: { slug: string; title: string; readingTime: number };
}

export function CountryLandingPage({ data }: { data: CountryPageData }) {
  return (
    <main className="min-h-screen bg-[#FDFDF9]">
      {/* Hero */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-[#FDFDF9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
            {data.heroEyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5 max-w-3xl mx-auto">
            {data.heroTitle}{" "}
            <span className="text-[#1a2f2a]">{data.heroTitleHighlight}</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            {data.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo"
              className="px-7 py-3.5 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              {data.heroCta}
            </Link>
            <Link
              href="/#tarifs"
              className="px-7 py-3.5 rounded-xl border border-slate-200 text-[#2C2C2C] text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {data.locale === "fr" ? "Voir les tarifs" : "See pricing"}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 bg-[#1a2f2a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            {data.statsItems.map((stat, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-bold text-[#EBC161]">{stat.value}</p>
                <p className="text-xs text-[#a3c4b5] mt-1 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              {data.problemTitle}
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
              {data.problemSubtitle}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {data.problemPoints.map((point, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#2C2C2C] mb-2">{point.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 sm:py-20 bg-[#F8F8F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              {data.solutionTitle}
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
              {data.solutionSubtitle}
            </p>
          </div>
          <div className="space-y-6 max-w-3xl mx-auto">
            {data.solutionSteps.map((step, i) => (
              <div key={i} className="flex gap-5 items-start bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#1a2f2a] flex items-center justify-center shrink-0">
                  <span className="text-[#EBC161] font-bold text-sm">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2C] mb-1">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <svg className="w-8 h-8 text-[#EBC161] mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-lg sm:text-xl text-[#2C2C2C] font-medium leading-relaxed mb-8 italic">
            &ldquo;{data.testimonial.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#1a2f2a] flex items-center justify-center">
              <span className="text-[#EBC161] font-bold text-sm">{data.testimonial.initials}</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#2C2C2C] text-sm">{data.testimonial.author}</p>
              <p className="text-slate-400 text-xs">{data.testimonial.role} — {data.testimonial.hotel}, {data.testimonial.city}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20 bg-[#F8F8F6]" id="tarifs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              {data.pricingTitle}
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">{data.pricingSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {data.plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-7 flex flex-col ${
                  plan.highlighted
                    ? "bg-[#1a2f2a] text-white ring-2 ring-[#EBC161]"
                    : "bg-white border border-slate-100 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <span className="text-[#EBC161] text-xs font-bold uppercase tracking-widest mb-3">
                    {data.locale === "fr" ? "Populaire" : "Most popular"}
                  </span>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plan.highlighted ? "text-white" : "text-[#2C2C2C]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-4 ${plan.highlighted ? "text-[#a3c4b5]" : "text-slate-400"}`}>
                  {plan.rooms}
                </p>
                <div className="mb-5">
                  <span className={`text-3xl font-bold ${plan.highlighted ? "text-[#EBC161]" : "text-[#2C2C2C]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ml-1 ${plan.highlighted ? "text-[#a3c4b5]" : "text-slate-400"}`}>
                    {plan.priceDetail}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-[#EBC161]" : "text-[#1a2f2a]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className={`text-sm leading-snug ${plan.highlighted ? "text-[#d4e8df]" : "text-slate-600"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/demo"
                  className={`w-full text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    plan.highlighted
                      ? "bg-[#EBC161] text-[#1a2f2a] hover:bg-[#d4a94d]"
                      : "border border-[#1a2f2a] text-[#1a2f2a] hover:bg-slate-50"
                  }`}
                >
                  {data.locale === "fr" ? "Démarrer" : "Get started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related blog post */}
      {data.relatedBlog && (
        <section className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1a2f2a] mb-3">
              {data.locale === "fr" ? "À lire aussi" : "Read more"}
            </p>
            <Link
              href={`/blog/${data.relatedBlog.slug}`}
              className="group inline-block"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#2C2C2C] group-hover:text-[#1a2f2a] transition-colors mb-2">
                {data.relatedBlog.title}
              </h3>
              <span className="text-[#1a2f2a] text-sm font-medium group-hover:underline">
                {data.locale === "fr" ? `Lire l'article (${data.relatedBlog.readingTime} min)` : `Read article (${data.relatedBlog.readingTime} min)`} &rarr;
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-[#1a2f2a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
            {data.ctaTitle}
          </h2>
          <p className="text-[#a3c4b5] text-base sm:text-lg mb-8 leading-relaxed">
            {data.ctaSubtitle}
          </p>
          <Link
            href="/demo"
            className="inline-block px-8 py-4 rounded-xl bg-[#EBC161] text-[#1a2f2a] text-sm font-bold hover:bg-[#d4a94d] transition-colors"
          >
            {data.ctaButton}
          </Link>
          <p className="text-white/30 text-xs mt-4">
            {data.locale === "fr"
              ? "Aucune carte bancaire requise. Fonctionnel en 10 minutes."
              : "No credit card required. Up and running in 10 minutes."}
          </p>
        </div>
      </section>
    </main>
  );
}
