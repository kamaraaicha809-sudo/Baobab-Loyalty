/**
 * billing-webhook
 * Handles Moneroo webhook events
 *
 * Recoit indifferemment les evenements Sandbox (tests) et Live (vrais
 * paiements) sur la meme URL : MONEROO_WEBHOOK_SECRET_LIVE et
 * MONEROO_WEBHOOK_SECRET_SANDBOX coexistent en permanence dans le Vault,
 * jamais l'un a la place de l'autre. Le secret qui valide la signature
 * determine le mode (voir verifyMonerooSignature) ; un paiement Sandbox ne
 * declenche jamais de facture FNE reelle.
 *
 * Auth: Moneroo HMAC-SHA256 signature (no JWT)
 * Method: POST
 */

import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { getServiceClient } from "../_shared/auth.ts";
import { enqueueFneInvoice } from "../_shared/fne/enqueue.ts";
import { PLAN_PRICES_XOF } from "../_shared/plan.ts";

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex === signature;
  } catch {
    return false;
  }
}

type MonerooMode = "live" | "sandbox";

// Sandbox et Live partagent la meme URL de webhook (les deux secrets sont
// configures en permanence, jamais l'un a la place de l'autre) : on
// determine l'origine d'un evenement par le secret qui valide sa signature,
// jamais par une donnee du payload (falsifiable). Un paiement Sandbox reste
// ainsi cryptographiquement impossible a faire passer pour un paiement Live,
// et inversement.
async function verifyMonerooSignature(
  body: string,
  signature: string
): Promise<{ valid: boolean; mode: MonerooMode | null }> {
  const liveSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET_LIVE");
  if (liveSecret && (await verifySignature(body, signature, liveSecret))) {
    return { valid: true, mode: "live" };
  }
  const sandboxSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET_SANDBOX");
  if (sandboxSecret && (await verifySignature(body, signature, sandboxSecret))) {
    return { valid: true, mode: "sandbox" };
  }
  return { valid: false, mode: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();
  if (req.method !== "POST") return errors.badRequest("Method not allowed");

  const liveSecretConfigured = !!Deno.env.get("MONEROO_WEBHOOK_SECRET_LIVE");
  const sandboxSecretConfigured = !!Deno.env.get("MONEROO_WEBHOOK_SECRET_SANDBOX");
  if (!liveSecretConfigured && !sandboxSecretConfigured) {
    return errors.internal("Server configuration error");
  }

  const body = await req.text();
  const signature = req.headers.get("x-moneroo-signature");

  if (!signature) return errors.badRequest("Missing x-moneroo-signature header");

  const { valid: isValid, mode: paymentMode } = await verifyMonerooSignature(body, signature);
  if (!isValid) {
    return errors.badRequest("Invalid signature");
  }

  let event: { event: string; data: Record<string, unknown>; created_at?: string };
  try {
    event = JSON.parse(body);
  } catch {
    return errors.badRequest("Invalid JSON body");
  }

  if (!event?.event || !event?.data || typeof event.event !== "string") {
    return errors.badRequest("Invalid webhook payload structure");
  }

  // Replay attack protection: reject events older than 5 minutes
  if (event.created_at) {
    const eventTime = new Date(event.created_at).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (isNaN(eventTime) || now - eventTime > fiveMinutes) {
      return errors.badRequest("Event timestamp expired");
    }
  }

  const supabase = getServiceClient();
  console.log(`[billing-webhook] Evenement "${event.event}" verifie via secret ${paymentMode}.`);

  try {
    switch (event.event) {
      case "payment.success": {
        const metadata = event.data.metadata as Record<string, string> | undefined;
        const userId = metadata?.user_id;
        const plan = metadata?.plan;

        if (!userId) {
          break;
        }

        // Le serveur est la seule source de verite sur le prix : on ne
        // credite jamais un plan simplement parce que Moneroo dit "success".
        // Le montant et la devise reellement payes doivent correspondre au
        // prix connu du plan demande, sinon on rejette et on journalise
        // plutot que d'accorder un acces potentiellement obtenu pour moins
        // cher que son prix reel (metadata falsifiee, plan inconnu, etc).
        const expectedAmount = plan ? PLAN_PRICES_XOF[plan.toLowerCase()] : undefined;
        const paidAmount = typeof event.data.amount === "number" ? event.data.amount : Number(event.data.amount);
        const paidCurrency = typeof event.data.currency === "string" ? event.data.currency : undefined;

        if (!expectedAmount || paidCurrency !== "XOF" || paidAmount !== expectedAmount) {
          console.error(
            "[billing-webhook] Montant/devise payes incoherents avec le plan demande — acces NON accorde:",
            JSON.stringify({ userId, plan, expectedAmount, paidAmount, paidCurrency })
          );
          break;
        }

        // Chaque paiement couvre 1 mois : l'acces expire de lui-meme sans
        // nouveau paiement (pas d'acces "a vie" apres un seul paiement).
        const accessUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
          .from("profiles")
          .update({ has_access: true, price_id: plan || null, access_until: accessUntil })
          .eq("id", userId);

        if (error) throw error;

        // FNE : jamais pour un paiement Sandbox — aucune facture fiscale
        // reelle ne doit etre emise pour un paiement de test. Pour un
        // paiement Live, best-effort : ne doit jamais faire echouer l'accuse
        // de reception du webhook Moneroo (l'acces hotelier ci-dessus doit
        // toujours passer).
        if (paymentMode === "sandbox") {
          console.log(
            "[billing-webhook] Paiement Sandbox : acces de TEST accorde, aucune facture FNE emise.",
            JSON.stringify({ userId, plan })
          );
        } else {
          try {
            const monerooData = event.data as Record<string, unknown>;
            await enqueueFneInvoice(supabase, {
              userId,
              planSlug: plan,
              monerooPaymentId: typeof monerooData.id === "string" ? monerooData.id : null,
              monerooMethod: typeof monerooData.method === "string" ? monerooData.method : undefined,
            });
          } catch (fneErr) {
            console.error("[billing-webhook] Mise en file FNE echouee (non bloquant):", fneErr);
          }
        }
        break;
      }

      case "payment.failed": {
        break;
      }

      default:
        break;
    }

    return success({ received: true });
  } catch (err) {
    return errors.internal("Webhook processing failed");
  }
});
