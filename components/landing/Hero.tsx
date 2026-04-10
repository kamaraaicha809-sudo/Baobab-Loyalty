import Link from "next/link";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 sm:pt-28 sm:pb-20 bg-[#FDFDF9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-medium uppercase tracking-wider mb-8">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          IA + WhatsApp — Réservations directes sans commission
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#2C2C2C] leading-tight mb-4">
          Remplissez vos chambres vides.<br />Sans Booking. Sans effort.
        </h1>
        <p className="text-base sm:text-lg text-[#555] max-w-2xl mx-auto mb-10 leading-relaxed">
          Baobab Loyalty utilise ta base de clients existants et WhatsApp pour générer des réservations directes en moins de 2 minutes — sans payer de commission à personne.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/beta"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
          >
            Commencer maintenant
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-[#2C2C2C] text-[#2C2C2C] font-medium hover:bg-slate-50 transition-colors"
          >
            Voir la démo
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-5">Sans engagement — Résultats dès la première campagne</p>
      </div>
    </section>
  );
};

export default Hero;
