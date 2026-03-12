/**
 * prompts-delete
 * Deletes an AI prompt
 *
 * Auth: Admin required
 * Method: POST (DELETE support via x-http-method header)
 * Body: { id: string }
 */

import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { error: authError } = await requireAdmin(req);
    if (authError) return errors.forbidden(authError);

    const body = await req.json();
    const { id } = body;

    if (!id) return errors.badRequest("Prompt ID is required");

    const serviceClient = getServiceClient();
    const { error: dbError } = await serviceClient
      .from("ai_prompts")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("prompts-delete db error:", dbError);
      return errors.internal("Failed to delete prompt");
    }

    return success({ deleted: true });
  } catch (err) {
    console.error("prompts-delete error:", err);
    return errors.internal(err instanceof Error ? err.message : "Failed to delete prompt");
  }
});
