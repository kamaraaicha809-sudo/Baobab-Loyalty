const stats = [
  { value: "+35%", label: "RÉSERVATIONS DIRECTES" },
  { value: "< 2 min", label: "TEMPS DE CAMPAGNE" },
  { value: "98%", label: "TAUX D'OUVERTURE" },
  { value: "50+", label: "HÔTELS PARTENAIRES" },
];

const Stats = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FDFDF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
