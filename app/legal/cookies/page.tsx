import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Cookies | Baobab Loyalty",
};

export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : 12 avril 2026</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Politique de Cookies</h1>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
          <p className="text-slate-600 leading-relaxed">
            Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, téléphone, tablette) lors de votre visite sur un site web. Il permet au site de mémoriser vos actions et préférences pendant une période déterminée.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Cookies utilisés</h2>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Essentiels</span>
                <p className="font-medium text-slate-700">Cookies de fonctionnement</p>
              </div>
              <p className="text-slate-600 text-sm">
                Nécessaires au bon fonctionnement du site (session utilisateur, authentification). Ils ne peuvent pas être désactivés. Durée : session ou jusqu&apos;à déconnexion.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Préférences</span>
                <p className="font-medium text-slate-700">Cookies de préférences</p>
              </div>
              <p className="text-slate-600 text-sm">
                Mémorisent vos choix (consentement cookies, préférences d&apos;affichage). Durée : 12 mois.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">Analytiques</span>
                <p className="font-medium text-slate-700">Cookies d&apos;analyse (PostHog)</p>
              </div>
              <p className="text-slate-600 text-sm">
                Nous aident à comprendre comment les visiteurs utilisent le site (pages vues, parcours). Les données sont anonymisées. Durée : 12 mois. Vous pouvez les refuser.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Cookies tiers</h2>
          <p className="text-slate-600 leading-relaxed">
            Certains cookies sont déposés par des services tiers que nous utilisons :
          </p>
          <ul className="mt-3 space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Stripe :</strong> cookies nécessaires au traitement sécurisé des paiements</li>
            <li><strong>PostHog :</strong> cookies d&apos;analyse d&apos;usage (anonymisés)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Gestion des cookies</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Vous pouvez gérer vos préférences cookies à tout moment :
          </p>
          <ul className="space-y-2 text-slate-600 list-disc list-inside">
            <li><strong>Via la bannière cookies</strong> : lors de votre première visite sur le site</li>
            <li><strong>Via votre navigateur</strong> : dans les paramètres de confidentialité (Chrome, Firefox, Safari, Edge permettent tous de bloquer ou supprimer les cookies)</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3 text-sm bg-amber-50 border border-amber-100 rounded-lg p-3">
            Attention : désactiver certains cookies essentiels peut affecter le bon fonctionnement de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative aux cookies :{" "}
            <a href="mailto:legal@baobabloyalty.com" className="text-primary hover:underline">legal@baobabloyalty.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}
