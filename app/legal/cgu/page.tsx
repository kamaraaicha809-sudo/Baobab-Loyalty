import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | Baobab Loyalty",
};

export default function CGUPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Conditions Générales d&apos;Utilisation</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>Baobab Loyalty</strong>, éditée par Baobab Loyalty SAS, dont le siège est à Abidjan, Côte d&apos;Ivoire.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Baobab Loyalty est une solution SaaS d&apos;engagement client destinée aux hôtels et établissements d&apos;hébergement, permettant de gérer des campagnes WhatsApp, de segmenter une base clients et de générer des réservations directes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Accès et inscription</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;accès à la plateforme nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            L&apos;utilisateur est responsable de toutes les actions effectuées depuis son compte. Il s&apos;engage à informer immédiatement Baobab Loyalty de tout usage non autorisé de son compte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Utilisation acceptable</h2>
          <p className="text-slate-600 leading-relaxed">L&apos;utilisateur s&apos;engage à :</p>
          <ul className="mt-3 space-y-2 text-slate-600 list-disc list-inside">
            <li>Utiliser la plateforme uniquement à des fins professionnelles légitimes</li>
            <li>Ne pas envoyer de messages non sollicités (spam) via WhatsApp</li>
            <li>Respecter les conditions d&apos;utilisation de WhatsApp Business API</li>
            <li>Ne pas importer de données clients obtenues illégalement</li>
            <li>Ne pas tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
            <li>Respecter les lois applicables en matière de protection des données personnelles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Responsabilités</h2>
          <p className="text-slate-600 leading-relaxed">
            <strong>Baobab Loyalty SAS</strong> s&apos;engage à fournir la plateforme avec le meilleur niveau de disponibilité possible. Cependant, la société ne peut être tenue responsable des interruptions de service dues à des événements hors de son contrôle (pannes d&apos;infrastructure, force majeure).
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            <strong>L&apos;utilisateur</strong> est seul responsable des messages envoyés à ses clients via la plateforme et du respect des réglementations applicables (consentement des destinataires, etc.).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Propriété des données</h2>
          <p className="text-slate-600 leading-relaxed">
            Les données clients importées par l&apos;utilisateur (base clients hôtel) restent sa propriété exclusive. Baobab Loyalty SAS ne revendique aucun droit sur ces données et s&apos;engage à ne pas les utiliser à des fins commerciales propres.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Modification du service</h2>
          <p className="text-slate-600 leading-relaxed">
            Baobab Loyalty SAS se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service, avec un préavis raisonnable sauf en cas d&apos;urgence. Les modifications substantielles des CGU seront notifiées par email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Résiliation</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;utilisateur peut résilier son compte à tout moment depuis la page de gestion de son abonnement. Baobab Loyalty SAS peut suspendre ou résilier un compte en cas de violation des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes CGU sont régies par le droit ivoirien et le droit OHADA. Tout litige sera soumis à la compétence exclusive des tribunaux d&apos;Abidjan, Côte d&apos;Ivoire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative aux présentes CGU :{" "}
            <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}
