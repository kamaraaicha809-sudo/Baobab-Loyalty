/**
 * prompts-update
 * Updates an existing AI prompt
 *
 * Auth: Admin required
 * Method: POST (PUT support via x-http-method header)
 * Body: { id: string, name?: string, description?: string, content?: string }
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
    const { id, name, description, content } = body;

    if (!id) return errors.badRequest("Prompt ID is required");

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;

    if (Object.keys(updateData).length === 0) {
      return errors.badRequest("No fields to update");
    }

    const serviceClient = getServiceClient();
    const { data, error: dbError } = await serviceClient
      .from("ai_prompts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") return errors.notFound("Prompt not found");
      console.error("prompts-update db error:", dbError);
      return errors.internal("Failed to update prompt");
    }

    return success(data);
  } catch (err) {
    console.error("prompts-update error:", err);
    return errors.internal(err instanceof Error ? err.message : "Failed to update prompt");
  }
});
