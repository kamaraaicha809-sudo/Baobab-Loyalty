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
  segment: "3-6mois" | "6-9mois" | "9-12mois" | "1an+" | "tous";
  hotelName?: string;
}

export interface GenerateLinkedInPostParams {
  subject: string;
  hotelName?: string;
  tone?: "professionnel" | "chaleureux" | "inspirant";
  offer?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  "3-6mois":  "clients absents depuis 3 à 6 mois",
  "6-9mois":  "clients absents depuis 6 à 9 mois",
  "9-12mois": "clients absents depuis 9 à 12 mois",
  "1an+":     "clients absents depuis plus d'un an",
  "tous":     "tous les clients",
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
      promptName: "linkedin_post",
      model: "openai/gpt-4o",
      maxTokens: 800,
    },
  });
}

// Catalogue réel des offres proposables (même liste que TEMPLATES dans
// app/dashboard/templates/page.tsx, "vide" exclu car ce n'est pas une offre).
// Dupliqué ici plutôt qu'importé : ce fichier est un composant client avec
// des dépendances React, pas exportable proprement vers le SDK.
const OFFER_CATALOG: { id: string; name: string }[] = [
  { id: "remise", name: "Remise Exceptionnelle" },
  { id: "surclassement", name: "Surclassement Offert" },
  { id: "cocktail", name: "Cocktail de Bienvenue" },
  { id: "famille", name: "Offre Famille" },
  { id: "evenements", name: "Événements Spéciaux" },
  { id: "sondage", name: "Sondage Satisfaction" },
];

export const OFFER_TEMPLATE_NAMES: Record<string, string> = Object.fromEntries(
  OFFER_CATALOG.map((o) => [o.id, o.name])
);

const RECOMMENDATION_SYSTEM_PROMPT = `Tu es un assistant commercial pour un hotel en Afrique francophone qui utilise Baobab Loyalty.

ROLE : a partir de donnees reelles (segments de clients inactifs, taux de conversion mesure), tu recommandes UNE seule action commerciale prioritaire parmi les opportunites fournies.

CATALOGUE D'OFFRES DISPONIBLES (choisis UNIQUEMENT un id de cette liste) :
${OFFER_CATALOG.map((o) => `- ${o.id} : ${o.name}`).join("\n")}

FORMAT DE REPONSE OBLIGATOIRE : reponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni apres, sans bloc markdown, exactement ce schema :
{"segment_code": "...", "template_id": "...", "reasoning": "...", "best_timing": "..."}

- "segment_code" doit etre EXACTEMENT l'un des codes de segment listes dans les opportunites fournies (jamais un autre).
- "template_id" doit etre EXACTEMENT l'un des id du catalogue ci-dessus.
- "reasoning" : 1 a 2 phrases en francais expliquant pourquoi ce segment et cette offre, basees sur les chiffres fournis.
- "best_timing" : 1 phrase suggerant le meilleur moment pour lancer la campagne.
Ne rediges PAS le message de campagne. N'invente AUCUN chiffre : si tu cites un montant, utilise uniquement ceux deja fournis dans les donnees.`;

export interface RecommendCampaignParams {
  opportunities: {
    segmentCode: string;
    segmentLabel: string;
    clientCount: number;
    potentialRevenueFcfa: number | null;
  }[];
  funnel: {
    responseRate: number | null;
    conversionRate: number | null;
  };
}

export interface CampaignRecommendation {
  segmentCode: string;
  templateId: string;
  reasoning: string;
  bestTiming: string;
}

function parseRecommendation(raw: string, validSegmentCodes: string[]): CampaignRecommendation {
  let parsed: unknown;
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Réponse IA invalide (format inattendu). Réessayez.");
  }

  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const segmentCode = typeof obj.segment_code === "string" ? obj.segment_code : "";
  const templateId = typeof obj.template_id === "string" ? obj.template_id : "";
  const reasoning = typeof obj.reasoning === "string" ? obj.reasoning.trim() : "";
  const bestTiming = typeof obj.best_timing === "string" ? obj.best_timing.trim() : "";

  if (!validSegmentCodes.includes(segmentCode)) {
    throw new Error("Réponse IA invalide (segment inconnu). Réessayez.");
  }
  if (!OFFER_CATALOG.some((o) => o.id === templateId)) {
    throw new Error("Réponse IA invalide (offre inconnue). Réessayez.");
  }
  if (!reasoning || !bestTiming) {
    throw new Error("Réponse IA invalide (champs manquants). Réessayez.");
  }

  return { segmentCode, templateId, reasoning, bestTiming };
}

/**
 * Recommande UNE action commerciale prioritaire (segment + offre + moment)
 * parmi les opportunités déjà calculées (src/sdk/opportunities.ts) et la
 * performance réelle mesurée (src/sdk/funnel.ts). L'IA ne fait que choisir
 * et justifier — elle ne calcule ni n'invente aucun chiffre de revenu.
 */
export async function recommendCampaign(params: RecommendCampaignParams): Promise<CampaignRecommendation> {
  const validSegmentCodes = params.opportunities.map((o) => o.segmentCode);

  const promptLines = [
    "Opportunités actuelles (données réelles) :",
    ...params.opportunities.map(
      (o) =>
        `- ${o.segmentCode} (${o.segmentLabel}) : ${o.clientCount} clients, revenu potentiel ${
          o.potentialRevenueFcfa != null ? `${o.potentialRevenueFcfa} FCFA` : "non calculable (pas assez d'historique)"
        }`
    ),
    "",
    "Performance mesurée sur les 30 derniers jours :",
    `- Taux de réponse : ${
      params.funnel.responseRate != null ? `${Math.round(params.funnel.responseRate * 100)}%` : "pas encore mesuré"
    }`,
    `- Taux de conversion : ${
      params.funnel.conversionRate != null ? `${Math.round(params.funnel.conversionRate * 100)}%` : "pas encore mesuré"
    }`,
  ];

  const { content } = await callEdgeFunction<GenerateResponse>("ai-generate", {
    method: "POST",
    body: {
      prompt: promptLines.join("\n"),
      system: RECOMMENDATION_SYSTEM_PROMPT,
      promptName: "campaign_recommendation",
      model: "anthropic/claude-haiku-4-5",
      maxTokens: 300,
      temperature: 0.4,
    },
  });

  return parseRecommendation(content, validSegmentCodes);
}

// Export as namespace
export const ai = {
  generate,
  generateCampaignMessage,
  generateLinkedInPost,
  recommendCampaign,
};
