/**
 * Envoi de messages WhatsApp (template) via Meta Cloud API ou 360dialog (BSP).
 * Extrait de campaign-send/index.ts pour être réutilisé par birthday-worker
 * sans dupliquer l'intégration API (formatage numéro, parsing d'erreurs) —
 * comportement strictement inchangé par rapport à l'original.
 */

// Lien de desinscription individuel ajoute a la fin de chaque message envoye
// (audit juridique 2026-08 : consentement/desinscription WhatsApp). L'UUID du
// client (122 bits aleatoires) sert de jeton non devinable, sans colonne
// dediee ni infrastructure de signature supplementaire.
export function buildUnsubscribeSuffix(clientId: string): string {
  const siteUrl = Deno.env.get("SITE_URL") || "https://baobabloyalty.com";
  return `\n\nPour ne plus recevoir nos offres : ${siteUrl}/desinscription?c=${clientId}`;
}

// Indicatif ajoute aux numeros saisis au format local a la reception (ex :
// "0585347176" en Cote d'Ivoire, 10 chiffres commencant par 0, le 0 est
// conserve apres +225). Europe (APP_BRAND defini) : aucun indicatif implicite,
// sauf si DEFAULT_PHONE_COUNTRY_CODE est configure.
function defaultCountryCode(): string | null {
  const configured = Deno.env.get("DEFAULT_PHONE_COUNTRY_CODE")?.replace(/\D/g, "");
  if (configured) return configured;
  return Deno.env.get("APP_BRAND") ? null : "225";
}

export function formatE164(raw: string): string | null {
  // Remove spaces and special chars except leading +
  let cleaned = raw.replace(/[\s\-().]/g, "");

  // "00" prefix → "+"
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }

  const countryCode = defaultCountryCode();
  if (countryCode && /^0\d{9}$/.test(cleaned)) {
    cleaned = `+${countryCode}${cleaned}`;
  }

  // Ensure starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // Keep only digits after +
  const digits = cleaned.slice(1).replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) return null;

  return "+" + digits;
}

// Extrait un message d'erreur lisible depuis une reponse d'echec Meta/360dialog.
// Les deux APIs renvoient un corps JSON de la forme { error: { message, code } }
// en cas de rejet (template refuse, numero invalide, quota depasse...). Si le
// corps n'est pas du JSON exploitable, on garde le texte brut (tronque).
export function extractErrorInfo(rawBody: string): { code?: string; message: string } {
  try {
    const parsed = JSON.parse(rawBody);
    const apiError = parsed?.error;
    if (apiError?.message) {
      return {
        code: apiError.code !== undefined ? String(apiError.code) : undefined,
        message: String(apiError.error_data?.details || apiError.message).slice(0, 500),
      };
    }
  } catch {
    // Corps non-JSON, on retombe sur le texte brut ci-dessous
  }
  return { message: rawBody.slice(0, 500) || "Erreur inconnue du fournisseur WhatsApp" };
}

// Meta refuse tout parametre de template contenant un retour a la ligne, une
// tabulation ou plus de 4 espaces consecutifs (erreur 132018). Le suffixe de
// desinscription et les messages IA contiennent des retours a la ligne : on
// les remplace par un separateur visible avant l'envoi.
export function sanitizeTemplateParam(text: string): string {
  return text
    .replace(/\s*[\r\n\t]+\s*/g, " - ")
    .replace(/ {4,}/g, " ")
    .trim();
}

// Prenom affiche dans "Bonjour {{1}}" : premier mot du nom saisi, avec une
// majuscule (la reception tape souvent "yasmine kone").
export function firstNameOf(clientName: string): string {
  const first = clientName.trim().split(/\s+/)[0] || "";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// Les messages generes (IA ou modeles du dashboard) contiennent {{nom}} et
// {{hotel_name}} : ils sont remplaces ici, client par client. Les templates
// Meta commencent deja par "Bonjour {{1}}", donc la salutation d'ouverture du
// message ("Bonjour {{nom}},", "Cher {{nom}},", "{{nom}},") est retiree pour
// eviter un double "Bonjour".
export function personalizeCampaignBody(message: string, firstName: string, hotelName: string): string {
  const withoutGreeting = message.replace(
    /^\s*(?:(?:bonjour|bonsoir|hello|salut|cher|chère)\s+)?\{\{\s*nom\s*\}\}\s*[,!.:]?\s*/i,
    "",
  );
  const filled = withoutGreeting
    .replace(/\{\{\s*nom\s*\}\}/gi, firstName)
    .replace(/\{\{\s*hotel_name\s*\}\}/gi, hotelName);
  return filled.charAt(0).toUpperCase() + filled.slice(1);
}

export interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMsg?: string;
}

interface MetaTemplate {
  name: string;
  language: { code: string };
  components: Record<string, unknown>[];
}

async function postMetaTemplate(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  template: MetaTemplate,
): Promise<SendResult> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template,
        }),
      },
    );

    const body = await res.text();

    if (!res.ok) {
      const { code, message } = extractErrorInfo(body);
      return { ok: false, errorCode: code, errorMsg: message };
    }

    let providerMessageId: string | undefined;
    try {
      providerMessageId = JSON.parse(body)?.messages?.[0]?.id;
    } catch {
      // Reponse succes non-JSON (improbable) : on garde providerMessageId undefined
    }

    return { ok: true, providerMessageId };
  } catch (err) {
    return { ok: false, errorMsg: err instanceof Error ? err.message : "Network error" };
  }
}

// Template texte seul "Bonjour {{1}} 👋 {{2}} ..." (baobab_offre_hotel) : le
// lien de desinscription doit etre inclus dans messageBody par l'appelant.
export function sendViaMeta(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  clientName: string,
  templateName: string,
  messageBody: string,
): Promise<SendResult> {
  const firstName = clientName.split(" ")[0];
  return postMetaTemplate(phoneNumberId, accessToken, to, {
    name: templateName,
    language: { code: "fr" },
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: sanitizeTemplateParam(firstName) },
          { type: "text", text: sanitizeTemplateParam(messageBody) },
        ],
      },
    ],
  });
}

export const RESERVATION_TEMPLATE_NAME = "baobab_offre_reservation";

export interface ReservationTemplateParams {
  firstName: string;
  body: string;
  hotelName: string;
  sentMessageId: string;
  clientId: string;
}

function urlButton(index: number, value: string): Record<string, unknown> {
  return {
    type: "button",
    sub_type: "url",
    index: String(index),
    parameters: [{ type: "text", text: value }],
  };
}

// Template baobab_offre_reservation : "Bonjour {{1}} 👋 {{2}} L'equipe de
// {{3}} ..." + bouton "Reserver mon offre" (https://baobabloyalty.com/o/{{1}},
// id du sent_messages) + bouton "Se desinscrire" (/desinscription?c={{1}},
// id du client). Le lien de desinscription n'est donc pas ajoute au texte.
export function sendReservationTemplateViaMeta(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  params: ReservationTemplateParams,
): Promise<SendResult> {
  return postMetaTemplate(phoneNumberId, accessToken, to, {
    name: RESERVATION_TEMPLATE_NAME,
    language: { code: "fr" },
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: sanitizeTemplateParam(params.firstName) },
          { type: "text", text: sanitizeTemplateParam(params.body) },
          { type: "text", text: sanitizeTemplateParam(params.hotelName) },
        ],
      },
      urlButton(0, params.sentMessageId),
      urlButton(1, params.clientId),
    ],
  });
}

// BSP path: 360dialog v2 API
// Header: D360-API-KEY (not Bearer)
// Phone format: digits only, no + prefix
export async function sendViaBsp(
  bspApiKey: string,
  to: string,
  clientName: string,
  templateName: string,
  messageBody: string,
): Promise<SendResult> {
  try {
    const firstName = clientName.split(" ")[0];
    // 360dialog v2 requires phone without + prefix
    const toDigits = to.startsWith("+") ? to.slice(1) : to;

    const res = await fetch("https://waba-v2.360dialog.io/messages", {
      method: "POST",
      headers: {
        "D360-API-KEY": bspApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toDigits,
        type: "template",
        template: {
          name: templateName,
          language: { code: "fr" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: messageBody },
              ],
            },
          ],
        },
      }),
    });

    const body = await res.text();

    if (!res.ok) {
      const { code, message } = extractErrorInfo(body);
      return { ok: false, errorCode: code, errorMsg: message };
    }

    let providerMessageId: string | undefined;
    try {
      providerMessageId = JSON.parse(body)?.messages?.[0]?.id;
    } catch {
      // Reponse succes non-JSON (improbable) : on garde providerMessageId undefined
    }

    return { ok: true, providerMessageId };
  } catch (err) {
    return { ok: false, errorMsg: err instanceof Error ? err.message : "Network error" };
  }
}
