/**
 * billing-create-portal-eu
 * Crée une session du Portail Client Stripe (changement de plan, résiliation,
 * mise à jour du moyen de paiement, téléchargement de factures).
 * Fonction Europe uniquement — jamais partagée avec le portail Moneroo.
 *
 * Auth: Required (JWT), owner uniquement
 * Method: POST
 * Body: { returnUrl }
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
    const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "";
    if (!returnUrl || !isValidHttpUrl(returnUrl)) return errors.badRequest("returnUrl doit être une URL http(s) valide.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner") return errors.forbidden("Seul le propriétaire du compte peut gérer la facturation.");

    const serviceClient = getServiceClient();
    const { data: subscription, error: subError } = await serviceClient
      .from("subscriptions")
      .select("provider_customer_id")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (subError) return errors.internal(subError.message);
    if (!subscription?.provider_customer_id) return errors.badRequest("Aucun abonnement Stripe actif pour ce compte.");

    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secretKey) return errors.internal("Stripe n'est pas encore configuré pour cet environnement.");

    const adapter = createStripeAdapter(secretKey);
    const url = await adapter.createBillingPortalSession(subscription.provider_customer_id, returnUrl);

    return success({ url });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
