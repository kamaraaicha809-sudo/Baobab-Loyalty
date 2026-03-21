/**
 * Billing SDK module
 * Functions for Moneroo checkout
 */

import { callEdgeFunction } from "./_core";

// Types
export interface CreateCheckoutParams {
  planSlug: string;
  amount: number;
  planName: string;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  url: string;
  paymentId?: string;
}

export interface CreatePortalParams {
  returnUrl: string;
}

export interface CreatePortalResponse {
  url: string;
}

/**
 * Create a Moneroo payment session
 * Redirects user to Moneroo checkout
 */
export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResponse> {
  return callEdgeFunction<CreateCheckoutResponse>("billing-create-checkout", {
    method: "POST",
    body: params,
  });
}

/**
 * Get billing management URL
 */
export async function createPortal(
  params: CreatePortalParams
): Promise<CreatePortalResponse> {
  return callEdgeFunction<CreatePortalResponse>("billing-create-portal", {
    method: "POST",
    body: params,
  });
}

// Export as namespace
export const billing = {
  createCheckout,
  createPortal,
};
