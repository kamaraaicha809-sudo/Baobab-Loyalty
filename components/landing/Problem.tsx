interface StepProps {
  emoji: string;
  text: string;
}

const Step = ({ emoji, text }: StepProps) => {
  return (
    <div className="w-full sm:w-40 md:w-48 flex flex-col gap-2 sm:gap-3 items-center justify-center">
      <span className="text-3xl sm:text-4xl">{emoji}</span>
      <h3 className="font-bold text-white text-center text-sm sm:text-base">{text}</h3>
    </div>
  );
};

/**
 * Problem Section
 * Shows the pain points of building a SaaS from scratch
 */
const Problem = () => {
  return (
    <section className="gradient-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20 lg:py-28 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6 text-white">
          Sans Baobab Loyalty
        </h2>
        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed mb-10 sm:mb-12 md:mb-16 text-white/80 px-2">
          Relances manuelles, tableaux Excel, oublis de clients... Du temps perdu pour remplir les chambres.
        </p>

        {/* Mobile: Vertical layout */}
        <div className="flex flex-col sm:hidden gap-6 items-center mb-12">
          <Step emoji="⏰" text="Heures de relance manuelle" />
          <Step emoji="📋" text="Excel et listes dispersées" />
          <Step emoji="😔" text="Clients oubliés" />
        </div>

        {/* Desktop: Horizontal */}
        <div className="hidden sm:flex flex-row justify-center items-center md:items-start gap-8 md:gap-12">
          <Step emoji="⏰" text="Heures de relance manuelle" />
          <Step emoji="📋" text="Excel et listes dispersées" />
          <Step emoji="😔" text="Clients oubliés" />
        </div>

        <div className="mt-12 sm:mt-14 md:mt-16 pt-10 sm:pt-12 md:pt-16 border-t border-white/10">
          <h3 className="max-w-3xl mx-auto font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6 sm:mb-8 text-white">
            Avec Baobab Loyalty
          </h3>

          {/* Mobile: Vertical layout */}
          <div className="flex flex-col sm:hidden gap-6 items-center">
            <Step emoji="⚡" text="Relances en 2 minutes" />
            <Step emoji="🤖" text="IA + WhatsApp automatique" />
            <Step emoji="📈" text="Chambres remplies" />
          </div>

          {/* Desktop: Horizontal */}
          <div className="hidden sm:flex flex-row justify-center items-center md:items-start gap-8 md:gap-12">
            <Step emoji="⚡" text="Relances en 2 minutes" />
            <Step emoji="🤖" text="IA + WhatsApp automatique" />
            <Step emoji="📈" text="Chambres remplies" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
