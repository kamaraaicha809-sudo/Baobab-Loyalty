import Image from "next/image";

const benefits = [
  {
    title: "Augmentez vos revenus directs",
    desc: "Réduisez votre dépendance aux OTAs et reprenez le contrôle de votre relation client.",
  },
  {
    title: "Fidélisez sans effort",
    desc: "L'IA s'occupe de trouver le bon moment et le bon message pour chaque client.",
  },
  {
    title: "Simplicité absolue",
    desc: "Pas besoin d'être un expert en marketing. L'interface est conçue pour les hôteliers pressés.",
  },
];

const WhyChoose = () => {
  return (
    <section id="benefices" className="py-16 sm:py-24 bg-[#FDFDF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-10">
              Pourquoi choisir Baobab Loyalty?
            </h2>
            <ul className="space-y-8">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#2C2C2C] mb-1">{b.title}</h3>
                    <p className="text-slate-600 text-sm sm:text-base">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 relative">
              <Image
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
                alt="Hôtel"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 rounded-xl p-4 shadow-lg">
                <p className="font-display text-[#2C2C2C] italic text-sm sm:text-base mb-2">
                  &ldquo;Baobab a changé notre façon de gérer les périodes creuses. C&apos;est magique.&rdquo;
                </p>
                <p className="text-sm text-slate-600">— Directeur, Hôtel Le Baobab</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
