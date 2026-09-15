import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: config.region === "europe" ? "Conditions Générales de Vente | Loyavia" : "Conditions Générales de Vente | Baobab Loyalty",
};

function CGVEurope() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 15 septembre 2026</p>
      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-8 inline-block">
        Document provisoire — base à faire valider par un professionnel du droit avant mise en production commerciale. La facturation Loyavia n&apos;est pas encore activée à ce jour (Stripe en cours d&apos;activation) : aucun paiement réel n&apos;est actuellement possible.
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Conditions Générales de Vente</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes d&apos;abonnements à la plateforme Loyavia, éditée par [Entité juridique Loyavia — en cours de détermination].
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Offres et tarifs</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Loyavia propose trois formules d&apos;abonnement mensuel, facturées en euros (€) :
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Plan</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Prix HT / mois</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Essai gratuit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium">Starter</td>
                  <td className="p-3 border border-slate-200">79 € HT</td>
                  <td className="p-3 border border-slate-200">14 jours</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium">Professional</td>
                  <td className="p-3 border border-slate-200">149 € HT</td>
                  <td className="p-3 border border-slate-200">14 jours</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium">Business</td>
                  <td className="p-3 border border-slate-200">349 € HT</td>
                  <td className="p-3 border border-slate-200">14 jours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-500 text-sm mt-3">
            Les tarifs ci-dessus sont exprimés hors taxes (HT). Le régime de TVA applicable (taux, mécanisme d&apos;autoliquidation ou guichet unique européen le cas échéant) sera précisé une fois l&apos;entité juridique éditrice de Loyavia et son pays d&apos;immatriculation définitivement établis. L&apos;éditeur se réserve le droit de modifier ses tarifs, avec un préavis de 30 jours.
          </p>
          <p className="text-slate-600 leading-relaxed mt-4 text-sm bg-amber-50 border border-amber-100 rounded-lg p-3">
            La différenciation précise des fonctionnalités incluses par plan (quotas de campagnes, nombre de chambres, etc.) n&apos;est pas encore finalisée pour le marché européen et sera complétée dans une prochaine version des présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Modalités de paiement</h2>
          <p className="text-slate-600 leading-relaxed">
            Les paiements sont destinés à être traités de manière sécurisée via <strong>Stripe</strong> (carte bancaire). Cette intégration est en cours d&apos;activation : à ce jour, aucun abonnement payant ne peut être souscrit.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Une fois la facturation activée, l&apos;abonnement sera renouvelé automatiquement chaque mois à la date anniversaire de souscription, et une facture sera envoyée par email à chaque renouvellement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Garantie résultats</h2>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-slate-700 leading-relaxed font-medium mb-1">
              Garantie &quot;2 réservations ou mois offert&quot;
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Si Loyavia ne vous génère pas au moins 2 réservations directes supplémentaires au cours d&apos;un mois calendaire, le mois suivant vous est offert automatiquement. Cette garantie s&apos;applique dès le premier mois complet d&apos;utilisation, à condition que votre base clients ait été correctement importée et qu&apos;au moins une campagne ait été envoyée. Elle ne pourra s&apos;appliquer concrètement qu&apos;à compter de l&apos;activation de la facturation.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Droit de rétractation</h2>
          <p className="text-slate-600 leading-relaxed">
            Loyavia accorde volontairement, à titre d&apos;engagement commercial, un délai de <strong>14 jours</strong> à compter de la souscription pour exercer un droit de rétractation, sans avoir à justifier de motif. La pertinence et la portée exacte de cet engagement pour une clientèle professionnelle (hôtels) seront confirmées par un professionnel du droit.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            Pour exercer ce droit, envoyez un email à <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a> avec votre demande explicite de rétractation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Politique de remboursement</h2>
          <p className="text-slate-600 leading-relaxed">
            Hors exercice du droit de rétractation, les abonnements ne sont pas remboursables. En cas d&apos;interruption de service imputable à l&apos;éditeur de Loyavia d&apos;une durée supérieure à 48 heures consécutives, une compensation proportionnelle sera accordée sous forme d&apos;avoir.
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
            Le droit applicable aux présentes CGV sera précisé une fois l&apos;entité juridique éditrice de Loyavia définitivement établie. Dans l&apos;attente, et sans préjudice des dispositions impératives de protection du consommateur ou du client professionnel applicables à votre pays de résidence au sein de l&apos;Union européenne, tout litige sera d&apos;abord traité de bonne foi par voie amiable via l&apos;adresse de contact ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative aux présentes CGV :{" "}
            <a href="mailto:support@loyavia.com" className="text-primary hover:underline">support@loyavia.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}

export default function CGVPage() {
  if (config.region === "europe") return <CGVEurope />;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Conditions Générales de Vente</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes d&apos;abonnements à la plateforme Baobab Loyalty, éditée par First Digital Prod SARL, Abidjan, Côte d&apos;Ivoire.
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
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Prix HT / mois</th>
                  <th className="text-left p-3 border border-slate-200 font-medium text-slate-700">Chambres</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium">Starter</td>
                  <td className="p-3 border border-slate-200">39 000 FCFA HT</td>
                  <td className="p-3 border border-slate-200">Jusqu&apos;à 30 chambres</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200 font-medium">Pro</td>
                  <td className="p-3 border border-slate-200">69 000 FCFA HT</td>
                  <td className="p-3 border border-slate-200">Jusqu&apos;à 60 chambres</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200 font-medium">Premium</td>
                  <td className="p-3 border border-slate-200">189 000 FCFA HT</td>
                  <td className="p-3 border border-slate-200">Illimité</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-500 text-sm mt-3">
            Les tarifs ci-dessus sont exprimés hors taxes (HT). Le régime fiscal de First Digital Prod SARL applicable à la TVA est en cours de confirmation auprès de l&apos;administration fiscale ivoirienne. Si la TVA est due, elle sera ajoutée au taux légal en vigueur et apparaîtra distinctement sur chaque facture, sans action requise de votre part. First Digital Prod SARL se réserve le droit de modifier ses tarifs, avec préavis de 30 jours.
          </p>
          <p className="text-slate-600 leading-relaxed mt-4">
            <strong>Frais d&apos;intégration (à titre unique) :</strong> pour les hôtels ne disposant pas d&apos;une base de données électronique (registre papier), un frais unique de <strong>49 000 FCFA HT</strong> s&apos;applique lors de la mise en place. Il couvre la digitalisation de l&apos;historique client (import CSV) et l&apos;accès au registre numérique. Ce frais est distinct de l&apos;abonnement mensuel, prélevé une seule fois, et n&apos;est pas reconduit automatiquement.
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
              Garantie &quot;2 réservations ou mois offert&quot;
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
            Hors exercice du droit de rétractation, les abonnements ne sont pas remboursables. En cas d&apos;interruption de service imputable à First Digital Prod SARL d&apos;une durée supérieure à 48 heures consécutives, une compensation proportionnelle sera accordée sous forme d&apos;avoir.
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
