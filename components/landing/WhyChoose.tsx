import Image from "next/image";


const WhyChoose = () => {
  return (
    <section id="benefices" className="py-16 sm:py-24 bg-[#FDFDF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-10">
              Pourquoi choisir Baobab Loyalty?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Quand vous sentez le besoin de faire une promotion, l&apos;IA s&apos;occupe de sélectionner la liste des clients selon le segment que vous avez choisi et vous aide à compléter le message que vous allez envoyer via WhatsApp. Le tout en moins de 5 minutes chrono.
            </p>
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
