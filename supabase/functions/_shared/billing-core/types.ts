/**
 * Billing Core - contrat commun Afrique (Moneroo/XOF) / Europe (Stripe/EUR).
 * Prepare uniquement : aucun appel Stripe reel, aucun paiement possible
 * tant que cette interface n'est pas branchee a un adaptateur concret et
 * validee. Le calcul HT/TVA/TTC reste toujours cote serveur (jamais fige
 * dans le frontend).
 */

export interface PriceBreakdown {
  amountExclTax: number;
  taxRate: number;
  taxAmount: number;
  amountInclTax: number;
  currency: "XOF" | "EUR";
}

export interface CheckoutParams {
  profileId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
  email: string;
  // Toujours calcules cote serveur (plan_prices), jamais recus du frontend.
  amountExclTaxCents: number;
  trialDays: number;
  // Necessaires pour Stripe Tax (B2B/B2C, autoliquidation, numero de TVA) —
  // sans equivalent cote Moneroo (XOF, pas de TVA UE a calculer).
  customerType?: "b2b" | "b2c";
  vatNumber?: string;
  countryCode?: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
  provider: "moneroo" | "stripe";
}

export interface WebhookEvent {
  provider: "moneroo" | "stripe";
  eventType: string;
  profileId: string | null;
  planId: string | null;
  amount: PriceBreakdown | null;
  rawEventId: string;
  // Contenu brut deja parse (JSON), pour que le handler du webhook accede
  // aux champs specifiques a l'evenement (subscription id, invoice id...)
  // sans que l'adapter ait a tout modeliser dans PriceBreakdown/WebhookEvent.
  raw: Record<string, unknown>;
}

// Chaque marche implemente ce contrat. Moneroo (Afrique) existe deja en
// production sous une forme non abstraite (billing-create-checkout) —
// StripeBillingAdapter (Europe) l'implemente separement, jamais partagee
// avec le code Afrique.
export interface BillingAdapter {
  provider: "moneroo" | "stripe";
  createCheckout(params: CheckoutParams): Promise<CheckoutSession>;
  createBillingPortalSession(customerId: string, returnUrl: string): Promise<string>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean>;
  parseWebhookEvent(rawBody: string): WebhookEvent;
}
