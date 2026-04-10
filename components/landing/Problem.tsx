const consequences = [
  {
    stat: "10–35M FCFA",
    label: "perdus chaque mois",
    detail: "en chambres vides que tu n'arrives pas à remplir",
  },
  {
    stat: "15 à 25%",
    label: "de commission reversés",
    detail: "à Booking.com sur chaque réservation que tu aurais pu avoir en direct",
  },
  {
    stat: "3 à 5h",
    label: "perdues chaque jour",
    detail: "à appeler manuellement, envoyer des WhatsApp un par un, gérer Excel",
  },
  {
    stat: "0 retour",
    label: "de tes anciens clients",
    detail: "parce qu'ils ne reçoivent jamais de signe de toi entre deux séjours",
  },
];

const Problem = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#2C2C2C]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Chaque nuit vide, c&apos;est de l&apos;argent que tu ne récupèreras jamais
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Tu as des clients qui ont déjà séjourné dans ton hôtel. Ils ont aimé. Mais ils ne reviennent pas — parce que personne ne les relance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
          {consequences.map((c, i) => (
            <div key={i} className="bg-[#383838] rounded-2xl p-6 border border-[#444]">
              <div className="text-[#EBC161] font-display text-3xl font-bold mb-1">{c.stat}</div>
              <div className="text-white font-semibold mb-2">{c.label}</div>
              <div className="text-slate-400 text-sm">{c.detail}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-white text-lg sm:text-xl font-semibold">
            Tu n&apos;as pas un problème de clients.{" "}
            <span className="text-[#EBC161]">Tu as un problème de suivi.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problem;
