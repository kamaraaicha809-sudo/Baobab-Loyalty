/**
 * billing-create-portal
 * Moneroo has no customer portal — returns the billing dashboard URL
 *
 * Auth: Required (JWT)
 * Method: POST
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Billing portal is disabled in demo mode");

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://example.com";
    return success({ url: `${siteUrl}/dashboard/billing` });
  } catch (err) {
    console.error("billing-create-portal error:", err);
    return errors.internal(err instanceof Error ? err.message : "Portal creation failed");
  }
});
