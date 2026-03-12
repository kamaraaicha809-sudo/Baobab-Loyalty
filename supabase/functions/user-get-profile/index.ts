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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    // Verify authentication
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    // Fetch profile
    const { data: profile, error: dbError } = await userClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError) {
      // Profile not found - return default
      if (dbError.code === "PGRST116") {
        return success({
          id: user.id,
          email: user.email,
          has_access: false,
          customer_id: null,
          price_id: null,
        });
      }
      
      console.error("Database error:", dbError);
      return errors.internal("Failed to fetch profile");
    }

    return success(profile);
  } catch (err) {
    console.error("user-get-profile error:", err);
    return errors.internal(err instanceof Error ? err.message : "Profile fetch failed");
  }
});
