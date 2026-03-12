/**
 * billing-create-portal
 * Creates a Stripe Customer Portal session
 *
 * Auth: Required (JWT)
 * Method: POST
 * Body: { returnUrl }
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

    const body = await req.json();
    const { returnUrl } = body;

    if (!returnUrl) return errors.badRequest("Missing returnUrl");

    // Get customer ID
    const { data: profile } = await userClient
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.customer_id) {
      return errors.badRequest("No billing account found. Make a purchase first.");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return errors.internal("Payment service not configured");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.customer_id,
      return_url: returnUrl,
    });

    return success({ url: portalSession.url });
  } catch (err) {
    console.error("billing-create-portal error:", err);
    return errors.internal(err instanceof Error ? err.message : "Portal creation failed");
  }
});
