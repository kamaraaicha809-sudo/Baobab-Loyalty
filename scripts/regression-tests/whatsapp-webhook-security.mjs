// Suite de regression securite du webhook WhatsApp (Meta / 360dialog).
//
// Verifie en conditions reelles (vraie Edge Function deployee) qu'aucune
// requete non authentifiee ne peut declencher de traitement metier :
//   1. requete sans en-tete de signature -> non traitee
//   2. signature incorrecte (mauvais hash) -> non traitee
//   3. signature "falsifiee" (calculee avec un secret invente) -> non traitee
//   4. payload modifie apres signature -> non traitee (mismatch signature/corps)
//   5. signature valide -> traitee
//   6. rejeu (message avec horodatage trop ancien, signature valide) -> non traitee
//
// Les tests 4/5/6 necessitent META_APP_SECRET en local (copie du secret Vault
// dans .env.local, uniquement pour signer des payloads de test) : ils sont
// annonces "SKIPPED" si absent, jamais fabriques ni simules.
//
// A relancer avant toute modification de whatsapp-webhook ou avant la
// connexion du premier hotel reel.
//
// Usage : node scripts/regression-tests/whatsapp-webhook-security.mjs

import { svc, adminCreateUser, adminDeleteUser, makeReporter, hmacHex, envVarOptional, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();
const META_APP_SECRET = envVarOptional("META_APP_SECRET");

const stamp = Date.now();
const email = `regression-wa-sec-${stamp}@baobabloyalty.com`;
const password = `RegSec1!WA#${stamp}`;
const phoneNumberId = `SECTEST_PHONE_${stamp}`;

let hotelId;
const clientIds = {};

function payloadFor(phoneNumberIdValue, fromNumber, text, timestampSeconds) {
  return JSON.stringify({
    entry: [{
      changes: [{
        value: {
          metadata: { phone_number_id: phoneNumberIdValue },
          messages: [{
            from: fromNumber,
            type: "text",
            text: { body: text },
            ...(timestampSeconds ? { timestamp: String(timestampSeconds) } : {}),
          }],
        },
      }],
    }],
  });
}

async function postWebhook(rawBody, headers = {}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json", ...headers },
    body: rawBody,
  });
  return res.status;
}

async function isOptedOut(clientId) {
  const check = await svc(`clients?id=eq.${clientId}&select=marketing_consent,opted_out_at`);
  return check.body?.[0]?.marketing_consent === false && !!check.body?.[0]?.opted_out_at;
}

try {
  hotelId = await adminCreateUser(email, password);
  await new Promise((r) => setTimeout(r, 500));
  await svc(`profiles?id=eq.${hotelId}`, { method: "PATCH", body: JSON.stringify({ whatsapp_phone_number_id: phoneNumberId }) });

  const today = new Date().toISOString().split("T")[0];
  async function makeClient(tag, number) {
    const r = await svc("clients", {
      method: "POST",
      body: JSON.stringify({ profile_id: hotelId, nom: tag, whatsapp: number, derniere_visite: today, marketing_consent: true }),
    });
    return r.body?.[0]?.id;
  }

  // --- Test 1 : aucune signature ---
  {
    const num = "+225070020001";
    clientIds.noSig = await makeClient("SEC1_NO_SIG", num);
    const body = payloadFor(phoneNumberId, num.replace("+", ""), "STOP");
    const status = await postWebhook(body); // aucun en-tete de signature
    await new Promise((r) => setTimeout(r, 400));
    const optedOut = await isOptedOut(clientIds.noSig);
    log("Test 1 : requete sans signature -> non traitee (client reste consentant)", status === 200 && !optedOut, `httpStatus=${status} optedOut=${optedOut}`);
  }

  // --- Test 2 : signature incorrecte (hash bidon) ---
  {
    const num = "+225070020002";
    clientIds.wrongSig = await makeClient("SEC2_WRONG_SIG", num);
    const body = payloadFor(phoneNumberId, num.replace("+", ""), "STOP");
    const status = await postWebhook(body, { "x-hub-signature-256": "sha256=deadbeef00112233" });
    await new Promise((r) => setTimeout(r, 400));
    const optedOut = await isOptedOut(clientIds.wrongSig);
    log("Test 2 : signature incorrecte (hash invalide) -> non traitee", status === 200 && !optedOut, `httpStatus=${status} optedOut=${optedOut}`);
  }

  // --- Test 3 : signature "falsifiee" (calculee avec un secret invente par un attaquant) ---
  {
    const num = "+225070020003";
    clientIds.forgedSig = await makeClient("SEC3_FORGED_SIG", num);
    const body = payloadFor(phoneNumberId, num.replace("+", ""), "STOP");
    const forgedSig = await hmacHex("secret-invente-par-un-attaquant", body);
    const status = await postWebhook(body, { "x-hub-signature-256": `sha256=${forgedSig}` });
    await new Promise((r) => setTimeout(r, 400));
    const optedOut = await isOptedOut(clientIds.forgedSig);
    log("Test 3 : signature falsifiee (secret invente) -> non traitee", status === 200 && !optedOut, `httpStatus=${status} optedOut=${optedOut}`);
  }

  if (!META_APP_SECRET) {
    log("Test 4 : signature valide -> traitee", null, "SKIPPED - META_APP_SECRET absent de .env.local, impossible de signer un payload valide localement");
    log("Test 5 : payload modifie apres signature -> non traitee", null, "SKIPPED - meme raison");
    log("Test 6 : rejeu (message trop ancien, signature valide) -> non traitee", null, "SKIPPED - meme raison");
  } else {
    // --- Test 4 : signature valide ---
    {
      const num = "+225070020004";
      clientIds.validSig = await makeClient("SEC4_VALID_SIG", num);
      const body = payloadFor(phoneNumberId, num.replace("+", ""), "STOP");
      const sig = await hmacHex(META_APP_SECRET, body);
      const status = await postWebhook(body, { "x-hub-signature-256": `sha256=${sig}` });
      await new Promise((r) => setTimeout(r, 400));
      const optedOut = await isOptedOut(clientIds.validSig);
      log("Test 4 : signature valide -> traitee (client desinscrit)", status === 200 && optedOut, `httpStatus=${status} optedOut=${optedOut}`);
    }

    // --- Test 5 : payload modifie apres signature (signature calculee sur un autre corps) ---
    {
      const num = "+225070020005";
      clientIds.tamperedSig = await makeClient("SEC5_TAMPERED", num);
      const signedBody = payloadFor(phoneNumberId, "225070099999", "STOP"); // corps signe = un AUTRE numero
      const sig = await hmacHex(META_APP_SECRET, signedBody);
      const actuallySentBody = payloadFor(phoneNumberId, num.replace("+", ""), "STOP"); // corps reellement envoye = notre client cible
      const status = await postWebhook(actuallySentBody, { "x-hub-signature-256": `sha256=${sig}` });
      await new Promise((r) => setTimeout(r, 400));
      const optedOut = await isOptedOut(clientIds.tamperedSig);
      log("Test 5 : payload modifie apres signature -> non traitee (mismatch signature/corps)", status === 200 && !optedOut, `httpStatus=${status} optedOut=${optedOut}`);
    }

    // --- Test 6 : rejeu (signature valide, mais message horodate il y a plus de 10 min) ---
    {
      const num = "+225070020006";
      clientIds.replay = await makeClient("SEC6_REPLAY", num);
      const oldTimestamp = Math.floor(Date.now() / 1000) - 11 * 60; // 11 minutes dans le passe
      const body = payloadFor(phoneNumberId, num.replace("+", ""), "STOP", oldTimestamp);
      const sig = await hmacHex(META_APP_SECRET, body);
      const status = await postWebhook(body, { "x-hub-signature-256": `sha256=${sig}` });
      await new Promise((r) => setTimeout(r, 400));
      const optedOut = await isOptedOut(clientIds.replay);
      log("Test 6 : rejeu (horodatage > 10 min, signature valide) -> non traitee", status === 200 && !optedOut, `httpStatus=${status} optedOut=${optedOut}`);
    }
  }
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  for (const id of Object.values(clientIds)) {
    try { if (id) await svc(`clients?id=eq.${id}`, { method: "DELETE" }); } catch {}
  }
  try { if (hotelId) await adminDeleteUser(hotelId); } catch {}
}

printAndExit();
