import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: config.region === "europe" ? "Conditions Générales d'Utilisation | Loyavia" : "Conditions Générales d'Utilisation | Baobab Loyalty",
};

function CGUEurope() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 15 septembre 2026</p>
      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-8 inline-block">
        Document provisoire — base à faire valider par un professionnel du droit avant mise en production commerciale.
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Conditions Générales d&apos;Utilisation</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>Loyavia</strong>, éditée par [Entité juridique Loyavia — en cours de détermination].
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Loyavia est une solution SaaS d&apos;engagement client destinée aux hôtels et établissements d&apos;hébergement, permettant de gérer des campagnes WhatsApp, de segmenter une base clients et de générer des réservations directes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Accès et inscription</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;accès à la plateforme nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            L&apos;utilisateur est responsable de toutes les actions effectuées depuis son compte. Il s&apos;engage à informer immédiatement Loyavia de tout usage non autorisé de son compte.
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
            <li>Respecter le RGPD et les réglementations applicables en matière de protection des données personnelles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Responsabilités</h2>
          <p className="text-slate-600 leading-relaxed">
            <strong>Loyavia</strong> s&apos;engage à fournir la plateforme avec le meilleur niveau de disponibilité possible. Cependant, l&apos;éditeur ne peut être tenu responsable des interruptions de service dues à des événements hors de son contrôle (pannes d&apos;infrastructure, force majeure).
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            <strong>L&apos;utilisateur</strong> est seul responsable des messages envoyés à ses clients via la plateforme et du respect des réglementations applicables (consentement des destinataires, etc.).
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Concernant les données personnelles des clients de l&apos;hôtel importées dans la plateforme, l&apos;hôtel agit en tant que responsable du traitement et Loyavia en tant que sous-traitant : voir le détail des rôles et obligations respectifs dans l&apos;<a href="/legal/dpa" className="text-primary hover:underline">accord de sous-traitance (DPA)</a>, qui fait partie intégrante des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Propriété des données</h2>
          <p className="text-slate-600 leading-relaxed">
            Les données clients importées par l&apos;utilisateur (base clients hôtel) restent sa propriété exclusive. Loyavia ne revendique aucun droit sur ces données et s&apos;engage à ne pas les utiliser à des fins commerciales propres.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Modification du service</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;éditeur de Loyavia se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service, avec un préavis raisonnable sauf en cas d&apos;urgence. Les modifications substantielles des CGU seront notifiées par email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Résiliation</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;utilisateur peut résilier son compte à tout moment depuis la page de gestion de son abonnement. L&apos;éditeur de Loyavia peut suspendre ou résilier un compte en cas de violation des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Le droit applicable aux présentes CGU sera précisé une fois l&apos;entité juridique éditrice de Loyavia définitivement établie. Dans l&apos;attente, et sans préjudice des dispositions impératives de protection du consommateur ou du client professionnel applicables à votre pays de résidence au sein de l&apos;Union européenne, tout différend sera d&apos;abord traité de bonne foi par voie amiable via l&apos;adresse de contact ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative aux présentes CGU :{" "}
            <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}

export default function CGUPage() {
  if (config.region === "europe") return <CGUEurope />;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Conditions Générales d&apos;Utilisation</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>Baobab Loyalty</strong>, éditée par First Digital Prod SARL, dont le siège est à Abidjan, Côte d&apos;Ivoire.
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
            <strong>First Digital Prod SARL</strong> s&apos;engage à fournir la plateforme avec le meilleur niveau de disponibilité possible. Cependant, la société ne peut être tenue responsable des interruptions de service dues à des événements hors de son contrôle (pannes d&apos;infrastructure, force majeure).
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            <strong>L&apos;utilisateur</strong> est seul responsable des messages envoyés à ses clients via la plateforme et du respect des réglementations applicables (consentement des destinataires, etc.).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Propriété des données</h2>
          <p className="text-slate-600 leading-relaxed">
            Les données clients importées par l&apos;utilisateur (base clients hôtel) restent sa propriété exclusive. First Digital Prod SARL ne revendique aucun droit sur ces données et s&apos;engage à ne pas les utiliser à des fins commerciales propres.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Modification du service</h2>
          <p className="text-slate-600 leading-relaxed">
            First Digital Prod SARL se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service, avec un préavis raisonnable sauf en cas d&apos;urgence. Les modifications substantielles des CGU seront notifiées par email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Résiliation</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;utilisateur peut résilier son compte à tout moment depuis la page de gestion de son abonnement. First Digital Prod SARL peut suspendre ou résilier un compte en cas de violation des présentes CGU.
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
