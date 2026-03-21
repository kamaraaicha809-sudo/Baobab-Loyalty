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

const FALLBACK_PROMPT = `Tu es un expert en marketing hôtelier spécialisé dans les messages WhatsApp pour l'Afrique francophone.

Ton rôle : convertir le contenu d'un post LinkedIn en un template de message WhatsApp chaleureux et incitatif.

Règles OBLIGATOIRES :
1. Longueur : maximum 200 mots
2. Ton : chaleureux, personnel, professionnel (tu vouvoies le client)
3. Intègre EXACTEMENT ces variables là où elles sont pertinentes :
   - {{client_name}} : prénom du client
   - {{hotel_name}} : nom de l'hôtel
   - {{offer_discount}} : valeur de la réduction/avantage
   - {{valid_until}} : date limite de l'offre
4. Structure recommandée :
   - Accroche personnalisée avec {{client_name}}
   - Corps du message avec l'offre adaptée
   - Appel à l'action clair
5. NE PAS copier mot pour mot le post LinkedIn — adapter au format WhatsApp
6. Commencer directement par le message (pas de titre, pas d'explication)

Réponds UNIQUEMENT avec le template WhatsApp, rien d'autre.`;

/**
 * Extracts the LinkedIn activity ID from a post URL
 * Supports both formats:
 *   https://www.linkedin.com/posts/username_activity-1234567890123456789-XXXX
 *   https://www.linkedin.com/feed/update/urn:li:activity:1234567890123456789
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    // Demo mode check
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";

    let userId: string;

    if (isDemoMode) {
      userId = "demo-user-id";
    } else {
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

      userId = user.id;
    }

    // Parse body
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return errors.badRequest("LinkedIn post URL is required");
    }

    try {
      new URL(url);
    } catch {
      return errors.badRequest("Invalid URL format");
    }

    // Extract post ID from URL
    const postId = extractLinkedinPostId(url);
    if (!postId) {
      return errors.badRequest(
        "URL LinkedIn invalide. Formats acceptés : /posts/username_activity-ID ou /feed/update/urn:li:activity:ID"
      );
    }

    // Fetch Unipile credentials
    const unipileDsn = Deno.env.get("UNIPILE_DSN");
    const unipileApiKey = Deno.env.get("UNIPILE_API_KEY");

    if (!unipileDsn || !unipileApiKey) {
      return errors.internal("Unipile service not configured");
    }

    // Fetch post content from Unipile
    const unipileResponse = await fetch(
      `https://${unipileDsn}/api/v1/linkedin/posts/${postId}`,
      {
        headers: {
          "X-API-KEY": unipileApiKey,
          "Accept": "application/json",
        },
      }
    );

    if (!unipileResponse.ok) {
      const errorText = await unipileResponse.text();
      if (unipileResponse.status === 404) {
        return errors.notFound("Post LinkedIn introuvable. Vérifiez l'URL.");
      }
      if (unipileResponse.status === 401) {
        return errors.unauthorized("Connexion Unipile invalide.");
      }
      return errors.internal(`Unipile error: ${errorText}`);
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

    // Load system prompt from ai_prompts table
    const serviceClient = getServiceClient();
    const { data: promptRow } = await serviceClient
      .from("ai_prompts")
      .select("content")
      .eq("name", "linkedin_to_template")
      .single();

    const systemPrompt = promptRow?.content || FALLBACK_PROMPT;

    // Call OpenRouter to generate the template
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) {
      return errors.internal("AI service not configured");
    }

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("SITE_URL") || "https://localhost",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 512,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Voici le post LinkedIn à convertir :\n\n${postContent}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return errors.internal(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent: string = aiData.choices?.[0]?.message?.content?.trim() || "";

    if (!generatedContent) {
      return errors.internal("La génération du template a échoué.");
    }

    const variablesFound = extractVariables(generatedContent);

    return success({
      content: generatedContent,
      variables_found: variablesFound,
      post_preview: postPreview,
    });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Internal error");
  }
});
