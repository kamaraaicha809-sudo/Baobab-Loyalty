import config from "@/config";

/**
 * Textes marketing communs aux deux sites dont la formulation diffère par
 * région. En Afrique, chaque fonction renvoie le texte Baobab reçu en
 * paramètre, tel quel : seul Loyavia (Europe) change.
 */

const isEurope = config.region === "europe";

// Promesse de délai Loyavia : la connexion WhatsApp (validation Meta) n'est
// pas comptée, seule la préparation et l'envoi d'une campagne le sont.
export const EUROPE_CAMPAIGN_DELAY =
  "Une fois votre WhatsApp connecté, préparez et envoyez une campagne en 10 minutes.";

/** Texte de délai seul (Europe), ou le texte Afrique fourni. */
export function campaignDelay(africaText: string): string {
  return isEurope ? EUROPE_CAMPAIGN_DELAY : africaText;
}

/** Mention sous les boutons d'inscription (Europe), ou le texte Afrique fourni. */
export function signupNote(africaText: string): string {
  return isEurope ? `Aucune carte bancaire requise. ${EUROPE_CAMPAIGN_DELAY}` : africaText;
}
