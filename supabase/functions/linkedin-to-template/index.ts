/**
 * linkedin-to-template
 * Fetches a LinkedIn post via Unipile and converts it to a WhatsApp template
 *
 * Auth: Required (JWT + active subscription) or Demo Mode
 * Method: POST
 * Body: { url: string }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const AI_TIMEOUT_MS = 20000;
const UNIPILE_TIMEOUT_MS = 10000;

// Module-level prompt cache
let cachedSystemPrompt: string | null = null;

const FALLBACK_PROMPT = `<ROLE>
Tu es un expert en marketing hotelier specialise dans la conversion de contenus
professionnels en messages WhatsApp pour les hotels d'Afrique francophone.
Tu transformes des posts LinkedIn formels en messages WhatsApp chaleureux,
courts et incitatifs, prets a etre envoyes a des clients reels.
</ROLE>

<ETAPES>
Etape 1 : Identifier l'offre ou le message principal du post LinkedIn.
Etape 2 : Reformuler en message conversationnel de 80 a 150 mots, vouvoiement.
Etape 3 : Integrer {{client_name}}, {{hotel_name}}, {{offer_discount}}, {{valid_until}}.
Etape 4 : Terminer par un appel a l'action clair.
</ETAPES>

<SORTIE_ATTENDUE>
- Commencer par "Cher(e) {{client_name}}," ou "Bonjour {{client_name}},"
- 80 a 150 mots, ton chaleureux
- Inclure les 4 variables
- Aucun titre, aucun commentaire, aucun emoji
</SORTIE_ATTENDUE>`;

/**
 * Extracts the LinkedIn activity ID from a post URL
 */
function extractLinkedinPostId(url: string): string | null {
  const match = url.match(/activity[:-](\d{15,20})/);
  return match?.[1] ?? null;
}

/**
 * Extracts variable placeholders found in a template string
 */
function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  const unique = new Set<string>();
  for (const match of matches) {
    unique.add(match[1]);
  }
  return Array.from(unique);
}

function mapAiError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("429")) {
    return "Le service IA est temporairement surchargé. Réessayez dans 30 secondes.";
  }
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return "La génération a pris trop de temps. Réessayez.";
  }
  return "La génération a échoué. Réessayez dans quelques instants.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    let userId: string;

    if (isDemoMode) {
      userId = "demo-user-id";
    } else {
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

      userId = user.id;
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return errors.badRequest("L'URL du post LinkedIn est requise.");
    }

    try {
      new URL(url);
    } catch {
      return errors.badRequest("Format d'URL invalide.");
    }

    if (!url.includes("linkedin.com")) {
      return errors.badRequest("L'URL doit être un lien LinkedIn valide.");
    }

    const postId = extractLinkedinPostId(url);
    if (!postId) {
      return errors.badRequest(
        "URL LinkedIn invalide. Formats acceptés : /posts/username_activity-ID ou /feed/update/urn:li:activity:ID"
      );
    }

    const unipileDsn = Deno.env.get("UNIPILE_DSN");
    const unipileApiKey = Deno.env.get("UNIPILE_API_KEY");

    if (!unipileDsn || !unipileApiKey) {
      return errors.internal("Service Unipile non configuré.");
    }

    // Fetch post content from Unipile with timeout
    const unipileController = new AbortController();
    const unipileTimeout = setTimeout(() => unipileController.abort(), UNIPILE_TIMEOUT_MS);

    let unipileResponse: Response;
    try {
      unipileResponse = await fetch(
        `https://${unipileDsn}/api/v1/linkedin/posts/${postId}`,
        {
          headers: {
            "X-API-KEY": unipileApiKey,
            "Accept": "application/json",
          },
          signal: unipileController.signal,
        }
      );
    } finally {
      clearTimeout(unipileTimeout);
    }

    if (!unipileResponse.ok) {
      const errorText = await unipileResponse.text();
      if (unipileResponse.status === 404) {
        return errors.notFound("Post LinkedIn introuvable. Vérifiez l'URL ou les permissions du compte.");
      }
      if (unipileResponse.status === 401) {
        return errors.unauthorized("Connexion Unipile invalide. Contactez le support.");
      }
      return errors.internal(`Erreur Unipile: ${errorText}`);
    }

    const postData = await unipileResponse.json();
    const postContent: string =
      postData.text ||
      postData.commentary ||
      postData.content ||
      postData.description ||
      "";

    if (!postContent.trim()) {
      return errors.badRequest("Le post LinkedIn ne contient pas de texte exploitable.");
    }

    const postPreview = postContent.slice(0, 150) + (postContent.length > 150 ? "..." : "");

    // Load system prompt from cache or DB
    if (!cachedSystemPrompt) {
      const serviceClient = getServiceClient();
      const { data: promptRow } = await serviceClient
        .from("ai_prompts")
        .select("content")
        .eq("name", "linkedin_to_template")
        .single();
      cachedSystemPrompt = promptRow?.content || FALLBACK_PROMPT;
    }

    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) {
      return errors.internal("Service IA non configuré.");
    }

    // Call OpenRouter with timeout, temperature lowered for consistency
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), AI_TIMEOUT_MS);

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": Deno.env.get("SITE_URL") || "https://localhost",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 600,
          temperature: 0.5,
          messages: [
            { role: "system", content: cachedSystemPrompt },
            {
              role: "user",
              content: `Voici le post LinkedIn à convertir en template WhatsApp :\n\n${postContent}`,
            },
          ],
        }),
        signal: aiController.signal,
      });
    } finally {
      clearTimeout(aiTimeout);
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return errors.internal(mapAiError(errorText));
    }

    const aiData = await aiResponse.json();
    const generatedContent: string = aiData.choices?.[0]?.message?.content?.trim() || "";

    if (!generatedContent) {
      return errors.internal("La génération du template a échoué. Réessayez.");
    }

    const variablesFound = extractVariables(generatedContent);

    // Warn if key variables are missing
    const requiredVars = ["client_name", "hotel_name"];
    const missingVars = requiredVars.filter((v) => !variablesFound.includes(v));
    if (missingVars.length > 0) {
      // Still return — the content may be usable even if imperfect
      return success({
        content: generatedContent,
        variables_found: variablesFound,
        post_preview: postPreview,
        warning: `Variables manquantes dans le template : ${missingVars.join(", ")}`,
      });
    }

    return success({
      content: generatedContent,
      variables_found: variablesFound,
      post_preview: postPreview,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return errors.internal(mapAiError(message));
  }
});
