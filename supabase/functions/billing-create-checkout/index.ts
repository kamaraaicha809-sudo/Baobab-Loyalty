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
import { resolveProfile } from "../_shared/team.ts";
import { PLAN_PRICES_XOF, ONBOARDING_FEE_XOF } from "../_shared/plan.ts";
import { v } from "../_shared/deps.ts";

const MONEROO_API_URL = "https://api.moneroo.io/v1";

const CheckoutBodySchema = v.object({
  planSlug: v.string([v.minLength(1), v.maxLength(50)]),
  planName: v.optional(v.string([v.maxLength(100)])),
  // "subscription" (defaut) = un des plans PLAN_PRICES_XOF, credite has_access
  // dans le webhook. "onboarding_fee" = frais d'integration one-time (49 000
  // FCFA), ne touche jamais has_access/price_id — voir billing-webhook.
  // Valide manuellement plus bas (pas de v.picklist : version de valibot incertaine).
  type: v.optional(v.string([v.maxLength(20)])),
  successUrl: v.string([v.minLength(1), v.maxLength(2000)]),
  cancelUrl: v.string([v.minLength(1), v.maxLength(2000)]),
});

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
    if (isDemoMode) return errors.forbidden("Payments are disabled in demo mode");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const rawBody = await req.json();
    const parsed = v.safeParse(CheckoutBodySchema, rawBody);
    if (!parsed.success) {
      return errors.badRequest("Missing or invalid required fields: planSlug, successUrl, cancelUrl");
    }
    const { planSlug, planName, type, successUrl, cancelUrl } = parsed.output;
    if (!isValidHttpUrl(successUrl) || !isValidHttpUrl(cancelUrl)) {
      return errors.badRequest("successUrl et cancelUrl doivent être des URLs http(s) valides");
    }
    const isOnboardingFee = type === "onboarding_fee";

    // Le montant n'est JAMAIS pris depuis le client : on le recalcule ici a
    // partir du plan (ou du frais d'integration, montant fixe). Sinon
    // n'importe quel appelant peut poster son propre prix (ex: 1 XOF pour le
    // plan Premium) et l'obtenir a ce tarif.
    const amount = isOnboardingFee ? ONBOARDING_FEE_XOF : PLAN_PRICES_XOF[String(planSlug).toLowerCase()];
    const currency = "XOF";
    if (!amount) {
      return errors.badRequest(`Plan inconnu : "${planSlug}"`);
    }

    // Seul le propriétaire du compte gère la facturation (pas les membres invités)
    const { profile, teamRole } = await resolveProfile<{ id: string; email: string | null; full_name: string | null }>(
      userClient,
      user.id,
      "id, email, full_name"
    );
    if (teamRole !== "owner") {
      return errors.forbidden("Seul le propriétaire du compte peut gérer la facturation.");
    }

    const email = profile?.email || user.email || "";
    const fullName = (profile?.full_name || email.split("@")[0] || "Client").trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Toujours la cle LIVE : ce parcours est celui utilise par de vrais
    // hoteliers pour de vrais paiements. Aucune variable de mode ici — un
    // hotel reel ne doit jamais pouvoir atterrir sur une page de paiement
    // Sandbox, meme par une erreur de configuration. Les tests Sandbox
    // passent par un script separe qui appelle l'API Moneroo directement
    // avec MONEROO_API_KEY_SANDBOX (voir scripts/regression-tests/).
    const apiKey = Deno.env.get("MONEROO_API_KEY_LIVE");
    if (!apiKey) return errors.internal("Les paiements ne sont pas encore disponibles. Réessayez plus tard.");

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
        description: isOnboardingFee
          ? "Frais d'intégration Baobab Loyalty - Digitalisation base clients (unique)"
          : `Abonnement Baobab Loyalty - Plan ${planName || planSlug}`,
        return_url: successUrl,
        cancel_url: cancelUrl,
        customer: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
        metadata: isOnboardingFee
          ? { user_id: user.id, type: "onboarding_fee" }
          : { user_id: user.id, plan: planSlug },
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
