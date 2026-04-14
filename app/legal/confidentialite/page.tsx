import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Baobab Loyalty",
};

export default function ConfidentialitePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Politique de Confidentialité</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Responsable du traitement</h2>
          <p className="text-slate-600 leading-relaxed">
            Le responsable du traitement des données personnelles est <strong>Baobab Loyalty SAS</strong>, dont le siège est à Abidjan, Côte d&apos;Ivoire.
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
                  <td className="p-3 border border-slate-200">États-Unis</td>
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
