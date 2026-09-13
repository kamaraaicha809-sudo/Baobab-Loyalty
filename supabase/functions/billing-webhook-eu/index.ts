/**
 * billing-webhook-eu
 * Reçoit les événements Stripe (abonnement, facture) pour le projet Europe.
 * Fonction Europe uniquement — jamais partagée avec billing-webhook (Moneroo).
 *
 * Auth: signature Stripe (Stripe-Signature header), pas de JWT (voir
 * config.toml équivalent : déployée avec --no-verify-jwt).
 * Method: POST
 *
 * Idempotence : chaque event.id Stripe est enregistré une seule fois dans
 * billing_webhook_events (contrainte UNIQUE) — un retry ou un replay Stripe
 * du même événement est silencieusement ignoré (pas de double crédit d'accès,
 * pas de facture dupliquée).
 */

import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { getServiceClient } from "../_shared/auth.ts";
import { createStripeAdapter } from "../_shared/billing-core/stripe-adapter.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();
  if (req.method !== "POST") return errors.badRequest("Method not allowed");

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!webhookSecret || !secretKey) return errors.internal("Server configuration error");

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return errors.badRequest("Missing stripe-signature header");

  const adapter = createStripeAdapter(secretKey);
  const isValid = await adapter.verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) return errors.badRequest("Invalid signature");

  const event = adapter.parseWebhookEvent(rawBody);
  const db = getServiceClient();

  // Idempotence : INSERT échoue silencieusement (contrainte UNIQUE) si cet
  // event_id a déjà été traité — on répond succès sans rien retraiter.
  const { error: dedupeError } = await db
    .from("billing_webhook_events")
    .insert({ provider: "stripe", event_id: event.rawEventId, event_type: event.eventType });
  if (dedupeError) {
    if (dedupeError.code === "23505") return success({ received: true, deduplicated: true });
    return errors.internal(dedupeError.message);
  }

  try {
    const obj = event.raw?.data && typeof event.raw.data === "object" ? (event.raw.data as Record<string, unknown>).object as Record<string, unknown> : {};

    switch (event.eventType) {
      case "checkout.session.completed": {
        const metadata = obj.metadata as Record<string, string> | undefined;
        const profileId = metadata?.profile_id;
        const planId = metadata?.plan_id;
        const customerId = obj.customer as string | undefined;
        const subscriptionId = obj.subscription as string | undefined;
        if (!profileId || !customerId) break;

        await db
          .from("subscriptions")
          .update({ provider_customer_id: customerId, provider_subscription_id: subscriptionId ?? null, plan_id: planId ?? undefined, status: "trialing", updated_at: new Date().toISOString() })
          .eq("profile_id", profileId);

        // Synchronise les colonnes existantes de profiles (has_access,
        // price_id, trial_ends_at) — mêmes champs que le webhook Moneroo,
        // pour que hasActiveAccess() (_shared/access.ts) fonctionne à
        // l'identique quel que soit le fournisseur de paiement.
        const { data: plan } = await db.from("plan_prices").select("trial_days").eq("plan_id", planId ?? "").maybeSingle();
        const trialDays = plan?.trial_days ?? 14;
        await db
          .from("profiles")
          .update({ price_id: planId ?? null, trial_ends_at: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", profileId);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const metadata = obj.metadata as Record<string, string> | undefined;
        const profileId = metadata?.profile_id;
        const status = obj.status as string | undefined;
        const currentPeriodStart = obj.current_period_start as number | undefined;
        const currentPeriodEnd = obj.current_period_end as number | undefined;
        const cancelAtPeriodEnd = obj.cancel_at_period_end as boolean | undefined;
        if (!profileId) break;

        await db
          .from("subscriptions")
          .update({
            status: status ?? "active",
            current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
            current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
            cancel_at_period_end: cancelAtPeriodEnd ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq("profile_id", profileId);

        const hasActive = status === "trialing" || status === "active";
        await db
          .from("profiles")
          .update({
            has_access: hasActive,
            access_until: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          })
          .eq("id", profileId);
        break;
      }

      case "customer.subscription.deleted": {
        const metadata = obj.metadata as Record<string, string> | undefined;
        const profileId = metadata?.profile_id;
        if (!profileId) break;

        await db.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("profile_id", profileId);
        await db.from("profiles").update({ has_access: false }).eq("id", profileId);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const customerId = obj.customer as string | undefined;
        if (!customerId) break;

        const { data: sub } = await db
          .from("subscriptions")
          .select("id, profile_id")
          .eq("provider_customer_id", customerId)
          .maybeSingle();
        if (!sub) break;

        if (event.eventType === "invoice.payment_failed") {
          await db.from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("id", sub.id);
          break;
        }

        const total = (obj.total as number | undefined) ?? 0;
        const tax = (obj.tax as number | undefined) ?? 0;
        const subtotal = (obj.subtotal as number | undefined) ?? total - tax;
        const currency = (obj.currency as string | undefined) ?? "eur";
        const country = (obj.customer_address as Record<string, unknown> | undefined)?.country as string | undefined;
        const taxIds = obj.customer_tax_ids as Array<{ value?: string }> | undefined;
        const vatNumber = taxIds?.[0]?.value ?? null;
        const taxRateBps = subtotal > 0 ? Math.round((tax / subtotal) * 10000) : 0;

        await db.from("invoices").upsert(
          {
            profile_id: sub.profile_id,
            subscription_id: sub.id,
            provider_invoice_id: obj.id as string,
            amount_excl_tax_cents: subtotal,
            tax_rate_bps: taxRateBps,
            tax_amount_cents: tax,
            amount_incl_tax_cents: total,
            currency,
            country_code: country ?? null,
            customer_type: vatNumber ? "b2b" : "b2c",
            vat_number: vatNumber,
            reverse_charge: !!vatNumber && country !== "FR",
            status: "paid",
            invoice_pdf_url: (obj.invoice_pdf as string) ?? null,
            period_start: obj.period_start ? new Date((obj.period_start as number) * 1000).toISOString() : null,
            period_end: obj.period_end ? new Date((obj.period_end as number) * 1000).toISOString() : null,
          },
          { onConflict: "provider_invoice_id" }
        );
        break;
      }

      default:
        break;
    }

    return success({ received: true });
  } catch (err) {
    console.error("[billing-webhook-eu] processing failed:", err);
    return errors.internal("Webhook processing failed");
  }
});
