// Suite de regression : acceptation des CGU/CGV/DPA (migration 059) et preuve
// de l'accord WhatsApp (migration 058), projet Afrique uniquement.
//
// Verifie en conditions reelles (vrai projet Supabase, vrais JWT, RLS active) :
//   - accept_legal_terms : refuse sans connexion et sur version invalide,
//     enregistre la version + une trace horodatee dans legal_acceptances
//   - legal_acceptances : chaque hotel ne voit que ses propres traces et ne
//     peut pas en ecrire directement
//   - clients : sans case cochee, aucun accord ; un accord est toujours date et
//     source par le serveur ; la desinscription puis un nouvel accord sont traces
//
// A relancer avant toute release qui touche : TermsGate, accept_legal_terms,
// le trigger stamp_marketing_consent ou la logique d'accord de src/sdk/clients.ts.
//
// Usage : node scripts/regression-tests/legal-terms-and-consent-proof.mjs

import { svc, restAs, adminCreateUser, adminDeleteUser, signIn, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();

const stamp = Date.now();
const emailA = `regression-legal-a-${stamp}@baobabloyalty.com`;
const emailB = `regression-legal-b-${stamp}@baobabloyalty.com`;
const password = `Reg1!Legal#${stamp}`;
const VERSION = "2026-09-29";

let idA, idB, tokenA, tokenB;
const clientIds = [];

const rpcAs = (token, fn, args) =>
  fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token ?? ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  }).then(async (res) => ({ status: res.status, body: await res.json().catch(() => null) }));

const secondsFromNow = (iso) => Math.abs(Date.now() - new Date(iso).getTime()) / 1000;

try {
  idA = await adminCreateUser(emailA, password);
  idB = await adminCreateUser(emailB, password);
  tokenA = await signIn(emailA, password);
  tokenB = await signIn(emailB, password);
  await new Promise((r) => setTimeout(r, 800));

  // --- CGU / CGV / DPA ---------------------------------------------------
  {
    const r = await restAs(tokenA, `profiles?id=eq.${idA}&select=terms_version,terms_accepted_at`);
    const row = r.body?.[0];
    log("CGU 1 : nouveau compte sans acceptation", r.status === 200 && row?.terms_version === null && row?.terms_accepted_at === null, JSON.stringify(r.body));
  }
  {
    const r = await rpcAs(null, "accept_legal_terms", { p_version: VERSION });
    log("CGU 2 : acceptation refusee sans connexion", r.status >= 400, `status=${r.status} body=${JSON.stringify(r.body)}`);
  }
  {
    const r = await rpcAs(tokenA, "accept_legal_terms", { p_version: "v1" });
    log("CGU 3 : version invalide refusee", r.status >= 400, `status=${r.status} body=${JSON.stringify(r.body)}`);
  }
  {
    const r = await rpcAs(tokenA, "accept_legal_terms", { p_version: VERSION });
    const p = await restAs(tokenA, `profiles?id=eq.${idA}&select=terms_version,terms_accepted_at`);
    const row = p.body?.[0];
    log(
      "CGU 4 : acceptation enregistree avec date serveur",
      r.status === 200 && row?.terms_version === VERSION && !!row?.terms_accepted_at && secondsFromNow(row.terms_accepted_at) < 120,
      `rpc=${r.status} profil=${JSON.stringify(p.body)}`
    );
  }
  {
    const r = await restAs(tokenA, `legal_acceptances?select=user_id,terms_version,documents,accepted_at`);
    const rows = r.body ?? [];
    const ok = rows.length === 1 && rows[0].user_id === idA && rows[0].terms_version === VERSION
      && ["cgu", "cgv", "dpa"].every((d) => rows[0].documents?.includes(d));
    log("CGU 5 : trace horodatee visible par l'hotel", r.status === 200 && ok, JSON.stringify(rows));
  }
  {
    const r = await restAs(tokenB, `legal_acceptances?user_id=eq.${idA}&select=id`);
    log("CGU 6 : un autre hotel ne voit pas cette trace", r.status === 200 && (r.body ?? []).length === 0, `status=${r.status} lignes=${(r.body ?? []).length}`);
  }
  {
    const r = await restAs(tokenB, "legal_acceptances", {
      method: "POST",
      body: JSON.stringify({ user_id: idB, terms_version: VERSION }),
    });
    const check = await svc(`legal_acceptances?user_id=eq.${idB}&select=id`);
    log("CGU 7 : ecriture directe d'une trace refusee", r.status >= 400 && (check.body ?? []).length === 0, `status=${r.status}`);
  }
  {
    const r = await restAs(tokenB, `profiles?id=eq.${idB}`, {
      method: "PATCH",
      body: JSON.stringify({ terms_version: VERSION, terms_accepted_at: "2020-01-01T00:00:00Z" }),
    });
    const check = await svc(`profiles?id=eq.${idB}&select=terms_version,terms_accepted_at`);
    const untouched = check.body?.[0]?.terms_version === null && check.body?.[0]?.terms_accepted_at === null;
    log("CGU 8 : acceptation impossible a falsifier en modifiant le profil", untouched, `status=${r.status} profil=${JSON.stringify(check.body)}`);
  }

  // --- Accord WhatsApp -----------------------------------------------------
  const today = new Date().toISOString().split("T")[0];
  const phone = () => `+2250700${String(Math.floor(Math.random() * 900000) + 100000)}`;
  const insertAs = async (fields) => {
    const r = await restAs(tokenA, "clients", {
      method: "POST",
      body: JSON.stringify({ profile_id: idA, nom: "REGRESSION_LEGAL", derniere_visite: today, whatsapp: phone(), ...fields }),
    });
    // Corps = tableau si l'insertion passe, objet d'erreur sinon.
    for (const c of Array.isArray(r.body) ? r.body : []) if (c?.id) clientIds.push(c.id);
    return r;
  };
  const read = (id) =>
    restAs(tokenA, `clients?id=eq.${id}&select=marketing_consent,marketing_consent_at,marketing_consent_source,opted_out_at`).then((r) => r.body?.[0]);

  let noConsentId;
  {
    const r = await insertAs({});
    noConsentId = r.body?.[0]?.id;
    const c = await read(noConsentId);
    log("WA 1 : case non cochee = aucun accord", r.status === 201 && c?.marketing_consent === false && c?.marketing_consent_at === null && c?.marketing_consent_source === null, JSON.stringify(c));
  }
  {
    const r = await insertAs({ marketing_consent: true, marketing_consent_source: "registre" });
    const c = await read(r.body?.[0]?.id);
    log("WA 2 : accord au registre date par le serveur", c?.marketing_consent === true && c?.marketing_consent_source === "registre" && secondsFromNow(c.marketing_consent_at) < 120, JSON.stringify(c));
  }
  {
    const r = await insertAs({ marketing_consent: true });
    const c = await read(r.body?.[0]?.id);
    log("WA 3 : accord sans origine marque 'non_precise'", c?.marketing_consent_source === "non_precise" && !!c?.marketing_consent_at, JSON.stringify(c));
  }
  {
    const r = await insertAs({ marketing_consent: true, marketing_consent_source: "import_fichier", marketing_consent_at: "2025-01-15" });
    const c = await read(r.body?.[0]?.id);
    log("WA 4 : date d'accord du fichier conservee", c?.marketing_consent_at?.startsWith("2025-01-15") && c?.marketing_consent_source === "import_fichier", JSON.stringify(c));
  }
  {
    // Meme forme que le lot d'import du SDK : colonnes identiques sur chaque ligne.
    const r = await restAs(tokenA, "clients", {
      method: "POST",
      body: JSON.stringify([
        { profile_id: idA, nom: "REGRESSION_LOT_1", derniere_visite: today, whatsapp: phone(), marketing_consent: true, marketing_consent_source: "import_attestation", marketing_consent_at: null },
        { profile_id: idA, nom: "REGRESSION_LOT_2", derniere_visite: today, whatsapp: phone(), marketing_consent: false, marketing_consent_source: null, marketing_consent_at: null },
      ]),
    });
    const rows = Array.isArray(r.body) ? r.body : [];
    for (const c of rows) if (c?.id) clientIds.push(c.id);
    const [c1, c2] = rows;
    const ok = r.status === 201 && c1?.marketing_consent === true && !!c1?.marketing_consent_at && c1?.marketing_consent_source === "import_attestation"
      && c2?.marketing_consent === false && c2?.marketing_consent_at === null;
    log("WA 5 : import par lot (attestation + sans accord)", ok, `status=${r.status}`);
  }
  let firstAt;
  {
    await restAs(tokenA, `clients?id=eq.${noConsentId}`, {
      method: "PATCH",
      body: JSON.stringify({ marketing_consent: true, opted_out_at: null, marketing_consent_source: "manuel" }),
    });
    const c = await read(noConsentId);
    firstAt = c?.marketing_consent_at;
    log("WA 6 : accord enregistre depuis la liste des clients", c?.marketing_consent === true && c?.marketing_consent_source === "manuel" && !!firstAt, JSON.stringify(c));
  }
  {
    await restAs(tokenA, `clients?id=eq.${noConsentId}`, { method: "PATCH", body: JSON.stringify({ nom: "REGRESSION_RENOMME" }) });
    const c = await read(noConsentId);
    log("WA 7 : modifier le nom ne change pas la date d'accord", c?.marketing_consent_at === firstAt, JSON.stringify(c));
  }
  {
    await restAs(tokenA, `clients?id=eq.${noConsentId}`, {
      method: "PATCH",
      body: JSON.stringify({ marketing_consent: false, opted_out_at: new Date().toISOString() }),
    });
    const c = await read(noConsentId);
    log("WA 8 : retrait de l'accord enregistre", c?.marketing_consent === false && !!c?.opted_out_at, JSON.stringify(c));
  }
  {
    await new Promise((r) => setTimeout(r, 1100));
    await restAs(tokenA, `clients?id=eq.${noConsentId}`, {
      method: "PATCH",
      body: JSON.stringify({ marketing_consent: true, opted_out_at: null, marketing_consent_source: "manuel" }),
    });
    const c = await read(noConsentId);
    const redated = !!c?.marketing_consent_at && new Date(c.marketing_consent_at) > new Date(firstAt);
    log("WA 9 : nouvel accord apres retrait = nouvelle date", c?.marketing_consent === true && c?.opted_out_at === null && redated, JSON.stringify(c));
  }
  {
    const r = await insertAs({ marketing_consent: true, marketing_consent_source: "x".repeat(101) });
    log("WA 10 : origine de plus de 100 caracteres refusee", r.status >= 400, `status=${r.status}`);
  }
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  for (const id of clientIds) {
    try { await svc(`clients?id=eq.${id}`, { method: "DELETE" }); } catch {}
  }
  try { if (idA) await adminDeleteUser(idA); } catch {}
  try { if (idB) await adminDeleteUser(idB); } catch {}
}

printAndExit();
