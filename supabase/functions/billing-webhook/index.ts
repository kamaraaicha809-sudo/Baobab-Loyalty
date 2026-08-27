/**
 * billing-webhook
 * Handles Moneroo webhook events
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();
  if (req.method !== "POST") return errors.badRequest("Method not allowed");

  const webhookSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET");
  if (!webhookSecret) return errors.internal("Server configuration error");

  const body = await req.text();
  const signature = req.headers.get("x-moneroo-signature");

  if (!signature) return errors.badRequest("Missing x-moneroo-signature header");

  const isValid = await verifySignature(body, signature, webhookSecret);
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

        // FNE : best-effort, ne doit jamais faire echouer l'accuse de reception
        // du webhook Moneroo (l'acces hotelier ci-dessus doit toujours passer).
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
