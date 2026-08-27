/**
 * clients-unsubscribe
 * Desinscription en libre-service d'un client final depuis le lien inclus
 * dans les messages de campagne WhatsApp.
 *
 * Pas d'authentification JWT (endpoint public, appele par le client de
 * l'hotel depuis son telephone) : l'identifiant du client (UUID v4, 122 bits
 * aleatoires) sert de jeton non devinable, comme whatsapp-webhook qui
 * s'appuie sur un mecanisme equivalent pour l'opt-out par mot-cle STOP.
 *
 * Method: POST
 * Body: { clientId: string }
 */

import { getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { logAudit } from "../_shared/audit.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const body = await req.json().catch(() => ({}));
    const clientId = typeof body?.clientId === "string" ? body.clientId : "";

    if (!UUID_RE.test(clientId)) {
      return errors.badRequest("Lien de désinscription invalide.");
    }

    const db = getServiceClient();

    const { data: client, error: fetchError } = await db
      .from("clients")
      .select("id, profile_id, marketing_consent")
      .eq("id", clientId)
      .maybeSingle();

    if (fetchError) return errors.internal(fetchError.message);
    if (!client) return errors.notFound("Ce lien de désinscription n'est plus valide.");

    const { data: profile } = await db
      .from("profiles")
      .select("hotel_name")
      .eq("id", client.profile_id)
      .maybeSingle();
    const hotelName = profile?.hotel_name ?? null;

    if (client.marketing_consent === false) {
      return success({ hotelName, alreadyUnsubscribed: true });
    }

    const { error: updateError } = await db
      .from("clients")
      .update({ marketing_consent: false, opted_out_at: new Date().toISOString() })
      .eq("id", clientId);

    if (updateError) return errors.internal(updateError.message);

    await logAudit(db, {
      profileId: client.profile_id,
      actorUserId: null,
      action: "client_opted_out_link",
      details: { clientId },
    });

    return success({ hotelName, alreadyUnsubscribed: false });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur inconnue");
  }
});
