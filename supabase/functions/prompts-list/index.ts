/**
 * prompts-list
 * Lists all AI prompts from the database
 *
 * Auth: Required (admin role) — bypassed in DEMO_MODE
 * Method: GET
 */

import { createClient } from "../_shared/deps.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    if (!isDemoMode) {
      const { error: authError } = await requireAdmin(req);
      if (authError) return errors.unauthorized(authError);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error: dbError } = await supabase
      .from("ai_prompts")
      .select("id, name, description, content, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("prompts-list db error:", dbError);
      return errors.internal("Failed to fetch prompts");
    }

    return success(data);
  } catch (err) {
    console.error("prompts-list error:", err);
    return errors.internal(err instanceof Error ? err.message : "Failed to list prompts");
  }
});
