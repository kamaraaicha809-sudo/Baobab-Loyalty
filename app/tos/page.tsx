import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Conditions d'Utilisation | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

/**
 * Generate Terms of Service content from config
 */
const generateTOS = () => {
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Dernière mise à jour : ${date}

Bienvenue sur ${config.appName} !

Ces Conditions Générales d'Utilisation ("Conditions") régissent votre utilisation du site ${config.domainName} ("Site") et des services fournis par ${config.appName}. En utilisant notre Site et nos services, vous acceptez ces Conditions.

1. Description du Service

${config.appName} est une plateforme qui ${config.appDescription?.toLowerCase() || "fournit des services numériques"}.

2. Droits de Propriété et d'Utilisation

Lorsque vous achetez un abonnement ou un service sur ${config.appName}, vous obtenez le droit d'utiliser les fonctionnalités incluses dans votre plan. Vous êtes propriétaire du contenu que vous créez, mais vous n'avez pas le droit de revendre ou redistribuer notre service. Nous offrons un remboursement complet dans les 7 jours suivant l'achat, conformément à notre politique de remboursement.

3. Données Utilisateur et Confidentialité

Nous collectons et stockons des données utilisateur, notamment le nom, l'email et les informations de paiement, nécessaires à la fourniture de nos services. Pour plus de détails sur la façon dont nous traitons vos données, veuillez consulter notre Politique de Confidentialité à l'adresse https://${config.domainName}/privacy-policy.

4. Collecte de Données Non Personnelles

Nous utilisons des cookies web pour collecter des données non personnelles afin d'améliorer nos services et votre expérience utilisateur.

5. Droit Applicable

Ces Conditions sont régies par les lois françaises.

6. Modifications des Conditions

Nous pouvons mettre à jour ces Conditions de temps à autre. Les utilisateurs seront informés de tout changement par email.

7. Contact

Pour toute question ou préoccupation concernant ces Conditions d'Utilisation, veuillez nous contacter à : ${config.resend?.supportEmail || `support@${config.domainName}`}

Merci d'utiliser ${config.appName} !`;
};

const TOS = () => {
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
          Conditions d'Utilisation - {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {generateTOS()}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
