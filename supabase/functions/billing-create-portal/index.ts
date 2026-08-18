/**
 * billing-create-portal
 * Moneroo has no customer portal ni facturation recurrente automatique :
 * chaque paiement est un checkout ponctuel (voir billing-webhook). "Resilier"
 * n'a donc rien a annuler cote Moneroo — cette fonction revoque directement
 * l'acces en base, immediatement.
 *
 * Auth: Required (JWT, owner uniquement)
 * Method: POST
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Billing portal is disabled in demo mode");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    // Seul le propriétaire du compte gère la facturation (même règle que le checkout)
    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (teamRole !== "owner") {
      return errors.forbidden("Seul le propriétaire du compte peut gérer la facturation.");
    }

    const serviceClient = getServiceClient();
    const { error: revokeError } = await serviceClient
      .from("profiles")
      .update({ has_access: false, access_until: new Date().toISOString() })
      .eq("id", profile!.id);

    if (revokeError) return errors.internal("Échec de la résiliation.");

    const siteUrl = Deno.env.get("SITE_URL") || "https://example.com";
    return success({ url: `${siteUrl}/dashboard/abonnement`, cancelled: true });
  } catch (err) {
    console.error("billing-create-portal error:", err);
    return errors.internal(err instanceof Error ? err.message : "Portal creation failed");
  }
});
