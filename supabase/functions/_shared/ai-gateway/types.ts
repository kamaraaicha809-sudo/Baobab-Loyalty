/**
 * Baobab AI Gateway - contrats partages (Europe uniquement, non deploye).
 *
 * But : Baobab n'appelle jamais un fournisseur IA directement depuis une
 * Edge Function metier. Toute generation passe par ce contrat, pour que :
 * (1) le fournisseur soit remplacable sans toucher au code appelant
 *     (Mistral EU aujourd'hui, un autre fournisseur ou un deploiement
 *     souverain/prive demain) ;
 * (2) seules des donnees agregees/pseudonymisees puissent transiter
 *     (AggregatedContext ne contient aucun champ nominatif) ;
 * (3) chaque generation soit tracable (AIGatewayLogEntry) sans jamais
 *     stocker de donnee personnelle dans le journal.
 */

// Jamais de nom, email, telephone, adresse ou historique client individuel ici.
export interface AggregatedContext {
  segmentLabel: string;
  clientCount: number;
  averageTenureMonths: number;
  averageVisitFrequencyPerYear: number;
  averageSpendEUR: number;
  averageRecencyDays: number;
  primaryLanguage: string;
  aggregateEngagementRate: number;
}

export type AIGenerationType =
  | "campaign_message"
  | "campaign_subject"
  | "linkedin_post";

export interface AIRequest {
  generationType: AIGenerationType;
  context: AggregatedContext;
  promptVersion: string;
  campaignId: string;
}

export interface AIResult {
  content: string;
  modelUsed: string;
  providerId: string;
  estimatedCostEUR: number;
  requestId: string;
}

// Contrat que chaque fournisseur (Mistral, futur fournisseur, deploiement prive) doit respecter.
export interface AIProvider {
  id: string;
  supportsZeroDataRetention: boolean;
  complete(input: AIRequest): Promise<AIResult>;
}

// Ecrit dans ai_gateway_log (voir migrations-europe/002_ai_gateway_log.sql) :
// tracabilite complete sans aucune donnee personnelle.
export interface AIGatewayLogEntry {
  providerId: string;
  modelUsed: string;
  endpoint: string;
  generationType: AIGenerationType;
  campaignId: string;
  promptVersion: string;
  requestId: string;
  estimatedCostEUR: number;
  status: "success" | "error";
  createdAt: string;
}
