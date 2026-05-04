/**
 * newsletter-subscribe
 * Public endpoint — subscribes an email address to the newsletter.
 * Inserts into newsletter_subscribers using service role (RLS blocks anon).
 * Sends a welcome email via Resend.
 *
 * Auth: NOT required (public form on website)
 * Method: POST
 * Body: { email: string, name?: string, source?: string }
 */

import { getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

interface SubscribeBody {
  email: string;
  name?: string;
  source?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildWelcomeEmail(name: string | undefined): string {
  const greeting = name ? `Bonjour ${name},` : `Bonjour cher hôtelier,`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bienvenue dans la communauté Baobab Loyalty</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a2f2a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#EBC161;letter-spacing:-0.5px;">
                Baobab Loyalty
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#7a9e8e;letter-spacing:1px;text-transform:uppercase;">
                Fidélisation hôtelière en Afrique de l'Ouest
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#2c2c2c;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;">
                Merci de rejoindre notre communauté de directeurs d'hôtels en Afrique de l'Ouest.
                Vous faites maintenant partie d'un réseau de professionnels engagés à améliorer
                leur taux d'occupation et fidéliser leurs clients.
              </p>

              <!-- Benefits box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ec;border-left:4px solid #EBC161;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1a2f2a;text-transform:uppercase;letter-spacing:0.5px;">
                      Chaque mois, vous recevrez :
                    </p>
                    <ul style="margin:0;padding:0 0 0 18px;color:#444;font-size:14px;line-height:2;">
                      <li>Conseils pratiques pour fidéliser vos clients</li>
                      <li>Tendances du marché hôtelier en Afrique</li>
                      <li>Guides marketing WhatsApp</li>
                      <li>Études de cas d'hôtels qui ont boosté leur taux d'occupation</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-radius:8px;background:#EBC161;">
                    <a href="https://baobabloyalty.com"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#1a2f2a;text-decoration:none;letter-spacing:0.2px;">
                      Découvrir Baobab Loyalty
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
                À très bientôt dans votre boîte mail,<br />
                <strong style="color:#2c2c2c;">L'équipe Baobab Loyalty</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f5;border-top:1px solid #eee;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#aaa;line-height:1.6;">
                Vous recevez cet email car vous vous êtes inscrit(e) sur baobabloyalty.com
              </p>
              <p style="margin:0;font-size:12px;color:#aaa;">
                <a href="https://baobabloyalty.com/unsubscribe" style="color:#EBC161;text-decoration:none;">
                  Se désabonner
                </a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                Baobab Loyalty — Afrique de l'Ouest
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendWelcomeEmail(
  email: string,
  name: string | undefined,
  resendApiKey: string
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Baobab Loyalty <noreply@baobabloyalty.com>",
      to: email,
      subject: "Bienvenue dans la communauté Baobab Loyalty 🌿",
      html: buildWelcomeEmail(name),
    }),
  });

  if (!res.ok) {
    // Do not throw — email failure must not block the subscription
    const body = await res.text();
    // Log only in non-production to avoid leaking PII in logs
    if (Deno.env.get("ENVIRONMENT") !== "production") {
      const _ = body; // referenced to avoid unused-var lint
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  if (req.method !== "POST") {
    return errors.badRequest("Méthode non autorisée");
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    const body: SubscribeBody = await req.json();
    const { email, name, source = "website" } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return errors.badRequest("Email requis", { code: "MISSING_EMAIL" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return errors.validationError("Adresse email invalide", { code: "INVALID_EMAIL" });
    }

    // Demo mode: skip DB insert, return mock success
    if (isDemoMode) {
      return success({ subscribed: true, demo: true });
    }

    const db = getServiceClient();

    // Insert subscriber — handle unique constraint violation
    const { error: insertError } = await db
      .from("newsletter_subscribers")
      .insert({
        email: trimmedEmail,
        name: name?.trim() || null,
        source,
        status: "active",
      });

    if (insertError) {
      // Unique constraint violation → already subscribed
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "ALREADY_SUBSCRIBED",
              message: "Cette adresse email est déjà inscrite à la newsletter.",
            },
          }),
          {
            status: 409,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers":
                "authorization, x-client-info, apikey, content-type, x-http-method",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Content-Type": "application/json",
            },
          }
        );
      }

      return errors.internal(insertError.message);
    }

    // Send welcome email (non-blocking — we don't fail the subscription if email fails)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      await sendWelcomeEmail(trimmedEmail, name, resendApiKey);
    }

    return success({ subscribed: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(msg);
  }
});
