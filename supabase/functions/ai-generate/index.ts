/**
 * ai-generate
 * Generates content using OpenRouter AI API
 *
 * Auth: Required (JWT + active subscription) — bypassed in DEMO_MODE
 * Method: POST
 * Body: { prompt, system?, promptName?, model?, maxTokens?, temperature? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const DEFAULT_PROMPT_NAME = "campaign_whatsapp";
const AI_TIMEOUT_MS = 20000;

// Module-level prompt cache (reused across warm invocations)
const promptCache: Record<string, string> = {};

async function fetchPromptFromDb(name: string): Promise<string | null> {
  if (promptCache[name]) return promptCache[name];
  const serviceClient = getServiceClient();
  const { data: promptRow } = await serviceClient
    .from("ai_prompts")
    .select("content")
    .eq("name", name)
    .single();
  if (promptRow?.content) {
    promptCache[name] = promptRow.content;
    return promptRow.content;
  }
  return null;
}

function mapAiError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("429")) {
    return "Le service IA est temporairement surchargé. Réessayez dans 30 secondes.";
  }
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return "La génération a pris trop de temps. Réessayez.";
  }
  if (lower.includes("auth") || lower.includes("401")) {
    return "Clé API IA invalide. Contactez le support.";
  }
  if (lower.includes("context") || lower.includes("length") || lower.includes("tokens")) {
    return "Le texte fourni est trop long. Réduisez la longueur et réessayez.";
  }
  return "La génération a échoué. Réessayez dans quelques instants.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    if (!isDemoMode) {
      const { user, userClient, error: authError } = await requireAuth(req);
      if (authError || !user || !userClient) {
        return errors.unauthorized(authError || "Authentication required");
      }

      const { data: profile } = await userClient
        .from("profiles")
        .select("has_access")
        .eq("id", user.id)
        .single();

      if (!profile?.has_access) {
        return errors.forbidden("Active subscription required");
      }
    }

    const body = await req.json();
    const {
      prompt,
      system,
      promptName,
      model = DEFAULT_MODEL,
      maxTokens = 1024,
      temperature = 0.7,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return errors.badRequest("Le prompt est requis.");
    }

    if (prompt.length > 4000) {
      return errors.badRequest("Le texte fourni est trop long (max 4000 caractères).");
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return errors.internal("Service IA non configuré.");
    }

    // Resolve system prompt: explicit > DB (cached) > none
    let resolvedSystem: string | null = null;
    if (system && typeof system === "string") {
      resolvedSystem = system;
    } else {
      const nameToLoad =
        promptName && typeof promptName === "string"
          ? promptName
          : DEFAULT_PROMPT_NAME;
      resolvedSystem = await fetchPromptFromDb(nameToLoad);
    }

    const messages: { role: string; content: string }[] = [];
    if (resolvedSystem) {
      messages.push({ role: "system", content: resolvedSystem });
    }
    messages.push({ role: "user", content: prompt });

    // Call OpenRouter with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.text();
      return errors.internal(mapAiError(errorData));
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content?.trim() || "";

    if (!content) {
      return errors.internal("La génération n'a produit aucun résultat. Réessayez.");
    }

    return success({ content, model: data.model, usage: data.usage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(mapAiError(message));
  }
});
