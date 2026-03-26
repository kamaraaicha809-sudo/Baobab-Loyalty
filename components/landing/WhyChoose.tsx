import Image from "next/image";

const benefits = [
  {
    title: "Augmentez vos revenus directs",
    desc: "Réduisez votre dépendance aux OTAs (Online Travel Agency) et reprenez le contrôle de votre relation client.",
    highlight: "",
  },
  {
    title: "Fidélisez sans effort",
    desc: "Quand vous sentez le besoin de faire une promotion, l'IA s'occupe de sélectionner la liste des clients selon le segment que vous avez choisi et vous aide à compléter le message que vous allez envoyer via WhatsApp.",
    highlight: "Le tout en moins de 2 minutes chrono.",
  },
  {
    title: "Simplicité absolue",
    desc: "Pas besoin d'être un expert en marketing. L'interface est conçue pour les hôteliers pressés.",
    highlight: "",
  },
];

const WhyChoose = () => {
  return (
    <section id="benefices" className="py-16 sm:py-24 bg-[#FDFDF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[11fr_9fr] gap-10 lg:gap-14 items-center">
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
                    {b.highlight && (
                      <p className="text-slate-800 text-sm sm:text-base font-bold mt-1">{b.highlight}</p>
                    )}
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
              <div className="absolute top-4 right-4 sm:left-auto sm:max-w-xs bg-white/95 rounded-xl p-4 shadow-lg">
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
