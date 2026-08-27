/**
 * whatsapp-webhook
 * Recoit les callbacks Meta Cloud API / 360dialog :
 *  - statuts de message (sent/delivered/read/failed) -> met a jour sent_messages
 *  - messages entrants -> detecte un mot-cle STOP et desinscrit le client
 *
 * Pas d'authentification JWT (endpoint public appele par Meta/360dialog) :
 * la verification GET (hub.verify_token) et la signature POST font office
 * d'authentification. Meta signe avec X-Hub-Signature-256 (secret META_APP_SECRET) ;
 * 360dialog signe AUSSI ses webhooks, avec x-360dialog-signature (secret
 * DIALOG360_WEBHOOK_SECRET, "Platform Secret" recupere depuis leur Partner Hub) —
 * cf. https://docs.360dialog.com/partner/onboarding/webhook-events-and-setup/signature-validation.
 * Toute requete sans l'un de ces deux en-tetes, ou dont la signature ne
 * correspond pas, est rejetee SANS etre traitee (echec ferme, jamais ouvert).
 *
 * Method: GET (verification d'abonnement) / POST (evenements)
 */

import { getServiceClient } from "../_shared/auth.ts";

const STOP_KEYWORDS = ["stop", "arret", "arreter", "desabonner", "desinscrire", "unsubscribe"];

// Un message entrant plus vieux que ce delai est ignore : protection anti-rejeu
// si une requete legitime capturee etait rejouee (impact deja limite par
// l'idempotence des operations ci-dessous, ceci est une couche supplementaire).
const MAX_MESSAGE_AGE_SECONDS = 10 * 60;

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // retire les accents (ex: "arrêt" -> "arret")
    .trim()
    .toLowerCase();
}

function isOptOutMessage(text: string | undefined): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  return STOP_KEYWORDS.some((kw) => normalized === kw || normalized.startsWith(kw + " ") || normalized.startsWith(kw + "!"));
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Comparaison en temps constant pour eviter une attaque par timing.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

type SignatureCheck = { valid: boolean; provider: "meta" | "360dialog" | "none" };

// Verifie la signature du fournisseur presente sur la requete. Si AUCUN des
// deux en-tetes de signature connus n'est present, ou si le secret attendu
// n'est pas configure cote serveur, la requete est refusee : contrairement a
// l'implementation precedente, l'absence de signature n'est plus jamais
// interpretee comme "provient forcement du BSP, donc ok".
async function verifyWebhookSignature(rawBody: string, headers: Headers): Promise<SignatureCheck> {
  const metaSignature = headers.get("x-hub-signature-256");
  if (metaSignature) {
    const appSecret = Deno.env.get("META_APP_SECRET");
    const prefix = "sha256=";
    if (!appSecret || !metaSignature.startsWith(prefix)) return { valid: false, provider: "meta" };
    const expected = await hmacHex(appSecret, rawBody);
    return { valid: timingSafeEqualHex(expected, metaSignature.slice(prefix.length)), provider: "meta" };
  }

  const dialogSignature = headers.get("x-360dialog-signature");
  if (dialogSignature) {
    const platformSecret = Deno.env.get("DIALOG360_WEBHOOK_SECRET");
    if (!platformSecret) return { valid: false, provider: "360dialog" };
    const expected = await hmacHex(platformSecret, rawBody);
    return { valid: timingSafeEqualHex(expected, dialogSignature), provider: "360dialog" };
  }

  return { valid: false, provider: "none" };
}

const STATUS_RANK: Record<string, number> = { sent: 1, delivered: 2, read: 3 };

interface StatusEvent {
  id: string;
  status: string;
  timestamp?: string;
  errors?: Array<{ code?: number | string; title?: string; message?: string }>;
}

async function applyStatusUpdate(db: ReturnType<typeof getServiceClient>, event: StatusEvent) {
  const { data: existing } = await db
    .from("sent_messages")
    .select("id, status")
    .eq("provider_message_id", event.id)
    .maybeSingle();

  if (!existing) return; // message inconnu (jamais envoye par nous, ou webhook mal cible)

  const now = new Date().toISOString();

  if (event.status === "failed") {
    // Un message deja marque "lu"/"delivre" ne redevient jamais "echoue" :
    // on ne degrade pas un statut deja mieux etabli.
    if (existing.status === "read" || existing.status === "delivered") return;
    const firstError = event.errors?.[0];
    await db.from("sent_messages").update({
      status: "failed",
      failed_at: now,
      error_code: firstError?.code !== undefined ? String(firstError.code) : null,
      error_message: firstError?.message || firstError?.title || null,
    }).eq("id", existing.id);
    return;
  }

  const newRank = STATUS_RANK[event.status];
  const currentRank = STATUS_RANK[existing.status] ?? 0;
  if (!newRank || newRank <= currentRank) return; // ignore les statuts hors-ordre ou inconnus

  const patch: Record<string, unknown> = { status: event.status };
  if (event.status === "delivered") patch.delivered_at = now;
  if (event.status === "read") patch.read_at = now;

  await db.from("sent_messages").update(patch).eq("id", existing.id);
}

interface InboundMessage {
  from: string; // digits, sans "+"
  text?: { body?: string };
  type?: string;
  timestamp?: string; // secondes Unix, fourni par Meta/360dialog
}

async function applyInboundOptOut(
  db: ReturnType<typeof getServiceClient>,
  phoneNumberId: string | undefined,
  message: InboundMessage,
) {
  if (!isOptOutMessage(message.text?.body) || !phoneNumberId) return;

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .or(`whatsapp_phone_number_id.eq.${phoneNumberId},bsp_waba_id.eq.${phoneNumberId}`)
    .maybeSingle();

  if (!profile) return;

  const digits = message.from.replace(/\D/g, "");
  const e164 = `+${digits}`;

  await db
    .from("clients")
    .update({ marketing_consent: false, opted_out_at: new Date().toISOString() })
    .eq("profile_id", profile.id)
    .or(`whatsapp.eq.${e164},whatsapp.eq.${digits},telephone.eq.${e164},telephone.eq.${digits}`);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // --- Verification d'abonnement Meta/360dialog (GET) ---
  if (req.method === "GET") {
    // Le gateway Supabase peut normaliser les points en underscores dans la
    // query string avant que la requete n'atteigne cette fonction : on
    // accepte les deux formats pour ne pas dependre de ce comportement.
    const mode = url.searchParams.get("hub.mode") || url.searchParams.get("hub_mode");
    const token = url.searchParams.get("hub.verify_token") || url.searchParams.get("hub_verify_token");
    const challenge = url.searchParams.get("hub.challenge") || url.searchParams.get("hub_challenge");

    // .trim() : le champ "Value" du tableau de bord Supabase peut ajouter un
    // saut de ligne final au secret colle/enregistre, on l'ignore ici plutot
    // que d'exiger une correspondance strictement octet pour octet.
    const expectedToken = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN")?.trim();

    if (mode === "subscribe" && expectedToken && token === expectedToken && challenge) {
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Toujours repondre 200 rapidement, meme en cas d'erreur de traitement :
  // Meta desactive un webhook qui echoue/timeout trop souvent.
  try {
    const rawBody = await req.text();

    // Verification d'authenticite AVANT tout parsing/traitement du payload :
    // une requete sans signature reconnue, ou dont la signature ne correspond
    // pas, ne doit jamais atteindre la logique metier ci-dessous.
    const { valid: signatureValid, provider } = await verifyWebhookSignature(rawBody, req.headers);
    if (!signatureValid) {
      console.error(`whatsapp-webhook: signature manquante ou invalide (provider=${provider})`);
      return new Response("ok", { status: 200 });
    }

    const payload = JSON.parse(rawBody);
    const db = getServiceClient();
    const nowSeconds = Date.now() / 1000;

    const entries = payload?.entry || [];
    for (const entry of entries) {
      for (const change of entry?.changes || []) {
        const value = change?.value;
        if (!value) continue;

        const statuses: StatusEvent[] = value.statuses || [];
        for (const status of statuses) {
          try {
            await applyStatusUpdate(db, status);
          } catch (err) {
            console.error("whatsapp-webhook status update error:", err);
          }
        }

        const messages: InboundMessage[] = value.messages || [];
        for (const message of messages) {
          // Protection anti-rejeu : un message dont l'horodatage fourni par
          // le provider est trop ancien est ignore (requete legitime capturee
          // et rejouee plus tard).
          const messageTimestamp = message.timestamp ? Number(message.timestamp) : undefined;
          if (messageTimestamp && nowSeconds - messageTimestamp > MAX_MESSAGE_AGE_SECONDS) {
            console.error("whatsapp-webhook: message ignore (horodatage trop ancien, rejeu possible)");
            continue;
          }
          try {
            await applyInboundOptOut(db, value.metadata?.phone_number_id, message);
          } catch (err) {
            console.error("whatsapp-webhook inbound opt-out error:", err);
          }
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("whatsapp-webhook error:", err);
    return new Response("ok", { status: 200 });
  }
});
