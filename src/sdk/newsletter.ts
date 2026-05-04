/**
 * Newsletter SDK module
 * Public subscription — no auth required
 */

import { callEdgeFunction, SdkError } from "./_core";

// Types

export interface SubscribeParams {
  email: string;
  name?: string;
  source?: string;
}

export interface SubscribeResponse {
  subscribed: boolean;
  demo?: boolean;
}

/**
 * Subscribe an email address to the newsletter.
 * Returns { ok: true, data: { subscribed: true } } on success.
 * Returns { ok: false, error: { code: "ALREADY_SUBSCRIBED", ... } } if duplicate.
 * Public endpoint — no authentication required.
 */
export async function subscribe(
  params: SubscribeParams
): Promise<SubscribeResponse> {
  return callEdgeFunction<SubscribeResponse>("newsletter-subscribe", {
    method: "POST",
    body: params,
    requireAuth: false,
  });
}

export const newsletter = {
  subscribe,
};

export type { SubscribeParams as NewsletterSubscribeParams, SubscribeResponse as NewsletterSubscribeResponse };

// Re-export SdkError so callers can check error codes
export { SdkError };
