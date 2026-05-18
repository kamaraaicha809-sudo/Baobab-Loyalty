/**
 * email-welcome
 * Sends a onboarding welcome email to a newly verified hotelier via Resend.
 *
 * Auth: Required (JWT) — called right after email verification
 * Method: POST
 * Body: {} (user identity comes from the JWT)
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

function buildWelcomeEmail(hotelierEmail: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bienvenue sur Baobab Loyalty</title>
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
                Votre compte est activé
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#2c2c2c;line-height:1.6;">
                Bonjour,
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.7;">
                Votre compte Baobab Loyalty est maintenant actif. En quelques minutes,
                vous allez pouvoir envoyer votre première campagne WhatsApp et remplir
                vos chambres vides.
              </p>

              <!-- 3 étapes -->
              <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1a2f2a;text-transform:uppercase;letter-spacing:0.5px;">
                3 étapes pour démarrer
              </p>

              <!-- Étape 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:2px;">
                    <div style="width:28px;height:28px;background:#EBC161;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a2f2a;">1</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1a2f2a;">Configurez votre hôtel</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#666;line-height:1.5;">
                      Ajoutez le nom de votre établissement et vos types de chambres.
                      Cela prend moins de 2 minutes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Étape 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:2px;">
                    <div style="width:28px;height:28px;background:#EBC161;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a2f2a;">2</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1a2f2a;">Importez vos clients</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#666;line-height:1.5;">
                      Téléchargez votre fichier Excel ou CSV avec les numéros WhatsApp
                      de vos anciens clients. Baobab Loyalty détecte automatiquement
                      les colonnes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Étape 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:2px;">
                    <div style="width:28px;height:28px;background:#EBC161;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a2f2a;">3</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1a2f2a;">Envoyez votre première campagne</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#666;line-height:1.5;">
                      Choisissez un segment (clients inactifs depuis 3 mois par exemple),
                      laissez l'IA rédiger le message, et envoyez en un clic.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-radius:8px;background:#EBC161;">
                    <a href="https://baobabloyalty.com/dashboard/configuration"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#1a2f2a;text-decoration:none;letter-spacing:0.2px;">
                      Configurer mon hôtel
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#888;line-height:1.6;">
                Une question ? Répondez directement à cet email, nous vous aidons
                sous 24h.
              </p>
              <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
                À très bientôt,<br />
                <strong style="color:#2c2c2c;">L'équipe Baobab Loyalty</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f5;border-top:1px solid #eee;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                Vous recevez cet email car vous venez de créer un compte sur baobabloyalty.com<br />
                Baobab Loyalty — Fidélisation hôtelière en Afrique de l'Ouest
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  if (req.method !== "POST") {
    return errors.badRequest("Méthode non autorisée");
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    if (isDemoMode) {
      return success({ sent: true, demo: true });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return errors.unauthorized(authError || "Auth required");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return errors.internal("RESEND_API_KEY non configuré");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Baobab Loyalty <noreply@baobabloyalty.com>",
        to: user.email,
        subject: "Votre compte Baobab Loyalty est activé — démarrez en 3 étapes",
        html: buildWelcomeEmail(user.email!),
      }),
    });

    if (!res.ok) {
      return errors.internal("Échec de l'envoi de l'email de bienvenue");
    }

    return success({ sent: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(msg);
  }
});
