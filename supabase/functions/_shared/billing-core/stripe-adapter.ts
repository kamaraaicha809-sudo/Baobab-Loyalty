/**
 * Adaptateur Stripe du Billing Core (Europe uniquement). Implémente
 * BillingAdapter (types.ts) via des appels REST bruts à l'API Stripe — même
 * choix que l'intégration Moneroo existante (billing-create-checkout),
 * jamais de SDK, pour rester cohérent avec le style du dépôt et éviter les
 * problèmes d'interopérabilité npm/Deno.
 *
 * TEST MODE uniquement tant que STRIPE_SECRET_KEY (secret Edge Function du
 * projet Europe) n'est pas une clé "live" — et surtout, tant que
 * l'utilisatrice n'a pas validé le passage en production, aucune clé live ne
 * doit être configurée ici.
 */

import type { BillingAdapter, CheckoutParams, CheckoutSession, WebhookEvent } from "./types.ts";

const STRIPE_API = "https://api.stripe.com/v1";

// deno-lint-ignore no-explicit-any
type StripeParams = Record<string, any>;

// Encode un objet (potentiellement imbriqué) au format
// application/x-www-form-urlencoded avec la syntaxe à crochets attendue par
// l'API Stripe (ex: line_items[0][price_data][unit_amount]=7900).
function encodeStripeParams(params: StripeParams, prefix = ""): string[] {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object" && !Array.isArray(value)) {
      pairs.push(...encodeStripeParams(value as StripeParams, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "object") pairs.push(...encodeStripeParams(item as StripeParams, `${fullKey}[${i}]`));
        else pairs.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else {
      pairs.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return pairs;
}

async function stripeRequest(secretKey: string, path: string, method: "GET" | "POST", params?: StripeParams): Promise<StripeParams> {
  const body = params ? encodeStripeParams(params).join("&") : undefined;
  const url = method === "GET" && body ? `${STRIPE_API}${path}?${body}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "POST" ? body : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe error ${res.status}: ${data?.error?.message ?? JSON.stringify(data)}`);
  }
  return data;
}

// Vérification manuelle de signature Stripe (schéma "t=...,v1=..."),
// implémentée via Web Crypto (HMAC-SHA256) plutôt que le SDK Stripe — même
// choix de dépendance minimale que le reste de l'adaptateur. Tolérance de 5
// minutes sur l'horodatage, valeur par défaut du SDK officiel.
async function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(signatureHeader.split(",").map((p) => p.split("=") as [string, string]));
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const toleranceSeconds = 5 * 60;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Comparaison en temps constant (longueur déjà égale pour deux hex SHA-256).
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export function createStripeAdapter(secretKey: string): BillingAdapter {
  return {
    provider: "stripe",

    async createCheckout(params: CheckoutParams): Promise<CheckoutSession> {
      const isB2B = params.customerType === "b2b";
      const session = await stripeRequest(secretKey, "/checkout/sessions", "POST", {
        mode: "subscription",
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.email,
        automatic_tax: { enabled: true },
        tax_id_collection: { enabled: isB2B },
        customer_update: { address: "auto", name: "auto" },
        line_items: [
          {
            // price_data (dynamique) plutôt qu'un Price Stripe pré-créé : le
            // montant est TOUJOURS recalculé ici depuis plan_prices
            // (source de vérité serveur), jamais depuis une valeur envoyée
            // par le frontend — voir gdpr et campagne pour le même principe.
            price_data: {
              currency: "eur",
              unit_amount: params.amountExclTaxCents,
              recurring: { interval: "month" },
              product_data: { name: `Baobab Loyalty Europe — ${params.planId}` },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: params.trialDays,
          metadata: { profile_id: params.profileId, plan_id: params.planId },
        },
        metadata: { profile_id: params.profileId, plan_id: params.planId },
      });

      return { checkoutUrl: session.url, sessionId: session.id, provider: "stripe" };
    },

    async createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
      const session = await stripeRequest(secretKey, "/billing_portal/sessions", "POST", {
        customer: customerId,
        return_url: returnUrl,
      });
      return session.url;
    },

    async verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
      return verifyStripeSignature(rawBody, signature, secret);
    },

    parseWebhookEvent(rawBody: string): WebhookEvent {
      const parsed = JSON.parse(rawBody);
      const obj = parsed?.data?.object ?? {};
      return {
        provider: "stripe",
        eventType: parsed.type,
        profileId: obj?.metadata?.profile_id ?? obj?.subscription_data?.metadata?.profile_id ?? null,
        planId: obj?.metadata?.plan_id ?? null,
        amount: null,
        rawEventId: parsed.id,
        raw: parsed,
      };
    },
  };
}
