// Utilitaires partages par les suites de regression securite/consentement.
// Ces scripts appellent le VRAI projet Supabase de production (lu depuis
// .env.local) : ils creent des comptes/donnees de test jetables, verifient
// un comportement reel, puis nettoient tout dans un bloc `finally`. Aucun
// paiement reel et aucun envoi WhatsApp reel ne sont jamais declenches
// (cle BSP volontairement invalide dans whatsapp-consent.mjs).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env.local");

function envVar(name) {
  const envText = readFileSync(envPath, "utf8");
  const m = envText.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!m) throw new Error(`Variable manquante dans .env.local : ${name}`);
  return m[1].trim();
}

// Variante non-bloquante : utilisee pour des secrets optionnels (copies locales
// de secrets Vault, fournies uniquement pour signer des payloads de test — voir
// whatsapp-webhook-security.mjs / billing-webhook-security.mjs). Retourne null
// plutot que de lever une exception si absent, pour permettre aux scripts de
// sauter proprement les tests "signature valide" quand le secret n'est pas
// disponible en local.
export function envVarOptional(name) {
  try {
    const envText = readFileSync(envPath, "utf8");
    const m = envText.match(new RegExp(`^${name}=(.+)$`, "m"));
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

export const SUPABASE_URL = envVar("NEXT_PUBLIC_SUPABASE_URL");
export const ANON_KEY = envVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SERVICE_KEY = envVar("SUPABASE_SERVICE_ROLE_KEY");

export async function hmacHex(secret, body) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function makeReporter() {
  const results = [];
  return {
    log(name, pass, detail) {
      results.push({ name, pass, detail });
    },
    results,
    printAndExit() {
      console.log(JSON.stringify(results, null, 2));
      // pass === null : test volontairement saute (secret non disponible en
      // local), distinct d'un echec reel (pass === false).
      const skipped = results.filter((r) => r.pass === null);
      const failed = results.filter((r) => r.pass === false);
      const ran = results.length - skipped.length;
      if (skipped.length > 0) {
        console.log(`${skipped.length}/${results.length} test(s) SAUTE(S) (secret non disponible en local).`);
      }
      if (failed.length > 0) {
        console.error(`\n${failed.length}/${ran} test(s) ECHOUE(S).`);
        process.exitCode = 1;
      } else {
        console.log(`\n${ran}/${ran} tests executes OK.`);
      }
    },
  };
}

export async function svc(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
      ...(opts.headers || {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch { /* corps vide */ }
  return { status: res.status, body };
}

export async function restAs(token, path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
      ...(opts.headers || {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch { /* corps vide */ }
  return { status: res.status, body };
}

export async function adminCreateUser(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`adminCreateUser failed: ${res.status} ${JSON.stringify(body)}`);
  return body.id;
}

export async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`signIn failed: ${res.status} ${JSON.stringify(body)}`);
  return body.access_token;
}

export async function adminDeleteUser(id) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
}
