import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Baobab Loyalty",
};

export default function CGVPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Conditions Générales de Vente</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes d&apos;abonnements à la plateforme Baobab Loyalty, éditée par Baobab Loyalty SAS, Abidjan, Côte d&apos;Ivoire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Offres et tarifs</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Baobab Loyalty propose trois formules d&apos;abonnement mensuel, facturées en Francs CFA (FCFA) :
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Plan</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Prix / mois</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Chambres</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium">Essentiel</td>
                  <td className="p-3 border border-slate-200">29 000 FCFA</td>
                  <td className="p-3 border border-slate-200">Jusqu&apos;à 30 chambres</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium">Croissance</td>
                  <td className="p-3 border border-slate-200">49 000 FCFA</td>
                  <td className="p-3 border border-slate-200">Jusqu&apos;à 100 chambres</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium">Premium</td>
                  <td className="p-3 border border-slate-200">69 000 FCFA</td>
                  <td className="p-3 border border-slate-200">Illimité</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-500 text-sm mt-3">
            Les tarifs sont indiqués toutes taxes comprises (TTC). Baobab Loyalty SAS se réserve le droit de modifier ses tarifs, avec préavis de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Modalités de paiement</h2>
          <p className="text-slate-600 leading-relaxed">
            Les paiements sont traités de manière sécurisée via <strong>Moneroo</strong>. Les modes de paiement acceptés sont : Mobile Money (Orange Money, MTN Money, Wave) et carte bancaire.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            L&apos;abonnement est renouvelé automatiquement chaque mois à la date anniversaire de souscription. Une facture est envoyée par email à chaque renouvellement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Garantie résultats</h2>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-slate-700 leading-relaxed font-medium mb-1">
              Garantie "2 nuits ou mois offert"
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Si Baobab Loyalty ne vous génère pas au moins 2 réservations directes supplémentaires au cours d&apos;un mois calendaire, le mois suivant vous est offert automatiquement. Cette garantie s&apos;applique dès le premier mois complet d&apos;utilisation, à condition que votre base clients ait été correctement importée et qu&apos;au moins une campagne ait été envoyée.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Droit de rétractation</h2>
          <p className="text-slate-600 leading-relaxed">
            Conformément aux dispositions applicables, vous disposez d&apos;un délai de <strong>14 jours</strong> à compter de la souscription pour exercer votre droit de rétractation, sans avoir à justifier de motif.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Pour exercer ce droit, envoyez un email à <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a> avec votre demande explicite de rétractation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Politique de remboursement</h2>
          <p className="text-slate-600 leading-relaxed">
            Hors exercice du droit de rétractation, les abonnements ne sont pas remboursables. En cas d&apos;interruption de service imputable à Baobab Loyalty SAS d&apos;une durée supérieure à 48 heures consécutives, une compensation proportionnelle sera accordée sous forme d&apos;avoir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Résiliation</h2>
          <p className="text-slate-600 leading-relaxed">
            Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. La résiliation prend effet à la fin de la période d&apos;abonnement en cours. Aucun remboursement au prorata ne sera effectué pour les jours non utilisés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Droit applicable et litiges</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes CGV sont régies par le droit ivoirien et le droit OHADA. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de la juridiction d&apos;Abidjan, Côte d&apos;Ivoire, seront seuls compétents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative aux présentes CGV :{" "}
            <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}
