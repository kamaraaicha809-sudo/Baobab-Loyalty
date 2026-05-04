import { NewsletterForm } from "./NewsletterForm";

/**
 * NewsletterBanner
 * Full-width newsletter subscription section.
 * Server component wrapper — embeds the NewsletterForm client component.
 * Intended to be dropped into any page (landing, blog, etc.).
 */
export function NewsletterBanner() {
  return (
    <section className="w-full bg-[#1a2f2a] py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        {/* Eyebrow */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#EBC161]">
          Newsletter mensuelle
        </p>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl leading-snug">
          Recevez nos conseils hôteliers chaque mois
        </h2>

        {/* Subtitle */}
        <p className="mb-8 text-base text-[#a3c4b5] leading-relaxed">
          Rejoignez plus de 500 directeurs d'hôtels en Afrique de l'Ouest qui reçoivent
          nos stratégies exclusives pour remplir leurs chambres et fidéliser leurs clients.
        </p>

        {/* Form */}
        <div className="mx-auto max-w-md">
          <NewsletterForm />
        </div>

        {/* Reassurance */}
        <p className="mt-5 text-xs text-white/30">
          Gratuit. Désabonnement en un clic.
        </p>
      </div>
    </section>
  );
}
