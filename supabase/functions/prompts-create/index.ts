/**
 * prompts-create
 * Creates a new AI prompt
 *
 * Auth: Admin required
 * Method: POST
 * Body: { name: string, description?: string, content: string }
 */

import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    // Verify admin access
    const { error: authError } = await requireAdmin(req);
    if (authError) {
      return errors.unauthorized(authError);
    }

    // Parse body
    const body = await req.json();
    const { name, description, content } = body;

    // Basic validation
    if (!name || typeof name !== "string") {
      return errors.badRequest("Name is required");
    }

    if (!content || typeof content !== "string") {
      return errors.badRequest("Content is required");
    }

    // Insert prompt using service role
    const serviceClient = getServiceClient();
    const { data, error: dbError } = await serviceClient
      .from("ai_prompts")
      .insert({ name, description: description || null, content })
      .select()
      .single();

    if (dbError) {
      console.error("prompts-create db error:", dbError);
      return errors.internal("Failed to create prompt");
    }

    return success(data, 201);
  } catch (err) {
    console.error("prompts-create error:", err);
    return errors.internal(err instanceof Error ? err.message : "Failed to create prompt");
  }
});
