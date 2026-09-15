import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: config.region === "europe" ? "Mentions légales | Loyavia" : "Mentions légales | Baobab Loyalty",
};

function MentionsLegalesEurope() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 15 septembre 2026</p>
      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-8 inline-block">
        Document provisoire — base à faire valider par un professionnel du droit avant mise en production commerciale.
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Mentions légales</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Éditeur du site</h2>
          <p className="text-slate-600 leading-relaxed">
            Le site <strong>loyavia.com</strong> est édité par :
          </p>
          <ul className="mt-3 space-y-1 text-slate-600">
            <li><strong>Raison sociale :</strong> [Entité juridique Loyavia — en cours de détermination]</li>
            <li><strong>Solution éditée :</strong> Loyavia (SaaS d&apos;engagement client pour hôtels — marché européen)</li>
            <li><strong>Siège social :</strong> à compléter une fois l&apos;entité juridique établie</li>
            <li><strong>Numéro d&apos;immatriculation :</strong> à compléter</li>
            <li><strong>Numéro de TVA intracommunautaire :</strong> à compléter</li>
            <li><strong>Email :</strong> <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Directeur de la publication</h2>
          <p className="text-slate-600 leading-relaxed">
            Le directeur de la publication sera le représentant légal de l&apos;entité éditrice de Loyavia, à préciser une fois celle-ci établie.
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
              <p className="text-slate-600 text-sm">Société éditrice basée aux États-Unis — données du projet Loyavia hébergées à Frankfurt, Allemagne (Union européenne)</p>
              <p className="text-slate-600 text-sm">Site : <a href="https://supabase.com" className="text-primary hover:underline">supabase.com</a></p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Propriété intellectuelle</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos, graphismes, code source) est la propriété exclusive de l&apos;entité éditrice de Loyavia et est protégé par les lois applicables en matière de propriété intellectuelle.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Toute reproduction, distribution, modification ou utilisation de ces contenus, en tout ou en partie, sans autorisation écrite préalable est strictement interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Le droit applicable aux présentes mentions légales sera précisé une fois l&apos;entité juridique éditrice de Loyavia définitivement établie. Dans l&apos;attente, et sans préjudice des dispositions impératives applicables à votre pays de résidence au sein de l&apos;Union européenne, toute question relative au présent site peut être adressée à l&apos;adresse de contact ci-dessous en vue d&apos;une résolution amiable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative au présent site, vous pouvez nous contacter à l&apos;adresse suivante :{" "}
            <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}

export default function MentionsLegalesPage() {
  if (config.region === "europe") return <MentionsLegalesEurope />;

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
            <li><strong>Raison sociale :</strong> First Digital Prod SARL</li>
            <li><strong>Solution éditée :</strong> Baobab Loyalty (SaaS d&apos;engagement client pour hôtels)</li>
            <li><strong>Siège social :</strong> Plateau, Abidjan, Côte d&apos;Ivoire</li>
            <li><strong>Numéro RCCM :</strong> En cours d&apos;enregistrement</li>
            <li><strong>Email :</strong> <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Directeur de la publication</h2>
          <p className="text-slate-600 leading-relaxed">
            Le directeur de la publication est le représentant légal de First Digital Prod SARL.
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
              <p className="text-slate-600 text-sm">Société éditrice basée aux États-Unis — données hébergées en Irlande (Union européenne)</p>
              <p className="text-slate-600 text-sm">Site : <a href="https://supabase.com" className="text-primary hover:underline">supabase.com</a></p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Propriété intellectuelle</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos, graphismes, code source) est la propriété exclusive de First Digital Prod SARL et est protégé par les lois applicables en Côte d&apos;Ivoire relatives à la propriété intellectuelle.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Toute reproduction, distribution, modification ou utilisation de ces contenus, en tout ou en partie, sans autorisation écrite préalable de First Digital Prod SARL est strictement interdite.
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
