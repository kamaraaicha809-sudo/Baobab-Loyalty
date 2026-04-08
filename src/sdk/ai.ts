/**
 * AI SDK module
 * Functions for AI content generation via OpenRouter
 */

import { callEdgeFunction } from "./_core";

// Types
export interface GenerateParams {
  prompt: string;
  system?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateCampaignMessageParams {
  typeOffre: string;
  avantage: string;
  segment: "3mois" | "6mois" | "9mois" | "tous";
  hotelName?: string;
}

export interface GenerateLinkedInPostParams {
  subject: string;
  hotelName?: string;
  tone?: "professionnel" | "chaleureux" | "inspirant";
  offer?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  "3mois": "clients absents depuis 3 mois",
  "6mois": "clients absents depuis 6 mois",
  "9mois": "clients absents depuis 9 mois",
  "tous": "tous les clients",
};

const LINKEDIN_SYSTEM_PROMPT = `Tu es un expert en contenu LinkedIn pour directeurs d'hotels en Afrique francophone.

ROLE : Tu rediges UN post LinkedIn au nom du directeur d'hotel, destine a ses pairs professionnels.
AUDIENCE : Autres hoteliers, partenaires, agences de voyage, investisseurs. PAS des clients finaux.

REGLES ABSOLUES — sans aucune exception :
- Texte brut UNIQUEMENT : zero emoji, zero asterisque (*), zero Markdown, zero mise en forme
- Ne commence JAMAIS par une salutation ("Chers", "Bonjour", "Hello")
- Ton professionnel, direct, ancre dans le metier hotelier
- L'offre si mentionnee est un angle strategique ou insight metier, pas une publicite

STRUCTURE OBLIGATOIRE :
1. Accroche (1 phrase) : chiffre concret OU question percutante OU affirmation forte
2. Developpement (3 paragraphes courts) : contexte, analyse, perspective metier
3. Question ouverte finale pour susciter la discussion entre professionnels
4. 3 a 5 hashtags metier sur la derniere ligne

LONGUEUR : 150 a 250 mots. Un seul post, pas de variantes, pas de commentaires.`;

/**
 * Generate content using AI
 * Requires active subscription
 */
export async function generate(
  params: GenerateParams
): Promise<GenerateResponse> {
  return callEdgeFunction<GenerateResponse>("ai-generate", {
    method: "POST",
    body: params,
  });
}

/**
 * Generate a WhatsApp campaign message using the campaign_whatsapp prompt
 * Uses claude-haiku for speed and cost efficiency on short texts
 */
export async function generateCampaignMessage(
  params: GenerateCampaignMessageParams
): Promise<GenerateResponse> {
  const { typeOffre, avantage, segment, hotelName } = params;

  const segmentLabel = SEGMENT_LABELS[segment] || segment;

  const userPrompt = [
    `Type d'offre : ${typeOffre}`,
    `Avantage concret : ${avantage}`,
    `Segment cible : ${segmentLabel}`,
    hotelName ? `Nom de l'hotel : ${hotelName}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return callEdgeFunction<GenerateResponse>("ai-generate", {
    method: "POST",
    body: {
      prompt: userPrompt,
      promptName: "campaign_whatsapp",
      model: "anthropic/claude-haiku-4-5",
      maxTokens: 300,
      temperature: 0.6,
    },
  });
}

/**
 * Generate a LinkedIn post from a subject
 * System prompt is hardcoded to guarantee consistent B2B output
 */
export async function generateLinkedInPost(
  params: GenerateLinkedInPostParams
): Promise<GenerateResponse> {
  const { subject, hotelName, tone = "professionnel", offer } = params;
  const promptParts = [
    `Sujet : ${subject}`,
    `Ton souhaite : ${tone}`,
  ];
  if (hotelName) promptParts.push(`Nom de l'hotel : ${hotelName}`);
  if (offer) promptParts.push(`Offre a mentionner (angle strategique, pas publicitaire) : ${offer}`);

  return callEdgeFunction<GenerateResponse>("ai-generate", {
    method: "POST",
    body: {
      prompt: promptParts.join("\n"),
      system: LINKEDIN_SYSTEM_PROMPT,
      model: "openai/gpt-4o",
      maxTokens: 800,
    },
  });
}

// Export as namespace
export const ai = {
  generate,
  generateCampaignMessage,
  generateLinkedInPost,
};
