// Suite de regression Europe (Loyavia) : acceptation des CGU/CGV/DPA
// (migrations-europe/016) et accord marketing par canal (channel_rgpd).
//
// Equivalent Europe de legal-terms-and-consent-proof.mjs (Afrique). Verifie en
// conditions reelles (vrai projet Supabase Europe, vrais JWT, RLS active) :
//   - accept_legal_terms : refuse sans connexion, refuse toute version non
//     publiee (rien n'est active tant qu'aucune version n'est publiee), ne
//     peut etre falsifie ni par le profil ni par une ecriture directe
//   - registre : aucun accord sans case cochee ; accord enregistre canal par
//     canal avec date serveur et origine "registre"
//   - import CSV : un client desinscrit ou ayant refuse un canal n'est jamais
//     reabonne par un import ; un nouvel accord explicite reste possible
//   - isolation entre deux hotels
//
// Le vrai src/sdk/clients.ts est compile a la volee (TypeScript) et execute
// tel quel : ses 3 imports sont redirigees vers des stubs de connexion.
//
// Usage : node scripts/regression-tests/europe-legal-terms-and-consent.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { svc, restAs, fn, adminCreateUser, adminDeleteUser, signIn, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared_europe.mjs";

const { log, printAndExit } = makeReporter();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, ".europe-sdk-build");

async function loadRealClientsSdk() {
  fs.mkdirSync(buildDir, { recursive: true });
  const src = fs.readFileSync(path.resolve(__dirname, "../../src/sdk/clients.ts"), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
    .outputText.replace('from "@/libs/supabase/client"', 'from "./stub-supabase.mjs"')
    .replace('from "@/config"', 'from "./stub-config.mjs"')
    .replace('from "./_core"', 'from "./stub-core.mjs"');
  fs.writeFileSync(path.join(buildDir, "clients.mjs"), js);
  fs.writeFileSync(path.join(buildDir, "stub-config.mjs"), 'export default { region: "europe" };\n');
  fs.writeFileSync(path.join(buildDir, "stub-core.mjs"), 'export async function callEdgeFunction() { throw new Error("hors test"); }\n');
  fs.writeFileSync(
    path.join(buildDir, "stub-supabase.mjs"),
    `import { createClient as create } from "@supabase/supabase-js";
export function createClient() {
  return create(${JSON.stringify(SUPABASE_URL)}, ${JSON.stringify(ANON_KEY)}, {
    global: { headers: { Authorization: "Bearer " + globalThis.__TEST_TOKEN__ } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
`
  );
  // Volontairement PAS de NEXT_PUBLIC_CONSENT_MODEL (absente du projet Vercel
  // Europe) : la region "europe" seule doit activer channel_rgpd.
  delete process.env.NEXT_PUBLIC_CONSENT_MODEL;
  return import(pathToFileURL(path.join(buildDir, "clients.mjs")).href);
}

const stamp = Date.now();
const emailA = `regression-eu-legal-a-${stamp}@loyavia.com`;
const emailB = `regression-eu-legal-b-${stamp}@loyavia.com`;
const password = `Reg1!EuLegal#${stamp}`;
const TEST_VERSION = "2099-01-01";

let idA, idB, tokenA, tokenB, versionInserted = false;

const rpcAs = (token, name, args) =>
  fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token ?? ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  }).then(async (res) => ({ status: res.status, body: await res.json().catch(() => null) }));

const secondsFromNow = (iso) => Math.abs(Date.now() - new Date(iso).getTime()) / 1000;
const phone = () => `+3361${String(Math.floor(Math.random() * 9000000) + 1000000)}`;
const today = new Date().toISOString().split("T")[0];
const prefs = (clientId) => svc(`communication_preferences?client_id=eq.${clientId}&select=channel,opted_in`).then((r) => r.body ?? []);
const pref = async (clientId, channel) => (await prefs(clientId)).find((p) => p.channel === channel)?.opted_in;
const records = (clientId) =>
  svc(`consent_records?client_id=eq.${clientId}&select=channel,action,method,original_consent_date,created_at&order=created_at.asc`).then((r) => r.body ?? []);

async function testTerms() {
  {
    const r = await restAs(tokenA, `profiles?id=eq.${idA}&select=terms_version,terms_accepted_at`);
    const row = r.body?.[0];
    log("CGU 1 : nouveau compte sans acceptation", r.status === 200 && row?.terms_version === null && row?.terms_accepted_at === null, JSON.stringify(r.body));
  }
  {
    const r = await svc("legal_document_versions?is_active=eq.true&select=version");
    log("CGU 2 : aucune version publiee (rien n'est active)", r.status === 200 && (r.body ?? []).length === 0, JSON.stringify(r.body));
  }
  {
    const r = await rpcAs(null, "accept_legal_terms", { p_version: "2026-09-29" });
    log("CGU 3 : acceptation refusee sans connexion", r.status >= 400, `status=${r.status}`);
  }
  {
    const r = await rpcAs(tokenA, "accept_legal_terms", { p_version: "2026-09-29" });
    log("CGU 4 : version non publiee refusee (meme au format valide)", r.status >= 400, `status=${r.status} ${JSON.stringify(r.body)}`);
  }
  {
    const r = await restAs(tokenA, "legal_document_versions", { method: "POST", body: JSON.stringify({ version: "2098-01-01", documents: ["cgu"], is_active: true }) });
    const check = await svc("legal_document_versions?version=eq.2098-01-01&select=version");
    log("CGU 5 : un hotel ne peut pas publier une version", r.status >= 400 && (check.body ?? []).length === 0, `status=${r.status}`);
  }
  {
    const r = await restAs(tokenB, "legal_acceptances", { method: "POST", body: JSON.stringify({ user_id: idB, profile_id: idB, terms_version: "2026-09-29", documents: ["cgu"] }) });
    const check = await svc(`legal_acceptances?user_id=eq.${idB}&select=id`);
    log("CGU 6 : ecriture directe d'une trace refusee", r.status >= 400 && (check.body ?? []).length === 0, `status=${r.status}`);
  }
  {
    const r = await restAs(tokenB, `profiles?id=eq.${idB}`, { method: "PATCH", body: JSON.stringify({ terms_version: "2026-09-29", terms_accepted_at: "2020-01-01T00:00:00Z" }) });
    const check = await svc(`profiles?id=eq.${idB}&select=terms_version,terms_accepted_at`);
    const untouched = check.body?.[0]?.terms_version === null && check.body?.[0]?.terms_accepted_at === null;
    log("CGU 7 : acceptation impossible a falsifier via le profil", untouched, `status=${r.status} profil=${JSON.stringify(check.body)}`);
  }

  // Version de test publiee le temps du test uniquement, puis supprimee.
  const ins = await svc("legal_document_versions", { method: "POST", body: JSON.stringify({ version: TEST_VERSION, documents: ["cgu", "cgv", "dpa"], is_active: true, notes: "regression temporaire" }) });
  versionInserted = ins.status === 201;
  {
    const r = await rpcAs(tokenA, "accept_legal_terms", { p_version: TEST_VERSION });
    const p = await restAs(tokenA, `profiles?id=eq.${idA}&select=terms_version,terms_accepted_at`);
    const row = p.body?.[0];
    log("CGU 8 : version publiee acceptee, date posee par le serveur",
      r.status === 200 && row?.terms_version === TEST_VERSION && secondsFromNow(row.terms_accepted_at) < 120, `rpc=${r.status} profil=${JSON.stringify(p.body)}`);
  }
  {
    const r = await restAs(tokenA, "legal_acceptances?select=user_id,profile_id,terms_version,documents,accepted_at");
    const row = (r.body ?? [])[0];
    const ok = (r.body ?? []).length === 1 && row.user_id === idA && row.profile_id === idA && row.terms_version === TEST_VERSION
      && ["cgu", "cgv", "dpa"].every((d) => row.documents.includes(d));
    log("CGU 9 : trace (compte hotel + utilisateur + documents) visible par l'hotel", r.status === 200 && ok, JSON.stringify(r.body));
  }
  {
    const r = await restAs(tokenB, `legal_acceptances?user_id=eq.${idA}&select=id`);
    log("CGU 10 : un autre hotel ne voit pas cette trace", r.status === 200 && (r.body ?? []).length === 0, `lignes=${(r.body ?? []).length}`);
  }
}

async function testConsent(sdk) {
  globalThis.__TEST_TOKEN__ = tokenA;
  const telNoConsent = phone();
  const noConsent = await sdk.addClient(idA, { nom: "REG_EU_SANS_ACCORD", telephone: telNoConsent, derniere_visite: today });
  log("RGPD 1 : registre sans case cochee = aucun accord", (await prefs(noConsent.id)).length === 0, JSON.stringify(await prefs(noConsent.id)));

  const tel = phone();
  const withConsent = await sdk.addClient(idA, { nom: "REG_EU_ACCORD", telephone: tel, derniere_visite: today, channelConsents: ["whatsapp", "email"] });
  const recs = await records(withConsent.id);
  const okRegistre = (await pref(withConsent.id, "whatsapp")) === true && (await pref(withConsent.id, "email")) === true
    && (await pref(withConsent.id, "sms")) === undefined
    && recs.length === 2 && recs.every((r) => r.method === "registre" && r.action === "opt_in" && secondsFromNow(r.created_at) < 120);
  log("RGPD 2 : accord registre par canal, date serveur + origine", okRegistre, JSON.stringify(recs));

  const read = await sdk.getChannelConsents([withConsent.id]);
  log("RGPD 3 : lecture des accords par l'hotel (SDK)", read[withConsent.id]?.whatsapp?.optedIn === true && !read[withConsent.id]?.sms, JSON.stringify(read));

  {
    const r = await rpcAs(tokenB, "set_communication_preference", { p_profile_id: idA, p_client_id: noConsent.id, p_channel: "whatsapp", p_opted_in: true, p_method: "registre", p_policy_version: null, p_ip: null, p_user_agent: null });
    const leak = await restAs(tokenB, `communication_preferences?client_id=eq.${withConsent.id}&select=channel`);
    log("RGPD 4 : un autre hotel ne peut ni ecrire ni lire ces accords",
      r.status >= 400 && (await prefs(noConsent.id)).length === 0 && (leak.body ?? []).length === 0, `rpc=${r.status} lecture=${JSON.stringify(leak.body)}`);
  }

  const unsub = await fn("clients-unsubscribe", null, { clientId: withConsent.id });
  log("RGPD 5 : desinscription par lien = retrait WhatsApp enregistre", unsub.ok && (await pref(withConsent.id, "whatsapp")) === false, JSON.stringify(unsub.data));

  const res1 = await sdk.importClients(idA, [{ nom: "REG_EU_ACCORD", telephone: tel, derniere_visite: today, whatsappConsent: true, emailConsent: true, consentSource: "import_csv" }]);
  const stillOut = (await pref(withConsent.id, "whatsapp")) === false;
  log("RGPD 6 : import ne reabonne jamais un client desinscrit", stillOut && res1.warnings.some((w) => w.includes("n'ont pas été réabonnés")), JSON.stringify(res1.warnings));

  const telNew = phone();
  await sdk.importClients(idA, [{ nom: "REG_EU_IMPORT", telephone: telNew, derniere_visite: today, whatsappConsent: true, smsConsent: false, consentSource: "formulaire_web", consentDate: "2025-03-10" }]);
  const created = await svc(`clients?profile_id=eq.${idA}&telephone=eq.${encodeURIComponent(telNew)}&select=id`);
  const newId = created.body?.[0]?.id;
  const newRecs = newId ? await records(newId) : [];
  const wa = newRecs.find((r) => r.channel === "whatsapp");
  log("RGPD 7 : nouveau client importe avec preuve (origine + date d'origine)",
    (await pref(newId, "whatsapp")) === true && (await pref(newId, "sms")) === false && wa?.method === "formulaire_web" && wa?.original_consent_date === "2025-03-10", JSON.stringify(newRecs));

  await sdk.importClients(idA, [{ nom: "REG_EU_IMPORT", telephone: telNew, derniere_visite: today, smsConsent: true }]);
  log("RGPD 8 : canal refuse (SMS) jamais reactive par un import", (await pref(newId, "sms")) === false, JSON.stringify(await prefs(newId)));

  await sdk.importClients(idA, [{ nom: "REG_EU_SANS_ACCORD", telephone: telNoConsent, derniere_visite: today }]);
  log("RGPD 9 : import sans colonne d'accord = aucun accord invente", (await prefs(noConsent.id)).length === 0, JSON.stringify(await prefs(noConsent.id)));

  await sdk.setChannelConsent(idA, withConsent.id, "whatsapp", true, "bascule_manuelle");
  const last = (await records(withConsent.id)).at(-1);
  log("RGPD 10 : nouvel accord explicite (hotelier) possible et trace", (await pref(withConsent.id, "whatsapp")) === true && last?.method === "bascule_manuelle" && last?.action === "opt_in", JSON.stringify(last));

  const wh = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entry: [] }) });
  log("RGPD 11 : webhook WhatsApp Europe deploye et repond (message non signe ignore)", wh.status === 200, `status=${wh.status}`);
}

let sdk;
try {
  sdk = await loadRealClientsSdk();
  idA = await adminCreateUser(emailA, password);
  idB = await adminCreateUser(emailB, password);
  tokenA = await signIn(emailA, password);
  tokenB = await signIn(emailB, password);
  await new Promise((r) => setTimeout(r, 800));
  await testTerms();
  await testConsent(sdk);
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try { if (idA) await svc(`clients?profile_id=eq.${idA}`, { method: "DELETE" }); } catch {}
  try { if (idA) await adminDeleteUser(idA); } catch {}
  try { if (idB) await adminDeleteUser(idB); } catch {}
  try { if (versionInserted) await svc(`legal_document_versions?version=eq.${TEST_VERSION}`, { method: "DELETE" }); } catch {}
  const left = await svc("legal_document_versions?select=version").catch(() => ({ body: null }));
  log("NETTOYAGE : aucune version de test restante", Array.isArray(left.body) && left.body.length === 0, JSON.stringify(left.body));
  fs.rmSync(buildDir, { recursive: true, force: true });
}

printAndExit();
