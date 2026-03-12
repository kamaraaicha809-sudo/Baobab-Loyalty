/**
 * Billing SDK module
 * Functions for Stripe checkout and customer portal
 */

import { callEdgeFunction } from "./_core";

// Types
export interface CreateCheckoutParams {
  priceId: string;
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  couponId?: string;
}

export interface CreateCheckoutResponse {
  url: string;
}

export interface CreatePortalParams {
  returnUrl: string;
}

export interface CreatePortalResponse {
  url: string;
}

/**
 * Create a Stripe Checkout session
 * Redirects user to Stripe for payment
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
 * Create a Stripe Customer Portal session
 * Allows user to manage subscription and payment methods
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
