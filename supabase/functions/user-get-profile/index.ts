/**
 * user-get-profile
 * Returns the authenticated user's profile
 *
 * Auth: Required (JWT)
 * Method: GET
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) {
      return success({
        id: "demo-user-id",
        email: "demo@baobabloyalty.com",
        has_access: true,
        access_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        trial_ends_at: null,
        role: "admin",
        hotel_name: "Hôtel Demo",
        config_complete: true,
        customer_id: null,
        price_id: "premium",
        onboarding_fee_paid_at: null,
      });
    }

    // Verify authentication
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    // Fetch profile (own, or via team membership)
    // Selection explicite : ne jamais renvoyer whatsapp_access_token / bsp_api_key
    // au frontend (secrets d'integration, utilises uniquement cote serveur).
    const { profile, teamRole } = await resolveProfile(
      userClient,
      user.id,
      "id, email, has_access, access_until, trial_ends_at, customer_id, price_id, role, hotel_name, " +
        "config_complete, onboarding_completed, onboarding_step, onboarding_fee_paid_at, " +
        "ai_brand_voice, ai_keywords_use, ai_keywords_avoid, ai_signature, " +
        "created_at, updated_at"
    );

    if (!profile) {
      return success({
        id: user.id,
        email: user.email,
        has_access: false,
        customer_id: null,
        price_id: null,
      });
    }

    return success({ ...profile, team_role: teamRole });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Profile fetch failed");
  }
});
