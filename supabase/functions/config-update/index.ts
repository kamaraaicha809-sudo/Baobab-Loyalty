/**
 * config-update
 * Updates application configuration
 *
 * Auth: Required (admin role only)
 * Method: POST
 * Body: { key, value } or { updates: [{ key, value }] }
 */

import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Configuration update is disabled in demo mode");

    const { error: authError } = await requireAdmin(req);
    if (authError) return errors.forbidden(authError);

    const body = await req.json();
    const serviceClient = getServiceClient();

    // Bulk update
    if (body.updates && Array.isArray(body.updates)) {
      const results = [];
      for (const update of body.updates) {
        if (!update.key) continue;
        const { error } = await serviceClient
          .from("app_config")
          .update({ value: update.value })
          .eq("key", update.key);
        results.push({ key: update.key, success: !error, error: error?.message });
      }
      return success({ updated: results });
    }

    // Single update
    const { key, value } = body;
    if (!key) return errors.badRequest("Key is required");

    const { error } = await serviceClient
      .from("app_config")
      .update({ value })
      .eq("key", key);

    if (error) {
      console.error("config-update db error:", error);
      return errors.internal("Failed to update configuration");
    }

    return success({ key, updated: true });
  } catch (err) {
    console.error("config-update error:", err);
    return errors.internal(err instanceof Error ? err.message : "Config update failed");
  }
});
