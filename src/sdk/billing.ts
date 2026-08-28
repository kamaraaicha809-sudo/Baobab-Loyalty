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
  type?: "subscription" | "onboarding_fee";
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
 * Démarre le paiement unique du frais d'intégration (49 000 FCFA) pour un
 * hôtel sans base de données électronique — voir config.js (billing.onboardingFee).
 */
export async function createOnboardingFeeCheckout(
  params: Pick<CreateCheckoutParams, "successUrl" | "cancelUrl">
): Promise<CreateCheckoutResponse> {
  return callEdgeFunction<CreateCheckoutResponse>("billing-create-checkout", {
    method: "POST",
    body: {
      planSlug: "onboarding_fee",
      planName: "Frais d'intégration",
      type: "onboarding_fee",
      ...params,
    },
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
  createOnboardingFeeCheckout,
  createPortal,
};
