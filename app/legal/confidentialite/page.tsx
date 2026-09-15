import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: config.region === "europe" ? "Politique de Confidentialité | Loyavia" : "Politique de Confidentialité | Baobab Loyalty",
};

function ConfidentialiteEurope() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 15 septembre 2026</p>
      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-8 inline-block">
        Document provisoire — base à faire valider par un professionnel du droit RGPD avant mise en production commerciale.
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Politique de Confidentialité</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Responsable du traitement</h2>
          <p className="text-slate-600 leading-relaxed">
            Le responsable du traitement des données personnelles est <strong>[Entité juridique Loyavia — en cours de détermination]</strong>, société éditrice et exploitante de la solution Loyavia.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            Contact : <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Données collectées</h2>
          <p className="text-slate-600 leading-relaxed mb-3">Nous collectons les données suivantes :</p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données de compte (utilisateur hôtelier)</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Nom de l&apos;hôtel</li>
                <li>Numéro de téléphone</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données de paiement</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Informations de paiement, traitées et stockées par Stripe (non accessibles par Loyavia) — facturation pas encore active à ce jour</li>
                <li>Historique des transactions, une fois la facturation activée</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données d&apos;utilisation</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Journaux de connexion et d&apos;activité</li>
                <li>Données des campagnes envoyées</li>
                <li>Statistiques de réservations</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données de mesure d&apos;audience (visiteurs du site, uniquement avec votre consentement)</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Pages consultées et parcours de navigation sur nos pages publiques</li>
                <li>Interactions avec les éléments de la page (clics, défilement)</li>
                <li>Informations techniques : type d&apos;appareil, navigateur, pays approximatif</li>
              </ul>
              <p className="text-slate-500 text-xs mt-2">
                Collectées via PostHog uniquement si vous cliquez sur « Accepter » dans le bandeau
                cookies. Aucune collecte si vous refusez ou avant votre choix. Ces outils ne
                tournent jamais dans votre espace hôtelier (tableau de bord) : ils ne touchent
                jamais les données de vos propres clients. Voir la{" "}
                <a href="/legal/cookies" className="text-primary hover:underline">politique cookies</a>.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Finalités du traitement</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li>Fourniture du service Loyavia</li>
            <li>Gestion des abonnements et de la facturation (dès son activation)</li>
            <li>Envoi d&apos;emails transactionnels (confirmation, factures)</li>
            <li>Support client et assistance technique</li>
            <li>Amélioration du service (données anonymisées)</li>
            <li>Mesure d&apos;audience de notre site web (uniquement avec votre consentement)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Base légale</h2>
          <p className="text-slate-600 leading-relaxed">
            Conformément au Règlement Général sur la Protection des Données (RGPD), le traitement de vos données est fondé sur :
          </p>
          <ul className="mt-3 space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>L&apos;exécution du contrat</strong> (art. 6.1.b RGPD) : pour vous fournir le service souscrit</li>
            <li><strong>Le consentement</strong> (art. 6.1.a RGPD) : pour la mesure d&apos;audience (PostHog) et les communications marketing, le cas échéant</li>
            <li><strong>L&apos;intérêt légitime</strong> (art. 6.1.f RGPD) : pour améliorer le service et prévenir la fraude</li>
            <li><strong>L&apos;obligation légale</strong> (art. 6.1.c RGPD) : pour la conservation des données de facturation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Durée de conservation</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Données de compte :</strong> durée de l&apos;abonnement + 3 ans après résiliation</li>
            <li><strong>Données de facturation :</strong> durée légale de conservation comptable applicable une fois l&apos;entité juridique et son pays d&apos;immatriculation connus (à confirmer)</li>
            <li><strong>Journaux d&apos;activité :</strong> 12 mois</li>
            <li><strong>Données de mesure d&apos;audience (PostHog) :</strong> durée définie par les paramètres du compte PostHog de Loyavia ; supprimées immédiatement si vous refusez le dépôt de cookies non essentiels</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Partage avec des tiers et transferts hors Union européenne</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Vos données peuvent être partagées avec les prestataires suivants, dans la stricte limite de leur mission. Pour chaque prestataire situé hors de l&apos;Union européenne, le mécanisme de transfert réellement documenté par le prestataire est indiqué :
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Prestataire</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Rôle</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Localisation & mécanisme de transfert</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200">Supabase</td>
                  <td className="p-3 border border-slate-200">Base de données & authentification</td>
                  <td className="p-3 border border-slate-200">Données hébergées à Frankfurt, Allemagne (UE) — pas de transfert hors UE pour le stockage. Société éditrice basée aux États-Unis, DPA avec clauses contractuelles types disponible.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Vercel</td>
                  <td className="p-3 border border-slate-200">Hébergement du site</td>
                  <td className="p-3 border border-slate-200">États-Unis — clauses contractuelles types (art. 46.2.c RGPD) + participation au cadre EU-US Data Privacy Framework</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Resend</td>
                  <td className="p-3 border border-slate-200">Emails transactionnels</td>
                  <td className="p-3 border border-slate-200">États-Unis — clauses contractuelles types + EU-US Data Privacy Framework</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Meta (WhatsApp)</td>
                  <td className="p-3 border border-slate-200">Envoi de messages de campagne</td>
                  <td className="p-3 border border-slate-200">États-Unis — EU-US Data Privacy Framework, clauses contractuelles types en mécanisme de repli</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">OpenRouter</td>
                  <td className="p-3 border border-slate-200">Génération de messages assistée par IA</td>
                  <td className="p-3 border border-slate-200">États-Unis (et infrastructure des fournisseurs de modèles tiers sollicités par OpenRouter) — décisions d&apos;adéquation (art. 45 RGPD) et clauses contractuelles types (art. 46 RGPD) prévues par la politique de confidentialité générale d&apos;OpenRouter, applicables à toutes les offres. Le compte utilisé par Loyavia est de niveau « pay-as-you-go » : aucun accord de sous-traitance (DPA) mutuellement signé n&apos;est en place, ce document contractuel n&apos;étant proposé par OpenRouter qu&apos;aux comptes « entreprise ». Le routage régional UE (eu.openrouter.ai) n&apos;est pas disponible sur l&apos;offre actuellement utilisée par Loyavia ; cette fonctionnalité est proposée sur les offres Business et Enterprise.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Stripe <span className="text-xs text-slate-400">(prévu, non activé)</span></td>
                  <td className="p-3 border border-slate-200">Paiements d&apos;abonnement</td>
                  <td className="p-3 border border-slate-200">Entité européenne Stripe Payments Europe Limited (Irlande) ; transferts vers les États-Unis couverts par un addendum de transfert de données (clauses contractuelles types + EU-US Data Privacy Framework)</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">PostHog</td>
                  <td className="p-3 border border-slate-200">Mesure d&apos;audience du site (uniquement avec consentement, jamais dans le tableau de bord hôtelier)</td>
                  <td className="p-3 border border-slate-200">États-Unis (aucun hébergement UE configuré à ce jour pour Loyavia ; PostHog propose une option d&apos;hébergement UE à Frankfurt, non activée) — clauses contractuelles types + participation de PostHog au cadre EU-US Data Privacy Framework.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Vos droits</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Droit à l&apos;information :</strong> être informé de manière claire des traitements réalisés (objet de la présente politique)</li>
            <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la limitation du traitement :</strong> demander la suspension temporaire d&apos;un traitement dans certains cas prévus par le RGPD</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et couramment utilisé</li>
            <li><strong>Droit d&apos;opposition :</strong> vous opposer à certains traitements, notamment ceux fondés sur l&apos;intérêt légitime</li>
            <li><strong>Droit de retirer votre consentement à tout moment :</strong> pour les traitements dont le consentement est la base légale (mesure d&apos;audience PostHog), sans affecter la licéité du traitement effectué avant ce retrait</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            <strong>Décision entièrement automatisée (art. 22 RGPD) :</strong> Loyavia utilise une segmentation automatique et une génération de messages assistée par IA, mais ce sont des outils d&apos;aide à la décision pour l&apos;hôtelier. Aucune décision individuelle entièrement automatisée produisant des effets juridiques vous concernant ou vous affectant de manière significative n&apos;est mise en œuvre à ce jour. Ce point sera réévalué si les fonctionnalités du service évoluent.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>. Vous disposez également du droit d&apos;introduire une réclamation auprès de l&apos;autorité de protection des données de votre pays de résidence au sein de l&apos;Union européenne (art. 77 RGPD). L&apos;autorité de contrôle chef de file compétente pour Loyavia sera précisée une fois l&apos;entité juridique définitivement établie.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Sécurité</h2>
          <p className="text-slate-600 leading-relaxed">
            Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction (chiffrement en transit et au repos, cloisonnement des données par hôtel, accès restreints, authentification sécurisée).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Gestion des violations de données</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour les données dont Loyavia est responsable de traitement (données de compte hôtelier, de facturation, visiteurs du site), en cas de violation de données personnelles présentant un risque pour vos droits et libertés, Loyavia notifiera l&apos;autorité de contrôle compétente dans un délai de 72 heures après en avoir eu connaissance (art. 33 RGPD), et vous informera directement si cette violation présente un risque élevé pour vos droits et libertés (art. 34 RGPD).
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Pour les données des clients finaux d&apos;un hôtel importées dans Loyavia, dont l&apos;hôtel est responsable de traitement et Loyavia sous-traitant, un régime distinct s&apos;applique : voir l&apos;<a href="/legal/dpa" className="text-primary hover:underline">accord de sous-traitance (DPA)</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Délégué à la protection des données</h2>
          <p className="text-slate-600 leading-relaxed">
            Aucun délégué à la protection des données (DPO) n&apos;est désigné à ce stade. Cette désignation sera réévaluée en fonction de l&apos;évolution de l&apos;activité et du volume réel des traitements, conformément aux critères de l&apos;article 37 du RGPD. Dans l&apos;attente, toute question ou demande relative à vos données peut être adressée à <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

export default function ConfidentialitePage() {
  if (config.region === "europe") return <ConfidentialiteEurope />;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Politique de Confidentialité</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Responsable du traitement</h2>
          <p className="text-slate-600 leading-relaxed">
            Le responsable du traitement des données personnelles est <strong>First Digital Prod SARL</strong>, société éditrice et exploitante de la solution Baobab Loyalty, dont le siège est à Abidjan, Côte d&apos;Ivoire.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            Contact : <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Données collectées</h2>
          <p className="text-slate-600 leading-relaxed mb-3">Nous collectons les données suivantes :</p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données de compte (utilisateur hôtelier)</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Nom de l&apos;hôtel</li>
                <li>Numéro de téléphone</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données de paiement</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Informations de paiement (traitées et stockées par Moneroo — non accessibles par Baobab Loyalty)</li>
                <li>Historique des transactions</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données d&apos;utilisation</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Journaux de connexion et d&apos;activité</li>
                <li>Données des campagnes envoyées</li>
                <li>Statistiques de réservations</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-700 mb-2">Données de mesure d&apos;audience (visiteurs du site, uniquement avec votre consentement)</p>
              <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                <li>Pages consultées et parcours de navigation sur nos pages publiques</li>
                <li>Interactions avec les éléments de la page (clics, défilement)</li>
                <li>Informations techniques : type d&apos;appareil, navigateur, pays approximatif</li>
              </ul>
              <p className="text-slate-500 text-xs mt-2">
                Collectées via PostHog uniquement si vous cliquez sur « Accepter » dans le bandeau
                cookies. Aucune collecte si vous refusez ou avant votre choix. Ces outils ne
                tournent jamais dans votre espace hôtelier (tableau de bord) : ils ne touchent
                jamais les données de vos propres clients. Voir la{" "}
                <a href="/legal/cookies" className="text-primary hover:underline">politique cookies</a>.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Finalités du traitement</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li>Fourniture du service Baobab Loyalty</li>
            <li>Gestion des abonnements et de la facturation</li>
            <li>Envoi d&apos;emails transactionnels (confirmation, factures)</li>
            <li>Support client et assistance technique</li>
            <li>Amélioration du service (données anonymisées)</li>
            <li>Mesure d&apos;audience de notre site web (uniquement avec votre consentement)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Base légale</h2>
          <p className="text-slate-600 leading-relaxed">
            Le traitement de vos données est fondé sur :
          </p>
          <ul className="mt-3 space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>L&apos;exécution du contrat</strong> : pour vous fournir le service souscrit</li>
            <li><strong>Le consentement</strong> : pour les communications marketing (si applicable)</li>
            <li><strong>L&apos;intérêt légitime</strong> : pour améliorer le service et prévenir la fraude</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            Le traitement est conforme à la législation ivoirienne en vigueur sur la protection des données personnelles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Durée de conservation</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Données de compte :</strong> durée de l&apos;abonnement + 3 ans après résiliation</li>
            <li><strong>Données de facturation :</strong> 10 ans (obligation légale comptable)</li>
            <li><strong>Journaux d&apos;activité :</strong> 12 mois</li>
            <li><strong>Données de mesure d&apos;audience (PostHog) :</strong> durée définie par les paramètres du compte PostHog de Baobab Loyalty ; supprimées immédiatement si vous refusez le dépôt de cookies non essentiels</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Partage avec des tiers</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Vos données peuvent être partagées avec les prestataires suivants, dans la stricte limite de leur mission :
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Prestataire</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Rôle</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Pays</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200">Moneroo</td>
                  <td className="p-3 border border-slate-200">Paiements en ligne (Mobile Money)</td>
                  <td className="p-3 border border-slate-200">Afrique</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Supabase</td>
                  <td className="p-3 border border-slate-200">Base de données & authentification</td>
                  <td className="p-3 border border-slate-200">Irlande, Union européenne (société éditrice basée aux États-Unis)</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Resend</td>
                  <td className="p-3 border border-slate-200">Emails transactionnels</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Vercel</td>
                  <td className="p-3 border border-slate-200">Hébergement</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Meta (WhatsApp)</td>
                  <td className="p-3 border border-slate-200">Envoi de messages</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">OpenRouter</td>
                  <td className="p-3 border border-slate-200">Génération de messages IA</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">PostHog</td>
                  <td className="p-3 border border-slate-200">Mesure d&apos;audience du site (uniquement avec consentement, jamais dans le tableau de bord hôtelier)</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Vos droits</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Conformément à la législation applicable, vous disposez des droits suivants :
          </p>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d&apos;opposition :</strong> vous opposer à certains traitements</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Sécurité</h2>
          <p className="text-slate-600 leading-relaxed">
            Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction (chiffrement en transit et au repos, accès restreints, authentification sécurisée).
          </p>
        </section>

      </div>
    </main>
  );
}
