/**
 * whatsapp-disconnect
 * Révoque la connexion WhatsApp d'un hôtelier (efface les credentials).
 *
 * Auth: Required (JWT) — bypassed in DEMO_MODE
 * Method: POST
 * Body: {}
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    if (isDemoMode) {
      return success({ status: "inactive" });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return errors.unauthorized(authError || "Auth required");

    const db = getServiceClient();

    const { error: updateError } = await db
      .from("profiles")
      .update({
        whatsapp_phone_number_id: null,
        whatsapp_access_token: null,
        bsp_api_key: null,
        bsp_phone_number: null,
        bsp_waba_id: null,
        bsp_channel_id: null,
        bsp_status: "inactive",
        bsp_connected_at: null,
      })
      .eq("id", user.id);

    if (updateError) return errors.internal(updateError.message);

    return success({ status: "inactive" });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
