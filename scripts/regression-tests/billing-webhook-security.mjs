// Suite de regression securite du webhook de paiement Moneroo (billing-webhook).
//
// Verifie en conditions reelles (vraie Edge Function deployee) que :
//   1. requete sans signature -> jamais d'acces accorde
//   2. requete avec signature incorrecte -> jamais d'acces accorde
//   3. signature Sandbox valide + montant correct -> acces de TEST active
//   4. signature valide + montant incorrect (!= prix reel du plan) -> jamais active
//   5. signature valide + devise incorrecte -> jamais active
//   6. payload falsifie apres signature (signature d'un autre corps) -> rejete
//   7. evenement invalide/inconnu (signature valide) -> aucun acces accorde
//   8. paiement Sandbox valide -> aucune facture FNE mise en file (jamais de facture reelle pour un test)
//
// billing-webhook accepte en permanence DEUX secrets independants :
// MONEROO_WEBHOOK_SECRET_LIVE (vrais paiements) et MONEROO_WEBHOOK_SECRET_SANDBOX
// (paiements de test) - jamais l'un a la place de l'autre. Ce script signe
// TOUJOURS avec le secret Sandbox (MONEROO_WEBHOOK_SECRET_SANDBOX dans
// .env.local) : il ne doit jamais avoir besoin du secret Live pour tourner.
//
// Tant qu'AUCUN des deux secrets n'est configure dans le Vault Supabase, la
// fonction repond 500 "Server configuration error" a TOUTE requete : les
// tests 1 et 2 s'adaptent a cet etat (ils verifient "aucun acces jamais
// accorde", peu importe le code HTTP exact renvoye). Les tests 3 a 8
// necessitent en plus une copie locale du secret Sandbox dans .env.local
// (MONEROO_WEBHOOK_SECRET_SANDBOX) pour pouvoir signer un payload de test
// valide : ils sont annonces "SKIPPED" si absent.
//
// Aucun paiement reel n'est jamais declenche : ce script appelle directement
// billing-webhook avec un payload simule, jamais l'API Moneroo.
//
// A relancer avant toute modification de billing-webhook, et systematiquement
// apres configuration des secrets en production.
//
// Usage : node scripts/regression-tests/billing-webhook-security.mjs

import { svc, adminCreateUser, adminDeleteUser, makeReporter, hmacHex, envVarOptional, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();
const MONEROO_WEBHOOK_SECRET = envVarOptional("MONEROO_WEBHOOK_SECRET_SANDBOX");

// Source de verite : supabase/functions/_shared/plan.ts (PLAN_PRICES_XOF).
const STARTER_PRICE_XOF = 39000;

const stamp = Date.now();
const email = `regression-billing-sec-${stamp}@baobabloyalty.com`;
const password = `RegSec1!Bill#${stamp}`;

let hotelId;

function paymentSuccessPayload({ amount, currency, monerooId }) {
  return JSON.stringify({
    event: "payment.success",
    data: {
      id: monerooId,
      amount,
      currency,
      metadata: { user_id: hotelId, plan: "starter" },
    },
    created_at: new Date().toISOString(),
  });
}

async function postWebhook(rawBody, headers = {}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/billing-webhook`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json", ...headers },
    body: rawBody,
  });
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
}

async function hasAccess() {
  const check = await svc(`profiles?id=eq.${hotelId}&select=has_access,access_until`);
  const row = check.body?.[0];
  return row?.has_access === true && row?.access_until && new Date(row.access_until).getTime() > Date.now();
}

async function resetAccess() {
  await svc(`profiles?id=eq.${hotelId}`, { method: "PATCH", body: JSON.stringify({ has_access: false, access_until: null }) });
}

try {
  hotelId = await adminCreateUser(email, password);
  await new Promise((r) => setTimeout(r, 500));
  await resetAccess();

  // --- Test 1 : aucune signature ---
  {
    const body = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "XOF", monerooId: `pay_sectest_${stamp}_1` });
    const { status, body: respBody } = await postWebhook(body); // pas d'en-tete de signature
    await new Promise((r) => setTimeout(r, 400));
    const access = await hasAccess();
    const rejectedProperly = status === 400 || (status === 500 && respBody?.error?.message === "Server configuration error");
    log(
      "Test 1 : requete sans signature -> aucun acces accorde",
      rejectedProperly && !access,
      `httpStatus=${status} body=${JSON.stringify(respBody)} accesAccorde=${access}` +
        (status === 500 ? " [ni MONEROO_WEBHOOK_SECRET_LIVE ni MONEROO_WEBHOOK_SECRET_SANDBOX configures cote serveur - a configurer par l'utilisateur]" : "")
    );
  }

  // --- Test 2 : signature incorrecte ---
  {
    const body = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "XOF", monerooId: `pay_sectest_${stamp}_2` });
    const { status, body: respBody } = await postWebhook(body, { "x-moneroo-signature": "deadbeef00112233" });
    await new Promise((r) => setTimeout(r, 400));
    const access = await hasAccess();
    const rejectedProperly = status === 400 || (status === 500 && respBody?.error?.message === "Server configuration error");
    log(
      "Test 2 : signature incorrecte -> aucun acces accorde",
      rejectedProperly && !access,
      `httpStatus=${status} body=${JSON.stringify(respBody)} accesAccorde=${access}` +
        (status === 500 ? " [ni MONEROO_WEBHOOK_SECRET_LIVE ni MONEROO_WEBHOOK_SECRET_SANDBOX configures cote serveur - a configurer par l'utilisateur]" : "")
    );
  }

  if (!MONEROO_WEBHOOK_SECRET) {
    log("Test 3 : signature Sandbox valide + montant correct -> acces de TEST active", null, "SKIPPED - MONEROO_WEBHOOK_SECRET_SANDBOX absent de .env.local, impossible de signer un payload valide localement");
    log("Test 4 : signature valide + montant incorrect -> jamais active", null, "SKIPPED - meme raison");
    log("Test 5 : signature valide + devise incorrecte -> jamais active", null, "SKIPPED - meme raison");
    log("Test 6 : payload falsifie apres signature -> rejete", null, "SKIPPED - meme raison");
    log("Test 7 : evenement invalide/inconnu -> aucun acces accorde", null, "SKIPPED - meme raison");
    log("Test 8 : paiement Sandbox valide -> aucune facture FNE mise en file", null, "SKIPPED - meme raison");
  } else {
    // --- Test 3 : signature Sandbox valide + montant correct ---
    {
      await resetAccess();
      const body = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "XOF", monerooId: `pay_sectest_${stamp}_3` });
      const sig = await hmacHex(MONEROO_WEBHOOK_SECRET, body);
      const { status, body: respBody } = await postWebhook(body, { "x-moneroo-signature": sig });
      await new Promise((r) => setTimeout(r, 400));
      const access = await hasAccess();
      log("Test 3 : signature Sandbox valide + montant correct -> acces de TEST active", status === 200 && access, `httpStatus=${status} body=${JSON.stringify(respBody)} accesAccorde=${access}`);
    }

    // --- Test 4 : signature valide + montant incorrect (paye 1 XOF au lieu de 39000) ---
    {
      await resetAccess();
      const body = paymentSuccessPayload({ amount: 1, currency: "XOF", monerooId: `pay_sectest_${stamp}_4` });
      const sig = await hmacHex(MONEROO_WEBHOOK_SECRET, body);
      const { status } = await postWebhook(body, { "x-moneroo-signature": sig });
      await new Promise((r) => setTimeout(r, 400));
      const access = await hasAccess();
      log("Test 4 : signature valide + montant incorrect (!= prix du plan) -> aucun acces accorde", status === 200 && !access, `httpStatus=${status} accesAccorde=${access}`);
    }

    // --- Test 5 : signature valide + devise incorrecte (montant correct mais en EUR) ---
    {
      await resetAccess();
      const body = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "EUR", monerooId: `pay_sectest_${stamp}_5` });
      const sig = await hmacHex(MONEROO_WEBHOOK_SECRET, body);
      const { status } = await postWebhook(body, { "x-moneroo-signature": sig });
      await new Promise((r) => setTimeout(r, 400));
      const access = await hasAccess();
      log("Test 5 : signature valide + devise incorrecte -> aucun acces accorde", status === 200 && !access, `httpStatus=${status} accesAccorde=${access}`);
    }

    // --- Test 6 : payload falsifie apres signature (signature calculee sur un AUTRE corps) ---
    {
      await resetAccess();
      const signedBody = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "XOF", monerooId: `pay_sectest_${stamp}_6_signed` });
      const sig = await hmacHex(MONEROO_WEBHOOK_SECRET, signedBody);
      // Corps reellement envoye : identique en apparence mais avec un ID different
      // (representatif d'un attaquant qui intercepterait un webhook legitime et
      // en modifierait le contenu avant retransmission).
      const tamperedBody = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "XOF", monerooId: `pay_sectest_${stamp}_6_tampered` });
      const { status, body: respBody } = await postWebhook(tamperedBody, { "x-moneroo-signature": sig });
      await new Promise((r) => setTimeout(r, 400));
      const access = await hasAccess();
      log(
        "Test 6 : payload falsifie apres signature -> rejete (mismatch signature/corps)",
        status === 400 && respBody?.error?.message === "Invalid signature" && !access,
        `httpStatus=${status} body=${JSON.stringify(respBody)} accesAccorde=${access}`
      );
    }

    // --- Test 7 : evenement invalide/inconnu (signature valide, mais type d'evenement non gere) ---
    {
      await resetAccess();
      const body = JSON.stringify({
        event: "some.unknown.event",
        data: { id: `pay_sectest_${stamp}_7`, amount: STARTER_PRICE_XOF, currency: "XOF", metadata: { user_id: hotelId, plan: "starter" } },
        created_at: new Date().toISOString(),
      });
      const sig = await hmacHex(MONEROO_WEBHOOK_SECRET, body);
      const { status } = await postWebhook(body, { "x-moneroo-signature": sig });
      await new Promise((r) => setTimeout(r, 400));
      const access = await hasAccess();
      log(
        "Test 7 : evenement invalide/inconnu (signature valide) -> aucun acces accorde",
        !access,
        `httpStatus=${status} accesAccorde=${access}`
      );
    }

    // --- Test 8 : paiement Sandbox valide -> jamais de facture FNE reelle ---
    // Un paiement Sandbox est un test technique, pas un vrai encaissement : il ne
    // doit jamais generer de facture fiscale, meme si le montant/devise "collent".
    {
      await resetAccess();
      const monerooId = `pay_sectest_${stamp}_8`;
      const body = paymentSuccessPayload({ amount: STARTER_PRICE_XOF, currency: "XOF", monerooId });
      const sig = await hmacHex(MONEROO_WEBHOOK_SECRET, body);
      const { status } = await postWebhook(body, { "x-moneroo-signature": sig });
      await new Promise((r) => setTimeout(r, 400));
      const access = await hasAccess();
      const invoiceCheck = await svc(`invoices?moneroo_payment_id=eq.${monerooId}&select=id`);
      const noInvoiceCreated = Array.isArray(invoiceCheck.body) && invoiceCheck.body.length === 0;
      log(
        "Test 8 : paiement Sandbox valide -> acces de TEST accorde MAIS aucune facture FNE mise en file",
        status === 200 && access && noInvoiceCreated,
        `httpStatus=${status} accesAccorde=${access} factureCreee=${!noInvoiceCreated}`
      );
    }
  }
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try { if (hotelId) await resetAccess(); } catch {}
  try { if (hotelId) await adminDeleteUser(hotelId); } catch {}
}

printAndExit();
