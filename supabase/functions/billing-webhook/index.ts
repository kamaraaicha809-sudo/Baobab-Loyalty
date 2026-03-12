/**
 * billing-webhook
 * Handles Stripe webhook events
 *
 * Auth: Stripe signature verification (no JWT)
 * Method: POST
 */

import { createClient, Stripe } from "../_shared/deps.ts";
import type { SupabaseClient } from "../_shared/deps.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();
  if (req.method !== "POST") return errors.badRequest("Method not allowed");

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) return errors.internal("Server configuration error");

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return errors.badRequest("Missing stripe-signature header");

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return errors.badRequest("Invalid signature");
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, supabase, session);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }
      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return success({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return errors.internal("Webhook processing failed");
  }
});

async function handleCheckoutCompleted(
  stripe: Stripe,
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const customerId = session.customer as string;
  const userId = session.client_reference_id;

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items"],
  });
  const priceId = fullSession.line_items?.data[0]?.price?.id;
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as Stripe.Customer).email;

  let profileId = userId;

  if (!profileId && email) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      profileId = existingProfile.id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (authError) throw authError;
      profileId = authData.user?.id;
    }
  }

  if (!profileId) throw new Error("Could not determine user ID for checkout");

  const { error } = await supabase.from("profiles").upsert({
    id: profileId,
    email,
    customer_id: customerId,
    price_id: priceId,
    has_access: true,
  });
  if (error) throw error;
  console.log(`Checkout completed for user ${profileId}`);
}

async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const { error } = await supabase
    .from("profiles")
    .update({ has_access: false })
    .eq("customer_id", customerId);
  if (error) throw error;
  console.log(`Access revoked for customer ${customerId}`);
}

async function handleInvoicePaid(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;
  const priceId = invoice.lines.data[0]?.price?.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("price_id")
    .eq("customer_id", customerId)
    .single();

  if (profile?.price_id !== priceId) return;

  const { error } = await supabase
    .from("profiles")
    .update({ has_access: true })
    .eq("customer_id", customerId);
  if (error) throw error;
  console.log(`Invoice paid for customer ${customerId}`);
}
