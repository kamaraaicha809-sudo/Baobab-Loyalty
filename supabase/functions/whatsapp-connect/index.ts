/**
 * whatsapp-connect
 * Reçoit le code OAuth de Meta Embedded Signup, échange contre un access token,
 * et sauvegarde les credentials WhatsApp dans le profil de l'hôtelier.
 *
 * Auth: Required (JWT) — bypassed in DEMO_MODE
 * Method: POST
 * Body: { code: string, phone_number_id: string, waba_id: string }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    let profileId: string;

    if (isDemoMode) {
      profileId = "demo-user-id";
      return success({
        status: "active",
        phone_number: "2250700000000",
        connected_at: new Date().toISOString(),
      });
    }

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Auth required");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut connecter WhatsApp.");
    }
    profileId = profile.id;

    const body = await req.json();
    const { code, phone_number_id, waba_id } = body;

    if (!code || !phone_number_id || !waba_id) {
      return errors.badRequest("code, phone_number_id et waba_id sont requis");
    }

    const metaAppId = Deno.env.get("META_APP_ID");
    const metaAppSecret = Deno.env.get("META_APP_SECRET");

    if (!metaAppId || !metaAppSecret) {
      return errors.internal("META_APP_ID et META_APP_SECRET non configurés dans Vault");
    }

    // Exchange authorization code for long-lived access token via Meta Graph API
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&code=${encodeURIComponent(code)}`,
      { method: "GET" },
    );

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return errors.internal(`Échec échange token Meta: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken: string | undefined = tokenData.access_token;

    if (!accessToken) {
      return errors.internal("Aucun token reçu de Meta");
    }

    // Récupère le vrai numéro affichable (phone_number_id est un identifiant interne, pas un numéro lisible)
    let displayPhone: string | undefined;
    try {
      const phoneRes = await fetch(
        `https://graph.facebook.com/v19.0/${phone_number_id}?fields=display_phone_number&access_token=${encodeURIComponent(accessToken)}`,
      );
      if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        displayPhone = phoneData.display_phone_number;
      }
    } catch {
      // Non bloquant — on garde phone_number_id en repli si l'appel échoue
    }

    const db = getServiceClient();

    const { error: updateError } = await db
      .from("profiles")
      .update({
        whatsapp_phone_number_id: phone_number_id,
        whatsapp_access_token: accessToken,
        whatsapp_display_phone: displayPhone || null,
        bsp_waba_id: waba_id,
        bsp_status: "active",
        bsp_connected_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (updateError) return errors.internal(updateError.message);

    return success({
      status: "active",
      phone_number: displayPhone,
      connected_at: new Date().toISOString(),
    });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
