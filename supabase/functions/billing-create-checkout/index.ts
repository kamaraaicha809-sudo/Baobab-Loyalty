/**
 * billing-create-checkout
 * Creates a Stripe Checkout Session
 *
 * Auth: Required (JWT)
 * Method: POST
 * Body: { priceId, mode, successUrl, cancelUrl, couponId? }
 */

import { Stripe } from "../_shared/deps.ts";
import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    // Parse body
    const body = await req.json();
    const { priceId, mode = "payment", successUrl, cancelUrl, couponId } = body;

    if (!priceId || !successUrl || !cancelUrl) {
      return errors.badRequest("Missing required fields: priceId, successUrl, cancelUrl");
    }

    // Get user profile
    const { data: profile } = await userClient
      .from("profiles")
      .select("email, customer_id")
      .eq("id", user.id)
      .single();

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return errors.internal("Payment service not configured");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Build checkout params
    const extraParams: Record<string, unknown> = {};

    if (profile?.customer_id) {
      extraParams.customer = profile.customer_id;
    } else {
      if (mode === "payment") {
        extraParams.customer_creation = "always";
        extraParams.payment_intent_data = { setup_future_usage: "on_session" };
      }
      if (profile?.email || user.email) {
        extraParams.customer_email = profile?.email || user.email;
      }
      extraParams.tax_id_collection = { enabled: true };
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: couponId ? [{ coupon: couponId }] : [],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...extraParams,
    });

    return success({ url: session.url });
  } catch (err) {
    console.error("billing-create-checkout error:", err);
    return errors.internal(err instanceof Error ? err.message : "Checkout failed");
  }
});
