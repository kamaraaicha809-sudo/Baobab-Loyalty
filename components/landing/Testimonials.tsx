const testimonials = [
  {
    quote: "En 3 semaines, j'ai récupéré 7 nuits supplémentaires que je n'aurais jamais eues. Mes anciens clients ont répondu immédiatement sur WhatsApp. Je ne pensais pas que c'était aussi simple.",
    name: "Mamadou K.",
    role: "Propriétaire, Hôtel Le Baobab — Dakar",
    initials: "MK",
  },
  {
    quote: "Avant, je passais 2h par jour à appeler mes clients un par un. Maintenant, je lance une campagne en 2 minutes et j'attends les réservations. J'ai économisé 80 000 FCFA en commissions le premier mois.",
    name: "Aïssatou D.",
    role: "Gérante, Résidence Les Palmiers — Abidjan",
    initials: "AD",
  },
  {
    quote: "Ce que j'aime, c'est que l'IA rédige les messages à ma place. Je n'aurais jamais su quoi dire. Mes clients reçoivent une offre personnalisée et ils réservent directement sans passer par Booking.",
    name: "Kofi A.",
    role: "Directeur, Hôtel Savane — Lomé",
    initials: "KA",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FDFDF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-4">
            Ce que disent nos hôteliers
          </h2>
          <p className="text-slate-500 text-base sm:text-lg">
            Des résultats concrets dès les premières semaines
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
              <div className="mb-4 text-[#EBC161]">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBC161]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#c9a84d] font-bold text-sm">{t.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-[#2C2C2C] text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
