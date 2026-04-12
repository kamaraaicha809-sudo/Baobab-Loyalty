import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Baobab Loyalty",
};

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Mentions légales</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Éditeur du site</h2>
          <p className="text-slate-600 leading-relaxed">
            Le site <strong>baobabloyalty.com</strong> est édité par :
          </p>
          <ul className="mt-3 space-y-1 text-slate-600">
            <li><strong>Raison sociale :</strong> Baobab Loyalty SAS</li>
            <li><strong>Siège social :</strong> Plateau, Abidjan, Côte d&apos;Ivoire</li>
            <li><strong>Numéro RCCM :</strong> En cours d&apos;enregistrement</li>
            <li><strong>Email :</strong> <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Directeur de la publication</h2>
          <p className="text-slate-600 leading-relaxed">
            Le directeur de la publication est le représentant légal de Baobab Loyalty SAS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Hébergement</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Le site est hébergé par :
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-700">Vercel Inc. (hébergement frontend)</p>
              <p className="text-slate-600 text-sm">440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
              <p className="text-slate-600 text-sm">Site : <a href="https://vercel.com" className="text-primary hover:underline">vercel.com</a></p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Supabase Inc. (base de données)</p>
              <p className="text-slate-600 text-sm">970 Toa Payoh North, Singapour</p>
              <p className="text-slate-600 text-sm">Site : <a href="https://supabase.com" className="text-primary hover:underline">supabase.com</a></p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Propriété intellectuelle</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos, graphismes, code source) est la propriété exclusive de Baobab Loyalty SAS et est protégé par les lois applicables en Côte d&apos;Ivoire relatives à la propriété intellectuelle.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Toute reproduction, distribution, modification ou utilisation de ces contenus, en tout ou en partie, sans autorisation écrite préalable de Baobab Loyalty SAS est strictement interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes mentions légales sont régies par le droit ivoirien et le droit OHADA. En cas de litige, les tribunaux compétents de la juridiction d&apos;Abidjan seront seuls compétents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative au présent site, vous pouvez nous contacter à l&apos;adresse suivante :{" "}
            <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}
