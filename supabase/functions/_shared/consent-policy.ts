/**
 * Politique de consentement marketing, par environnement.
 *
 * Deux modeles :
 * - "legacy" (defaut, Afrique) : un seul indicateur global `clients.marketing_consent`.
 *   Comportement strictement identique a celui qui existait avant ce fichier -
 *   aucune modification de requete, aucune nouvelle table lue.
 * - "channel_rgpd" (Europe) : verifie `communication_preferences` canal par canal.
 *   L'ABSENCE de ligne pour un client+canal est traitee comme "non consentant"
 *   (on n'invente jamais un consentement) : seule une ligne explicite avec
 *   opted_in=true rend un client eligible.
 *
 * Selection du modele : variable d'environnement CONSENT_MODEL, definie comme
 * secret Edge Function propre a chaque projet Supabase. Absente sur Afrique
 * (jamais definie) -> "legacy" par defaut, donc aucun changement de comportement
 * sans action explicite. Definie a "channel_rgpd" uniquement sur le projet
 * Europe. Un seul point de lecture (getConsentModel), jamais de `if (europe)`
 * disperse ailleurs dans le code.
 */

export type ConsentModel = "legacy" | "channel_rgpd";
export type MarketingChannel = "whatsapp" | "email" | "sms";

export function getConsentModel(): ConsentModel {
  return Deno.env.get("CONSENT_MODEL") === "channel_rgpd" ? "channel_rgpd" : "legacy";
}

interface ClientWithLegacyConsent {
  id: string;
  marketing_consent: boolean;
  // Presents uniquement sur le schema Europe (colonnes ajoutees en
  // migrations-europe/007) -- absents sur Afrique, d'ou le typage optionnel.
  // Un client anonymise (droit a l'effacement) ou sous limitation du
  // traitement (Art. 18) ne doit jamais etre recontacte, quel que soit son
  // consentement par ailleurs enregistre.
  anonymized?: boolean;
  processing_restricted?: boolean;
}

/**
 * Filtre une liste de clients deja chargee selon la politique active. Prend
 * une DB client (service_role) pour interroger communication_preferences en
 * mode channel_rgpd ; en mode legacy, ne fait aucune requete supplementaire
 * (le champ marketing_consent est deja present sur les objets clients).
 */
export async function filterConsentedClients<T extends ClientWithLegacyConsent>(
  // deno-lint-ignore no-explicit-any
  db: any,
  clientList: T[],
  channel: MarketingChannel
): Promise<{ eligible: T[]; excluded: T[] }> {
  if (getConsentModel() === "legacy") {
    const eligible = clientList.filter((c) => c.marketing_consent);
    const excluded = clientList.filter((c) => !c.marketing_consent);
    return { eligible, excluded };
  }

  if (clientList.length === 0) return { eligible: [], excluded: [] };

  // Un client anonymise ou sous limitation du traitement est exclu avant
  // meme de consulter son consentement par canal : ni l'un ni l'autre ne
  // doit jamais suffire a le rendre de nouveau eligible.
  const blockedByStatus = clientList.filter((c) => c.anonymized || c.processing_restricted);
  const candidates = clientList.filter((c) => !c.anonymized && !c.processing_restricted);

  const { data: prefs } = await db
    .from("communication_preferences")
    .select("client_id, opted_in")
    .eq("channel", channel)
    .in(
      "client_id",
      candidates.map((c) => c.id)
    );

  const optedInIds = new Set(
    (prefs ?? []).filter((p: { opted_in: boolean }) => p.opted_in).map((p: { client_id: string }) => p.client_id)
  );

  const eligible = candidates.filter((c) => optedInIds.has(c.id));
  const excluded = [...candidates.filter((c) => !optedInIds.has(c.id)), ...blockedByStatus];
  return { eligible, excluded };
}

/**
 * Reverification d'un seul client au moment exact de l'envoi (pas seulement
 * a la creation de la campagne) : un consentement retire entre la creation et
 * l'envoi doit bloquer ce client precisement, meme au milieu d'une campagne
 * deja en cours. En mode legacy, reutilise la valeur deja chargee (aucune
 * requete supplementaire, comportement Afrique inchange).
 */
export async function isClientStillConsented(
  // deno-lint-ignore no-explicit-any
  db: any,
  client: ClientWithLegacyConsent,
  channel: MarketingChannel
): Promise<boolean> {
  if (getConsentModel() === "legacy") {
    return client.marketing_consent;
  }

  if (client.anonymized || client.processing_restricted) return false;

  const { data } = await db
    .from("communication_preferences")
    .select("opted_in")
    .eq("client_id", client.id)
    .eq("channel", channel)
    .maybeSingle();

  return data?.opted_in === true;
}
