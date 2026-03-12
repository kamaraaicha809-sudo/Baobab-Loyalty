import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Politique de Confidentialité | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

/**
 * Generate Privacy Policy content from config
 */
const generatePrivacyPolicy = () => {
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Dernière mise à jour : ${date}

Merci de visiter ${config.appName} ("nous", "notre"). Cette Politique de Confidentialité décrit comment nous collectons, utilisons et protégeons vos informations personnelles et non personnelles lorsque vous utilisez notre site web situé à l'adresse https://${config.domainName} (le "Site").

En accédant ou en utilisant le Site, vous acceptez les termes de cette Politique de Confidentialité. Si vous n'êtes pas d'accord avec les pratiques décrites dans cette politique, veuillez ne pas utiliser le Site.

1. Informations que Nous Collectons

1.1 Données Personnelles

Nous collectons les informations personnelles suivantes :

• Nom : Nous collectons votre nom pour personnaliser votre expérience et communiquer efficacement avec vous.
• Email : Nous collectons votre adresse email pour vous envoyer des informations importantes concernant vos commandes, mises à jour et communications.
• Informations de Paiement : Nous collectons les détails de paiement pour traiter vos commandes en toute sécurité. Cependant, nous ne stockons pas vos informations de paiement sur nos serveurs. Les paiements sont traités par des processeurs de paiement tiers de confiance.

1.2 Données Non Personnelles

Nous pouvons utiliser des cookies web et des technologies similaires pour collecter des informations non personnelles telles que votre adresse IP, type de navigateur, informations sur l'appareil et habitudes de navigation. Ces informations nous aident à améliorer votre expérience de navigation, analyser les tendances et améliorer nos services.

2. Objectif de la Collecte de Données

Nous collectons et utilisons vos données personnelles dans le seul but de traitement des commandes. Cela inclut le traitement de vos commandes, l'envoi de confirmations de commande, la fourniture d'un support client et vous tenir informé du statut de vos commandes.

3. Partage des Données

Nous ne partageons pas vos données personnelles avec des tiers, sauf si nécessaire pour le traitement des commandes (par exemple, partager vos informations avec les processeurs de paiement). Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers.

4. Confidentialité des Enfants

${config.appName} n'est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants. Si vous êtes un parent ou un tuteur et pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter à l'adresse email fournie ci-dessous.

5. Mises à Jour de la Politique de Confidentialité

Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre pour refléter les changements dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires. Toute mise à jour sera publiée sur cette page, et nous pourrons vous notifier par email des changements importants.

6. Coordonnées

Si vous avez des questions, préoccupations ou demandes concernant cette Politique de Confidentialité, vous pouvez nous contacter à :

Email : ${config.resend?.supportEmail || `support@${config.domainName}`}

Pour toute autre demande, veuillez visiter notre page Contact sur le Site.

En utilisant ${config.appName}, vous consentez aux termes de cette Politique de Confidentialité.`;
};

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Retour
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Politique de Confidentialité - {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {generatePrivacyPolicy()}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
