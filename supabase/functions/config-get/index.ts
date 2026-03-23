/**
 * config-get
 * Returns application configuration from Supabase
 *
 * Auth: Not required (public data)
 * Method: GET
 * Query: ?key=xxx or ?category=xxx
 */

import { createClient } from "../_shared/deps.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Parse params from URL or body (for invoke)
    const url = new URL(req.url);
    let key = url.searchParams.get("key");
    let category = url.searchParams.get("category");

    // Support params from invoke body
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body._query) {
          const params = new URLSearchParams(body._query);
          key = params.get("key") || key;
          category = params.get("category") || category;
        }
        // Also check direct body params
        if (body.key) key = body.key;
        if (body.category) category = body.category;
      } catch {
        // No body or invalid JSON - use URL params
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    let query = supabase.from("app_config").select("key, value, category");

    if (key) {
      query = query.eq("key", key).single();
    } else if (category) {
      query = query.eq("category", category);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      if (dbError.code === "PGRST116") {
        return success(null, 200, { "Cache-Control": "public, max-age=300" });
      }
      return errors.internal("Failed to fetch configuration");
    }

    // Single key response
    if (key && data) {
      return success({ key: data.key, value: data.value }, 200, { "Cache-Control": "public, max-age=300" });
    }

    // Multiple keys response
    const configMap: Record<string, unknown> = {};
    if (Array.isArray(data)) {
      for (const item of data) {
        configMap[item.key] = item.value;
      }
    }

    return success(configMap, 200, { "Cache-Control": "public, max-age=300" });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Config fetch failed");
  }
});
