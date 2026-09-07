/**
 * whatsapp-status
 * Retourne l'état de connexion WhatsApp d'un hôtelier SANS jamais exposer
 * whatsapp_access_token / bsp_api_key au client (ces champs restent
 * server-side uniquement).
 *
 * Depuis la migration 055, ces deux colonnes ne sont même plus lisibles par
 * le rôle "authenticated" (seul le service_role le peut) : on résout donc
 * d'abord le profil accessible via userClient (colonnes non sensibles), puis
 * on relit les champs WhatsApp via le service role.
 *
 * Auth: Required (JWT) — bypassed in DEMO_MODE
 * Method: GET
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";

interface ProfileWhatsAppFields {
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token: string | null;
  whatsapp_display_phone: string | null;
  bsp_status: string | null;
  bsp_phone_number: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    if (isDemoMode) {
      return success({ connected: true, phone: "2250700000000" });
    }

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Auth required");

    const { profile: resolvedId } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!resolvedId) return errors.forbidden("Profil introuvable.");

    const { data: profile } = await getServiceClient()
      .from("profiles")
      .select("whatsapp_phone_number_id, whatsapp_access_token, whatsapp_display_phone, bsp_status, bsp_phone_number")
      .eq("id", resolvedId.id)
      .maybeSingle<ProfileWhatsAppFields>();
    if (!profile) return errors.forbidden("Profil introuvable.");

    const connected =
      (!!profile.whatsapp_phone_number_id && !!profile.whatsapp_access_token) ||
      profile.bsp_status === "active";

    return success({
      connected,
      phone: profile.bsp_phone_number || profile.whatsapp_display_phone || profile.whatsapp_phone_number_id || null,
    });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
