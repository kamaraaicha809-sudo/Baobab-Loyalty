/**
 * billing-create-checkout-eu
 * Crée une session Stripe Checkout (abonnement, essai 14 jours, Stripe Tax).
 * Fonction Europe uniquement — jamais déployée sur Afrique, jamais partagée
 * avec billing-create-checkout (Moneroo).
 *
 * Auth: Required (JWT), owner uniquement
 * Method: POST
 * Body: { planId, successUrl, cancelUrl, customerType?, vatNumber?, countryCode? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { createStripeAdapter } from "../_shared/billing-core/stripe-adapter.ts";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Paiements désactivés en mode démo.");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const planId = typeof body?.planId === "string" ? body.planId : "";
    const successUrl = typeof body?.successUrl === "string" ? body.successUrl : "";
    const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";
    const customerType = body?.customerType === "b2b" ? "b2b" : body?.customerType === "b2c" ? "b2c" : undefined;
    const vatNumber = typeof body?.vatNumber === "string" ? body.vatNumber.trim() : undefined;
    const countryCode = typeof body?.countryCode === "string" ? body.countryCode.trim().toUpperCase() : undefined;

    if (!planId || !successUrl || !cancelUrl) return errors.badRequest("planId, successUrl et cancelUrl sont requis.");
    if (!isValidHttpUrl(successUrl) || !isValidHttpUrl(cancelUrl)) return errors.badRequest("successUrl et cancelUrl doivent être des URLs http(s) valides.");

    const { profile, teamRole } = await resolveProfile<{ id: string; email: string | null }>(userClient, user.id, "id, email");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner") return errors.forbidden("Seul le propriétaire du compte peut gérer la facturation.");

    const serviceClient = getServiceClient();

    // Le prix n'est JAMAIS pris depuis le client : recalculé ici depuis
    // plan_prices (source de vérité serveur), même principe que
    // PLAN_PRICES_XOF côté Afrique.
    const { data: plan, error: planError } = await serviceClient
      .from("plan_prices")
      .select("plan_id, price_excl_tax_cents, trial_days, active")
      .eq("plan_id", planId)
      .eq("active", true)
      .maybeSingle();
    if (planError) return errors.internal(planError.message);
    if (!plan) return errors.badRequest(`Plan inconnu ou inactif : "${planId}"`);

    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secretKey) return errors.internal("Stripe n'est pas encore configuré pour cet environnement.");

    const adapter = createStripeAdapter(secretKey);
    const email = profile.email || user.email || "";
    if (!email) return errors.badRequest("Aucun email associé à ce compte.");

    const session = await adapter.createCheckout({
      profileId: profile.id,
      planId: plan.plan_id,
      successUrl,
      cancelUrl,
      email,
      amountExclTaxCents: plan.price_excl_tax_cents,
      trialDays: plan.trial_days,
      customerType,
      vatNumber,
      countryCode,
    });

    // Ligne "incomplete" créée immédiatement : le webhook (checkout.session.completed)
    // la complètera avec provider_customer_id/provider_subscription_id réels.
    const { error: upsertError } = await serviceClient
      .from("subscriptions")
      .upsert(
        { profile_id: profile.id, provider: "stripe", plan_id: plan.plan_id, status: "incomplete" },
        { onConflict: "profile_id" }
      );
    if (upsertError) return errors.internal(upsertError.message);

    return success({ url: session.checkoutUrl, sessionId: session.sessionId });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
