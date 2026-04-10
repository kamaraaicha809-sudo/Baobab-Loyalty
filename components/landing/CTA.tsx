import Link from "next/link";
import config from "@/config";

const CTA = () => {
  return (
    <section className="relative gradient-primary py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background decoration - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -left-20 sm:-left-40 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -right-20 sm:-right-40 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full bg-primary/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-white/80 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
            <span className="hidden xs:inline">Remplissez vos </span>chambres vides<span className="hidden sm:inline"> dès aujourd&apos;hui</span>
          </div>

          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6 text-white">
            Tes chambres vides ne t&apos;attendent pas.<br />Tes anciens clients, si.
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-4 sm:mb-6 leading-relaxed px-2">
            120 000 à 600 000 FCFA supplémentaires chaque mois — sans Booking, sans commission, sans effort.
          </p>
          <p className="text-white/70 text-sm sm:text-base mb-8 sm:mb-10 px-2 italic">
            Garantie : si on ne te génère pas au moins 2 nuits dans le mois, on t&apos;offre le mois suivant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signin"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-slate-900 font-bold text-base sm:text-lg hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/#tarifs"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-base sm:text-lg hover:bg-white/20 transition-all"
            >
              Voir les tarifs
            </Link>
          </div>

          <p className="text-white/60 text-xs sm:text-sm mt-6 sm:mt-8 px-2">
            <span className="hidden sm:inline">Sans engagement • Résultats dès la première campagne • Support 30 jours offert</span>
            <span className="sm:hidden">Sans engagement • Support inclus</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
