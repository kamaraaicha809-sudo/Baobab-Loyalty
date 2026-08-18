/**
 * contact-send
 * Public endpoint — sends a visitor's message from /contact to the support inbox.
 * No database write, just a rate-limited relay to Resend.
 *
 * Auth: NOT required (public form on website)
 * Method: POST
 * Body: { name: string, email: string, message: string }
 */

import { getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, error, errors } from "../_shared/response.ts";

interface ContactBody {
  name: string;
  email: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const SUPPORT_EMAIL = "support@baobabloyalty.com";

function parseContactBody(body: unknown): ContactBody | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, message } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) return null;
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) return null;
  if (typeof message !== "string" || message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH) return null;

  return { name: name.trim(), email: email.trim(), message: message.trim() };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactEmail({ name, email, message }: ContactBody): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#1a2f2a;padding:24px 32px;">
              <h1 style="margin:0;font-size:18px;color:#EBC161;">Nouveau message — formulaire /contact</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 12px;font-size:14px;color:#444;"><strong>Nom :</strong> ${escapeHtml(name)}</p>
              <p style="margin:0 0 20px;font-size:14px;color:#444;"><strong>Email :</strong> ${escapeHtml(email)}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Message :</strong></p>
              <p style="margin:0;font-size:14px;color:#2c2c2c;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendContactEmail(body: ContactBody, resendApiKey: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Baobab Loyalty <noreply@baobabloyalty.com>",
      to: SUPPORT_EMAIL,
      reply_to: body.email,
      subject: `Nouveau message de ${body.name} via /contact`,
      html: buildContactEmail(body),
    }),
  });
  return response.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  if (req.method !== "POST") {
    return errors.badRequest("Méthode non autorisée");
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    const rawBody = await req.json();
    const parsed = parseContactBody(rawBody);
    if (!parsed) {
      return errors.validationError("Formulaire invalide", { code: "INVALID_INPUT" });
    }

    if (isDemoMode) {
      return success({ sent: true, demo: true });
    }

    const db = getServiceClient();
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    const { data: allowed } = await db.rpc("check_rate_limit", {
      p_key: `contact:${clientIp}`,
      p_max_hits: 5,
      p_window_seconds: 600,
    });
    if (allowed === false) {
      return error(429, "RATE_LIMITED", "Trop de requêtes. Réessayez plus tard.");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return errors.internal("Email service not configured");

    const sent = await sendContactEmail(parsed, resendApiKey);
    if (!sent) return errors.internal("Échec de l'envoi du message");

    return success({ sent: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(msg);
  }
});
