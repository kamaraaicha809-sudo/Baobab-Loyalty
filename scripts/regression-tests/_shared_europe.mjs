// Variante Europe de _shared.mjs : mêmes utilitaires, mais lit les
// identifiants dans .env.europe.local (projet Supabase "Loyavia Europe",
// hqtqxjxorvhkdhgozdai) au lieu de .env.local (Afrique). Fichier séparé
// pour ne prendre aucun risque de régression sur les scripts Afrique déjà
// en production, et parce que .env.europe.local reste strictement local
// (jamais commit — voir .gitignore).
//
// A exécuter uniquement en local, jamais dans un contexte dont la sortie
// pourrait finir affichée ailleurs : ce fichier ne journalise jamais les
// valeurs des clés, seulement leur présence/longueur si besoin.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env.europe.local");

function envVar(name) {
  const envText = readFileSync(envPath, "utf8");
  const m = envText.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!m || !m[1].trim()) {
    throw new Error(
      `Variable manquante ou vide dans .env.europe.local : ${name}. ` +
        `Copie les valeurs depuis le dashboard Supabase du projet "Loyavia Europe" ` +
        `(Project Settings -> API) : Project URL, anon public, service_role.`
    );
  }
  return m[1].trim();
}

export const SUPABASE_URL = envVar("NEXT_PUBLIC_SUPABASE_URL");
export const ANON_KEY = envVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SERVICE_KEY = envVar("SUPABASE_SERVICE_ROLE_KEY");

export function makeReporter() {
  const results = [];
  return {
    log(name, pass, detail) {
      results.push({ name, pass, detail });
    },
    results,
    printAndExit() {
      console.log(JSON.stringify(results, null, 2));
      const skipped = results.filter((r) => r.pass === null);
      const failed = results.filter((r) => r.pass === false);
      const ran = results.length - skipped.length;
      if (skipped.length > 0) {
        console.log(`${skipped.length}/${results.length} test(s) SAUTE(S).`);
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
  try {
    body = await res.json();
  } catch {
    /* corps vide */
  }
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
  try {
    body = await res.json();
  } catch {
    /* corps vide */
  }
  return { status: res.status, body };
}

export async function fn(name, token, body, method = "POST") {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method,
    headers: {
      apikey: ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    body: method !== "GET" ? JSON.stringify(body ?? {}) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
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

export async function signOut(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return res.status;
}

export async function adminDeleteUser(id) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
}
