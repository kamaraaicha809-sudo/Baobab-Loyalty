// Suite de regression Europe (Loyavia) : reponse "STOP" sur WhatsApp.
//
// Verifie en conditions reelles (projet Supabase Europe, webhook deploye) que
// le STOP d'un client, envoye par Meta avec une signature valide :
//   - retire l'accord WhatsApp du client dans communication_preferences
//     (seule source lue a l'envoi en mode channel_rgpd) ;
//   - laisse une preuve dans consent_records (origine "whatsapp_stop") ;
//   - ne touche que le client concerne, et jamais les autres canaux ;
// et qu'un message non signe, ou signe avec un faux secret, n'a aucun effet.
//
// PREREQUIS (bloquant a ce jour) : application Meta Europe creee, puis le
// meme META_APP_SECRET renseigne (1) dans le Vault du projet Supabase Europe
// et (2) dans .env.europe.local (ligne META_APP_SECRET=...). Sans ce secret
// en local, les tests signes sont SAUTES (pass = null), pas echoues.
//
// Usage : node scripts/regression-tests/europe-whatsapp-stop.mjs

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svc, adminCreateUser, adminDeleteUser, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared_europe.mjs";

const { log, printAndExit } = makeReporter();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function europeSecretOptional(name) {
  try {
    const text = readFileSync(path.resolve(__dirname, "../../.env.europe.local"), "utf8");
    const m = text.match(new RegExp(`^${name}=(.+)$`, "m"));
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

async function hmacHex(secret, body) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const META_APP_SECRET = europeSecretOptional("META_APP_SECRET");
const stamp = Date.now();
const phoneNumberId = `EU_STOPTEST_${stamp}`;
const email = `regression-eu-stop-${stamp}@loyavia.com`;
const password = `RegEu1!Stop#${stamp}`;
const today = new Date().toISOString().split("T")[0];
let hotelId;

const payload = (from, text) =>
  JSON.stringify({
    entry: [{ changes: [{ value: {
      metadata: { phone_number_id: phoneNumberId },
      messages: [{ from, type: "text", text: { body: text }, timestamp: String(Math.floor(Date.now() / 1000)) }],
    } }] }],
  });

const post = (body, headers = {}) =>
  fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json", ...headers },
    body,
  }).then((r) => r.status);

const pref = (clientId, channel) =>
  svc(`communication_preferences?client_id=eq.${clientId}&channel=eq.${channel}&select=opted_in`).then((r) => r.body?.[0]?.opted_in);

async function makeConsentedClient(tag, digits) {
  const r = await svc("clients", { method: "POST", body: JSON.stringify({ profile_id: hotelId, nom: tag, whatsapp: `+${digits}`, derniere_visite: today }) });
  const id = r.body?.[0]?.id;
  for (const channel of ["whatsapp", "email"]) {
    await svc("rpc/set_communication_preference", {
      method: "POST",
      body: JSON.stringify({ p_profile_id: hotelId, p_client_id: id, p_channel: channel, p_opted_in: true, p_method: "registre", p_policy_version: null, p_ip: null, p_user_agent: null }),
    });
  }
  return id;
}

try {
  hotelId = await adminCreateUser(email, password);
  await new Promise((r) => setTimeout(r, 800));
  await svc(`profiles?id=eq.${hotelId}`, { method: "PATCH", body: JSON.stringify({ whatsapp_phone_number_id: phoneNumberId }) });

  const digitsA = `3361${String(stamp).slice(-7)}`;
  const digitsB = `3362${String(stamp).slice(-7)}`;
  const clientA = await makeConsentedClient("REG_EU_STOP_A", digitsA);
  const clientB = await makeConsentedClient("REG_EU_STOP_B", digitsB);
  log("Prealable : deux clients avec accord WhatsApp et e-mail", (await pref(clientA, "whatsapp")) === true && (await pref(clientB, "whatsapp")) === true, "");

  {
    const status = await post(payload(digitsA, "STOP"));
    log("STOP 1 : message non signe sans effet", status === 200 && (await pref(clientA, "whatsapp")) === true, `status=${status}`);
  }
  {
    const body = payload(digitsA, "STOP");
    const status = await post(body, { "x-hub-signature-256": `sha256=${await hmacHex("faux-secret", body)}` });
    log("STOP 2 : signature avec un faux secret sans effet", status === 200 && (await pref(clientA, "whatsapp")) === true, `status=${status}`);
  }

  if (!META_APP_SECRET) {
    log("STOP 3 : STOP signe retire l'accord WhatsApp (preuve whatsapp_stop)", null, "SAUTE : META_APP_SECRET absent de .env.europe.local (application Meta Europe non creee)");
    log("STOP 4 : seul le client concerne, seul le canal WhatsApp", null, "SAUTE : meme raison");
  } else {
    const body = payload(digitsA, "Stop");
    const status = await post(body, { "x-hub-signature-256": `sha256=${await hmacHex(META_APP_SECRET, body)}` });
    await new Promise((r) => setTimeout(r, 1500));
    const rec = await svc(`consent_records?client_id=eq.${clientA}&channel=eq.whatsapp&action=eq.opt_out&select=method,created_at`);
    log("STOP 3 : STOP signe retire l'accord WhatsApp (preuve whatsapp_stop)",
      status === 200 && (await pref(clientA, "whatsapp")) === false && rec.body?.[0]?.method === "whatsapp_stop", `status=${status} preuve=${JSON.stringify(rec.body)}`);
    log("STOP 4 : seul le client concerne, seul le canal WhatsApp",
      (await pref(clientB, "whatsapp")) === true && (await pref(clientA, "email")) === true, "");
  }
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try { if (hotelId) await svc(`clients?profile_id=eq.${hotelId}`, { method: "DELETE" }); } catch {}
  try { if (hotelId) await adminDeleteUser(hotelId); } catch {}
}

printAndExit();
