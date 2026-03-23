/**
 * billing-create-checkout
 * Creates a Moneroo payment session
 *
 * Auth: Required (JWT)
 * Method: POST
 * Body: { planSlug, amount, planName, currency?, successUrl, cancelUrl }
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

const MONEROO_API_URL = "https://api.moneroo.io/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Payments are disabled in demo mode");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const body = await req.json();
    const { planSlug, amount, planName, currency = "XOF", successUrl, cancelUrl } = body;

    if (!planSlug || !amount || !successUrl || !cancelUrl) {
      return errors.badRequest("Missing required fields: planSlug, amount, successUrl, cancelUrl");
    }

    // Get user profile
    const { data: profile } = await userClient
      .from("profiles")
      .select("email, name")
      .eq("id", user.id)
      .single();

    const email = profile?.email || user.email || "";
    const fullName = (profile?.name || email.split("@")[0] || "Client").trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const apiKey = Deno.env.get("MONEROO_API_KEY");
    if (!apiKey) return errors.internal("Payment service not configured");

    const response = await fetch(`${MONEROO_API_URL}/payments/initialize`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        description: `Abonnement Baobab Loyalty - Plan ${planName || planSlug}`,
        return_url: successUrl,
        cancel_url: cancelUrl,
        customer: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
        metadata: {
          user_id: user.id,
          plan: planSlug,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return errors.internal(`Moneroo error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const checkoutUrl = data?.data?.checkout_url;

    if (!checkoutUrl) {
      return errors.internal("Payment initialization failed");
    }

    return success({ url: checkoutUrl, paymentId: data?.data?.id });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Checkout failed");
  }
});
