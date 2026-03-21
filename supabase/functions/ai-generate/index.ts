/**
 * ai-generate
 * Generates content using OpenRouter AI API
 *
 * Auth: Required (JWT + active subscription) — bypassed in DEMO_MODE
 * Method: POST
 * Body: { prompt, model?, maxTokens?, temperature? }
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    if (!isDemoMode) {
      // Verify authentication
      const { user, userClient, error: authError } = await requireAuth(req);
      if (authError || !user || !userClient) {
        return errors.unauthorized(authError || "Authentication required");
      }

      // Check subscription
      const { data: profile } = await userClient
        .from("profiles")
        .select("has_access")
        .eq("id", user.id)
        .single();

      if (!profile?.has_access) {
        return errors.forbidden("Active subscription required");
      }
    }

    // Parse body
    const body = await req.json();
    const { prompt, system, model = DEFAULT_MODEL, maxTokens = 1024, temperature = 0.7 } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return errors.badRequest("Prompt is required");
    }

    // Check OpenRouter API key
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return errors.internal("AI service not configured");
    }

    // Build messages array (system prompt + user message)
    const messages = [];
    if (system && typeof system === "string") {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("SITE_URL") || "https://localhost",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return errors.internal("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return success({ content, model: data.model, usage: data.usage });
  } catch (err) {
    console.error("ai-generate error:", err);
    return errors.internal(err instanceof Error ? err.message : "Generation failed");
  }
});
