// Suite de regression pour la separation Sandbox/Live des paiements Moneroo.
//
// Verifie en conditions reelles que :
//   1. MONEROO_API_KEY_SANDBOX permet d'initialiser un vrai paiement de TEST
//      directement aupres de l'API Moneroo (jamais via billing-create-checkout,
//      qui est cablee en dur sur MONEROO_API_KEY_LIVE - voir index.ts).
//   2. billing-create-checkout (le vrai bouton de paiement utilise par les
//      hoteliers) refuse toujours de creer un paiement tant que
//      MONEROO_API_KEY_LIVE n'existe pas dans le Vault, MEME QUAND
//      MONEROO_API_KEY_SANDBOX est configuree : la cle Sandbox ne doit
//      jamais pouvoir, meme par erreur, activer un vrai paiement.
//
// Aucun paiement Sandbox initialise ici n'est jamais complete (pas de carte
// de test soumise sur la page Moneroo) : ce script verifie seulement que la
// session de paiement peut etre creee, pas le parcours complet du payeur
// (deja couvert cote reception par billing-webhook-security.mjs, qui simule
// les evenements payment.success/payment.failed avec le secret Sandbox).
//
// Usage : node scripts/regression-tests/moneroo-sandbox-checkout.mjs

import { adminCreateUser, adminDeleteUser, signIn, makeReporter, envVarOptional, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();
const MONEROO_API_KEY_SANDBOX = envVarOptional("MONEROO_API_KEY_SANDBOX");
const MONEROO_API_URL = "https://api.moneroo.io/v1";
const STARTER_PRICE_XOF = 39000;

const stamp = Date.now();

if (!MONEROO_API_KEY_SANDBOX) {
  log("Test 1 : initialisation d'un paiement Sandbox via l'API Moneroo", null, "SKIPPED - MONEROO_API_KEY_SANDBOX absent de .env.local");
} else {
  try {
    const res = await fetch(`${MONEROO_API_URL}/payments/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MONEROO_API_KEY_SANDBOX}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: STARTER_PRICE_XOF,
        currency: "XOF",
        description: "Baobab Loyalty - Test regression Sandbox (jamais complete)",
        return_url: "https://baobabloyalty.com/dashboard",
        cancel_url: "https://baobabloyalty.com/dashboard",
        customer: { email: `regression-sandbox-${stamp}@baobabloyalty.com`, first_name: "Regression", last_name: "Test" },
        metadata: { user_id: `regression-sandbox-${stamp}`, plan: "starter" },
      }),
    });
    const body = await res.json().catch(() => null);
    const checkoutUrl = body?.data?.checkout_url;
    log(
      "Test 1 : initialisation d'un paiement Sandbox via l'API Moneroo -> session de test creee",
      res.ok && !!checkoutUrl,
      `httpStatus=${res.status} checkoutUrlPresent=${!!checkoutUrl} paymentId=${body?.data?.id || "n/a"}`
    );
  } catch (err) {
    log("Test 1 : initialisation d'un paiement Sandbox via l'API Moneroo", false, err instanceof Error ? err.message : String(err));
  }
}

// --- Test 2 : le vrai checkout (billing-create-checkout) ne doit JAMAIS utiliser la cle Sandbox ---
let userId;
try {
  const email = `regression-live-checkout-${stamp}@baobabloyalty.com`;
  const password = `RegLive1!Chk#${stamp}`;
  userId = await adminCreateUser(email, password);
  await new Promise((r) => setTimeout(r, 500));
  const token = await signIn(email, password);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/billing-create-checkout`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      planSlug: "starter",
      planName: "Starter",
      successUrl: "https://baobabloyalty.com/dashboard",
      cancelUrl: "https://baobabloyalty.com/dashboard",
    }),
  });
  const body = await res.json().catch(() => null);
  const refusedProperly = res.status >= 400 && body?.error?.message === "Les paiements ne sont pas encore disponibles. Réessayez plus tard.";
  log(
    "Test 2 : billing-create-checkout (vrai bouton) refuse tant que MONEROO_API_KEY_LIVE n'existe pas, meme avec la cle Sandbox configuree",
    refusedProperly,
    `httpStatus=${res.status} body=${JSON.stringify(body)}`
  );
} catch (err) {
  log("Test 2 : billing-create-checkout isolation Live/Sandbox", false, err instanceof Error ? err.stack : String(err));
} finally {
  try { if (userId) await adminDeleteUser(userId); } catch {}
}

printAndExit();
