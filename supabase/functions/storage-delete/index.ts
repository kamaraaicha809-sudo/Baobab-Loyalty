/**
 * storage-delete
 * Deletes a file from Supabase Storage
 *
 * Auth: Required (JWT)
 * Method: POST (DELETE support via x-http-method header)
 * Body: { bucket: string, path: string }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("File deletion is disabled in demo mode");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const body = await req.json();
    const { bucket, path } = body;

    if (!bucket) return errors.badRequest("Bucket is required");
    if (!path) return errors.badRequest("Path is required");

    // Security: user can only delete their own files unless admin
    if (!path.startsWith(`${user.id}/`)) {
      const { data: profile } = await userClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return errors.forbidden("You can only delete your own files");
      }
    }

    const serviceClient = getServiceClient();
    const { error: deleteError } = await serviceClient.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) {
      console.error("storage-delete error:", deleteError);
      return errors.internal(`Delete failed: ${deleteError.message}`);
    }

    return success({ deleted: true, path });
  } catch (err) {
    console.error("storage-delete error:", err);
    return errors.internal(err instanceof Error ? err.message : "Delete failed");
  }
});
