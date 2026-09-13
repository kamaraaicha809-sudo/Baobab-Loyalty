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

export function formatE164(raw: string): string | null {
  // Remove spaces and special chars except leading +
  let cleaned = raw.replace(/[\s\-().]/g, "");

  // "00" prefix → "+"
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
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

export interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMsg?: string;
}

export async function sendViaMeta(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  clientName: string,
  templateName: string,
  messageBody: string,
): Promise<SendResult> {
  try {
    const firstName = clientName.split(" ")[0];
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
