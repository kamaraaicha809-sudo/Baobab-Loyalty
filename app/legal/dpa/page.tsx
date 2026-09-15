import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: config.region === "europe" ? "Accord de sous-traitance (DPA) | Loyavia" : "Accord de sous-traitance (DPA) | Baobab Loyalty",
};

function DPAEurope() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 15 septembre 2026</p>
      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-8 inline-block">
        Document provisoire — base à faire valider par un professionnel du droit RGPD avant mise en production commerciale.
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Accord de sous-traitance des données (DPA)</h1>
      <p className="text-slate-500 mb-10">
        Ce document précise les rôles et obligations de chaque partie concernant les données personnelles des clients de l&apos;hôtel traitées via Loyavia. Il fait partie intégrante des <a href="/legal/cgu" className="text-primary hover:underline">CGU</a> et des <a href="/legal/cgv" className="text-primary hover:underline">CGV</a> et s&apos;applique automatiquement à tout compte hôtelier créé sur la plateforme.
      </p>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Les parties et leurs rôles</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Dans le cadre de l&apos;utilisation de Loyavia, trois niveaux distincts s&apos;appliquent aux données personnelles des clients de l&apos;hôtel (nom, numéro de téléphone/WhatsApp, email, historique de séjour) :
          </p>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>L&apos;hôtel</strong> (le client de Loyavia) est <strong>responsable du traitement</strong> au sens de l&apos;article 4 du RGPD : c&apos;est lui qui collecte les données de ses clients (à la réservation, à l&apos;accueil, etc.) et qui décide de la finalité (fidélisation, relance, campagnes).</li>
            <li><strong>[Entité juridique Loyavia — en cours de détermination]</strong> (société éditrice et exploitante de Loyavia) agit en tant que <strong>sous-traitant</strong> de l&apos;hôtel : elle traite ces données uniquement pour le compte de l&apos;hôtel, sur ses instructions, afin de fournir le service (segmentation, génération de messages, envoi de campagnes WhatsApp, suivi des réservations).</li>
            <li><strong>Les sous-traitants ultérieurs</strong> de Loyavia (listés à l&apos;article 4) interviennent uniquement pour l&apos;exécution technique du service, sur instruction de Loyavia et avec l&apos;autorisation générale de l&apos;hôtel.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Description du traitement</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium text-slate-700 w-1/3">Nature des opérations</td>
                  <td className="p-3 border border-slate-200">Import, stockage, segmentation, génération de messages, envoi de campagnes WhatsApp/email, suivi des réservations et des redemptions</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Finalité</td>
                  <td className="p-3 border border-slate-200">Fidélisation et relance des clients de l&apos;hôtel pour le compte de l&apos;hôtel</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Catégories de personnes concernées</td>
                  <td className="p-3 border border-slate-200">Clients ayant réservé ou séjourné dans l&apos;hôtel</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Catégories de données</td>
                  <td className="p-3 border border-slate-200">Nom, numéro de téléphone/WhatsApp, email, date et fréquence de séjour, historique de réservation</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Durée du traitement</td>
                  <td className="p-3 border border-slate-200">Durée de l&apos;abonnement de l&apos;hôtel à Loyavia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Obligations de Loyavia (sous-traitant)</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li>Traiter les données uniquement sur instruction documentée de l&apos;hôtel, et pour les finalités prévues par le contrat</li>
            <li>Garantir la confidentialité des données (accès restreint aux personnes habilitées)</li>
            <li>Mettre en œuvre les mesures de sécurité décrites à l&apos;article 5</li>
            <li>Ne recourir à un sous-traitant ultérieur qu&apos;avec l&apos;autorisation générale de l&apos;hôtel (liste à l&apos;article 4), et lui imposer des obligations équivalentes</li>
            <li>Assister l&apos;hôtel dans la réponse aux demandes d&apos;exercice des droits de ses clients (accès, rectification, effacement, opposition, limitation, portabilité)</li>
            <li>Notifier l&apos;hôtel <strong>sans délai injustifié</strong> dès qu&apos;elle a connaissance d&apos;une violation de données concernant ses clients, avec les informations nécessaires pour permettre à l&apos;hôtel de remplir lui-même ses obligations de notification à l&apos;autorité de contrôle (art. 33 RGPD) et, le cas échéant, aux personnes concernées (art. 34 RGPD) — voir article 8</li>
            <li>Supprimer ou restituer l&apos;ensemble des données à la fin du contrat, sauf obligation légale de conservation (ex : facturation)</li>
            <li>Mettre à disposition de l&apos;hôtel les informations nécessaires pour démontrer le respect de ces obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Sous-traitants ultérieurs autorisés</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            L&apos;hôtel autorise expressément Loyavia à recourir aux sous-traitants ultérieurs suivants, nécessaires au fonctionnement du service. Pour chacun, le mécanisme de transfert hors UE réellement documenté par le prestataire est indiqué :
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
                  <td className="p-3 border border-slate-200">Hébergement base de données & authentification</td>
                  <td className="p-3 border border-slate-200">Frankfurt, Allemagne (UE) — pas de transfert hors UE pour le stockage. Société éditrice basée aux États-Unis, DPA avec clauses contractuelles types disponible.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Vercel</td>
                  <td className="p-3 border border-slate-200">Hébergement de l&apos;application</td>
                  <td className="p-3 border border-slate-200">États-Unis — clauses contractuelles types (art. 46.2.c RGPD) + EU-US Data Privacy Framework</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Meta (WhatsApp Business Platform)</td>
                  <td className="p-3 border border-slate-200">Envoi des messages de campagne</td>
                  <td className="p-3 border border-slate-200">États-Unis — EU-US Data Privacy Framework, clauses contractuelles types en mécanisme de repli</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Resend</td>
                  <td className="p-3 border border-slate-200">Envoi d&apos;emails transactionnels</td>
                  <td className="p-3 border border-slate-200">États-Unis — clauses contractuelles types + EU-US Data Privacy Framework</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">OpenRouter</td>
                  <td className="p-3 border border-slate-200">Génération assistée par IA des messages de campagne</td>
                  <td className="p-3 border border-slate-200">États-Unis (et infrastructure des fournisseurs de modèles tiers sollicités par OpenRouter) — décisions d&apos;adéquation (art. 45 RGPD) et clauses contractuelles types (art. 46 RGPD) prévues par la politique de confidentialité générale d&apos;OpenRouter. Le compte Loyavia est de niveau « pay-as-you-go » : aucun accord de sous-traitance (DPA) mutuellement signé n&apos;est en place avec OpenRouter à ce jour, ce document n&apos;étant proposé qu&apos;aux comptes « entreprise ». Cette situation devra être réévaluée si Loyavia souscrit une offre Business ou Enterprise.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Stripe <span className="text-xs text-slate-400">(prévu, non activé)</span></td>
                  <td className="p-3 border border-slate-200">Traitement des paiements d&apos;abonnement, une fois activé</td>
                  <td className="p-3 border border-slate-200">Stripe Payments Europe Limited (Irlande) ; transferts vers les États-Unis couverts par addendum de transfert (clauses contractuelles types + EU-US Data Privacy Framework)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed mt-3">
            Loyavia informera l&apos;hôtel de tout changement prévu concernant l&apos;ajout ou le remplacement d&apos;un sous-traitant ultérieur, lui donnant ainsi la possibilité de s&apos;y opposer.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            PostHog (mesure d&apos;audience du site public de Loyavia) n&apos;apparaît pas
            dans ce tableau : il ne reçoit et ne traite jamais les données des clients de
            l&apos;hôtel, qui restent exclusivement dans l&apos;espace hôtelier (tableau de bord),
            zone dans laquelle cet outil ne fonctionne à aucun moment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Sécurité</h2>
          <p className="text-slate-600 leading-relaxed">
            Loyavia met en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données en transit et au repos, cloisonnement des données par hôtel (row-level security), authentification sécurisée, journalisation des accès, gestion restreinte des secrets d&apos;accès et sauvegardes régulières.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Obligations de l&apos;hôtel (responsable de traitement)</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li>S&apos;assurer que les données de ses clients importées dans Loyavia ont été collectées licitement</li>
            <li>Informer ses clients de l&apos;utilisation de leurs coordonnées pour des campagnes de fidélisation (WhatsApp/email)</li>
            <li>Traiter les demandes d&apos;exercice des droits (accès, rectification, effacement, opposition, limitation, portabilité) reçues directement de ses clients, avec l&apos;assistance de Loyavia le cas échéant</li>
            <li>Assumer la notification à l&apos;autorité de contrôle compétente (art. 33 RGPD) et, le cas échéant, aux personnes concernées (art. 34 RGPD) en cas de violation de données concernant ses clients, sur la base des informations transmises par Loyavia — voir article 8</li>
            <li>Ne pas importer de catégories de données non nécessaires à la finalité du service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Sort des données en fin de contrat</h2>
          <p className="text-slate-600 leading-relaxed">
            À la résiliation de l&apos;abonnement, l&apos;hôtel peut demander l&apos;export de sa base clients. À défaut de demande dans un délai de 30 jours, les données sont supprimées, sauf celles devant être conservées au titre d&apos;une obligation légale (données de facturation).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Gestion des violations de données — répartition des obligations</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Le RGPD distingue les obligations du responsable de traitement (l&apos;hôtel) et celles du sous-traitant (Loyavia) en cas de violation concernant les données des clients de l&apos;hôtel :
          </p>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Loyavia (sous-traitant)</strong> notifie l&apos;hôtel sans délai injustifié dès qu&apos;elle a connaissance d&apos;une violation, en fournissant une description de l&apos;incident, les catégories et le volume approximatif de données et de personnes concernées, ainsi que les mesures prises ou proposées. Loyavia n&apos;a pas d&apos;obligation de notifier directement l&apos;autorité de contrôle pour ces données : ce n&apos;est pas elle qui en est responsable de traitement.</li>
            <li><strong>L&apos;hôtel (responsable de traitement)</strong> évalue le risque pour les droits et libertés de ses clients et, si nécessaire, notifie l&apos;autorité de contrôle compétente dans un délai de 72 heures (art. 33 RGPD) et les personnes concernées en cas de risque élevé (art. 34 RGPD). Loyavia assiste l&apos;hôtel dans cette démarche sur demande.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Le droit applicable au présent accord sera précisé une fois l&apos;entité juridique éditrice de Loyavia définitivement établie, dans les mêmes conditions que les <a href="/legal/cgu" className="text-primary hover:underline">CGU</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative au présent accord de sous-traitance :{" "}
            <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}

export default function DPAPage() {
  if (config.region === "europe") return <DPAEurope />;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 27 août 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Accord de sous-traitance des données (DPA)</h1>
      <p className="text-slate-500 mb-10">
        Ce document précise les rôles et obligations de chaque partie concernant les données personnelles des clients de l&apos;hôtel traitées via Baobab Loyalty. Il fait partie intégrante des <a href="/legal/cgu" className="text-primary hover:underline">CGU</a> et des <a href="/legal/cgv" className="text-primary hover:underline">CGV</a> et s&apos;applique automatiquement à tout compte hôtelier créé sur la plateforme.
      </p>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Les parties et leurs rôles</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Dans le cadre de l&apos;utilisation de Baobab Loyalty, deux rôles distincts s&apos;appliquent aux données personnelles des clients de l&apos;hôtel (nom, numéro de téléphone/WhatsApp, email, historique de séjour) :
          </p>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>L&apos;hôtel</strong> (le client de Baobab Loyalty) est <strong>responsable du traitement</strong> : c&apos;est lui qui collecte les données de ses clients (à la réservation, à l&apos;accueil, etc.) et qui décide de la finalité (fidélisation, relance, campagnes).</li>
            <li><strong>First Digital Prod SARL</strong> (société éditrice et exploitante de Baobab Loyalty) agit en tant que <strong>sous-traitant</strong> : elle traite ces données uniquement pour le compte de l&apos;hôtel, sur ses instructions, afin de fournir le service (segmentation, génération de messages, envoi de campagnes WhatsApp, suivi des réservations).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Description du traitement</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium text-slate-700 w-1/3">Nature des opérations</td>
                  <td className="p-3 border border-slate-200">Import, stockage, segmentation, génération de messages, envoi de campagnes WhatsApp/email, suivi des réservations et des redemptions</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Finalité</td>
                  <td className="p-3 border border-slate-200">Fidélisation et relance des clients de l&apos;hôtel pour le compte de l&apos;hôtel</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Catégories de personnes concernées</td>
                  <td className="p-3 border border-slate-200">Clients ayant réservé ou séjourné dans l&apos;hôtel</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Catégories de données</td>
                  <td className="p-3 border border-slate-200">Nom, numéro de téléphone/WhatsApp, email, date et fréquence de séjour, historique de réservation</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium text-slate-700">Durée du traitement</td>
                  <td className="p-3 border border-slate-200">Durée de l&apos;abonnement de l&apos;hôtel à Baobab Loyalty</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Obligations de Baobab Loyalty (sous-traitant)</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li>Traiter les données uniquement sur instruction documentée de l&apos;hôtel, et pour les finalités prévues par le contrat</li>
            <li>Garantir la confidentialité des données (accès restreint aux personnes habilitées)</li>
            <li>Mettre en œuvre les mesures de sécurité décrites à l&apos;article 5</li>
            <li>Ne recourir à un sous-traitant ultérieur qu&apos;avec l&apos;autorisation générale de l&apos;hôtel (liste à l&apos;article 4), et lui imposer des obligations équivalentes</li>
            <li>Assister l&apos;hôtel dans la réponse aux demandes d&apos;exercice des droits de ses clients (accès, rectification, effacement, opposition)</li>
            <li>Notifier l&apos;hôtel dans les meilleurs délais en cas de violation de données concernant ses clients</li>
            <li>Supprimer ou restituer l&apos;ensemble des données à la fin du contrat, sauf obligation légale de conservation (ex : facturation)</li>
            <li>Mettre à disposition de l&apos;hôtel les informations nécessaires pour démontrer le respect de ces obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Sous-traitants ultérieurs autorisés</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            L&apos;hôtel autorise expressément Baobab Loyalty à recourir aux sous-traitants ultérieurs suivants, nécessaires au fonctionnement du service :
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Prestataire</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Rôle</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Localisation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200">Supabase</td>
                  <td className="p-3 border border-slate-200">Hébergement base de données & authentification</td>
                  <td className="p-3 border border-slate-200">Irlande, Union européenne (société éditrice basée aux États-Unis)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Vercel</td>
                  <td className="p-3 border border-slate-200">Hébergement de l&apos;application</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Meta (WhatsApp Business Platform)</td>
                  <td className="p-3 border border-slate-200">Envoi des messages de campagne</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Resend</td>
                  <td className="p-3 border border-slate-200">Envoi d&apos;emails transactionnels</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">OpenRouter</td>
                  <td className="p-3 border border-slate-200">Génération assistée par IA des messages de campagne</td>
                  <td className="p-3 border border-slate-200">États-Unis</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Moneroo (Axa Zara LLC)</td>
                  <td className="p-3 border border-slate-200">Traitement des paiements d&apos;abonnement et du frais d&apos;intégration</td>
                  <td className="p-3 border border-slate-200">États-Unis (Delaware)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed mt-3">
            Baobab Loyalty informera l&apos;hôtel de tout changement prévu concernant l&apos;ajout ou le remplacement d&apos;un sous-traitant ultérieur, lui donnant ainsi la possibilité de s&apos;y opposer.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            PostHog (mesure d&apos;audience du site public de Baobab Loyalty) n&apos;apparaît pas
            dans ce tableau : il ne reçoit et ne traite jamais les données des clients de
            l&apos;hôtel, qui restent exclusivement dans l&apos;espace hôtelier (tableau de bord),
            zone dans laquelle cet outil ne fonctionne à aucun moment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Sécurité</h2>
          <p className="text-slate-600 leading-relaxed">
            Baobab Loyalty met en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données en transit et au repos, cloisonnement des données par hôtel (row-level security), authentification sécurisée, journalisation des accès, gestion restreinte des secrets d&apos;accès et sauvegardes régulières.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Obligations de l&apos;hôtel (responsable de traitement)</h2>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li>S&apos;assurer que les données de ses clients importées dans Baobab Loyalty ont été collectées licitement</li>
            <li>Informer ses clients de l&apos;utilisation de leurs coordonnées pour des campagnes de fidélisation (WhatsApp/email)</li>
            <li>Traiter les demandes d&apos;opposition ou de désinscription reçues directement de ses clients, avec l&apos;assistance de Baobab Loyalty le cas échéant</li>
            <li>Ne pas importer de catégories de données non nécessaires à la finalité du service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Sort des données en fin de contrat</h2>
          <p className="text-slate-600 leading-relaxed">
            À la résiliation de l&apos;abonnement, l&apos;hôtel peut demander l&apos;export de sa base clients. À défaut de demande dans un délai de 30 jours, les données sont supprimées, sauf celles devant être conservées au titre d&apos;une obligation légale (données de facturation).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Le présent accord est régi par le droit ivoirien et le droit OHADA, dans les mêmes conditions que les <a href="/legal/cgu" className="text-primary hover:underline">CGU</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative au présent accord de sous-traitance :{" "}
            <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}
