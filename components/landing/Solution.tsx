const Solution = () => {
  return (
    <section id="solution" className="py-16 sm:py-24 bg-[#FDFDF9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-6">
          Et si tes anciens clients remplissaient tes chambres cette semaine ?
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Baobab Loyalty connecte ta base de données clients existante à WhatsApp et à l&apos;IA. En 2 minutes, tu envoies une offre personnalisée aux clients qui ne sont pas revenus — et tu récupères des réservations directes, sans commission.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-left">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="text-[#EBC161] font-display text-2xl font-bold mb-1">Étape 1</div>
            <div className="font-semibold text-[#2C2C2C] mb-2">Tu importes ta base clients</div>
            <p className="text-slate-500 text-sm">Un simple fichier CSV depuis ton logiciel hôtelier. L&apos;IA segmente automatiquement tes clients par date de dernière visite.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="text-[#EBC161] font-display text-2xl font-bold mb-1">Étape 2</div>
            <div className="font-semibold text-[#2C2C2C] mb-2">L&apos;IA rédige le message</div>
            <p className="text-slate-500 text-sm">Tu choisis le segment, l&apos;offre, et l&apos;IA génère un message WhatsApp personnalisé et convaincant en quelques secondes.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="text-[#EBC161] font-display text-2xl font-bold mb-1">Étape 3</div>
            <div className="font-semibold text-[#2C2C2C] mb-2">Tu reçois des réservations</div>
            <p className="text-slate-500 text-sm">Tes clients reçoivent une offre directe sur WhatsApp et réservent sans passer par Booking. 0% de commission.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
