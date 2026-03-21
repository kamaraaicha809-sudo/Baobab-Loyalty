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

// Export as namespace
export const ai = {
  generate,
};
