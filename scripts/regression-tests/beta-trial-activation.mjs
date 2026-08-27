// Suite de regression pour profile-activate-beta-trial (essai bêta 14 jours).
//
// Verifie en conditions reelles que :
//   1. un compte fraichement cree peut activer l'essai bêta -> is_beta_tester=true,
//      trial_ends_at ~14 jours (et non 30, le defaut standard)
//   2. rappeler la fonction une seconde fois est un no-op (idempotent) -> ne
//      prolonge pas l'essai indefiniment
//   3. un compte non authentifie (sans JWT) est rejete
//
// Le garde-fou "fenetre de 30 minutes apres creation du compte" (protection
// contre un hotel existant qui s'auto-offrirait 14 jours de plus) n'est pas
// testable ici sans pouvoir avancer le temps reel : verifie par lecture de
// code (supabase/functions/profile-activate-beta-trial/index.ts).
//
// Usage : node scripts/regression-tests/beta-trial-activation.mjs

import { svc, adminCreateUser, adminDeleteUser, signIn, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();

const stamp = Date.now();
const email = `regression-beta-trial-${stamp}@baobabloyalty.com`;
const password = `RegBeta1!Act#${stamp}`;
let userId;

async function callActivate(token) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/profile-activate-beta-trial`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
}

try {
  userId = await adminCreateUser(email, password);
  await new Promise((r) => setTimeout(r, 500));
  const token = await signIn(email, password);

  // --- Test 1 : activation reelle sur un compte fraichement cree ---
  {
    const { status, body } = await callActivate(token);
    const check = await svc(`profiles?id=eq.${userId}&select=is_beta_tester,trial_ends_at`);
    const row = check.body?.[0];
    const daysRemaining = row?.trial_ends_at ? (new Date(row.trial_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000) : null;
    const isRoughly14Days = daysRemaining !== null && daysRemaining > 13 && daysRemaining < 15;
    log(
      "Test 1 : activation reelle -> is_beta_tester=true, trial_ends_at ~14 jours",
      status === 200 && body?.data?.activated === true && row?.is_beta_tester === true && isRoughly14Days,
      `httpStatus=${status} body=${JSON.stringify(body)} dbState=${JSON.stringify(row)} joursRestants=${daysRemaining?.toFixed(2)}`
    );
  }

  // --- Test 2 : rappel de la fonction -> idempotent, pas de prolongation ---
  {
    const before = await svc(`profiles?id=eq.${userId}&select=trial_ends_at`);
    const trialBefore = before.body?.[0]?.trial_ends_at;
    const { status, body } = await callActivate(token);
    const after = await svc(`profiles?id=eq.${userId}&select=trial_ends_at`);
    const trialAfter = after.body?.[0]?.trial_ends_at;
    log(
      "Test 2 : second appel -> idempotent (alreadyActive=true), trial_ends_at inchange",
      status === 200 && body?.data?.activated === false && body?.data?.alreadyActive === true && trialBefore === trialAfter,
      `httpStatus=${status} body=${JSON.stringify(body)} trialAvant=${trialBefore} trialApres=${trialAfter}`
    );
  }

  // --- Test 3 : appel sans authentification -> rejete ---
  {
    const { status } = await callActivate(null);
    log("Test 3 : appel sans JWT -> rejete (401)", status === 401, `httpStatus=${status}`);
  }
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try { if (userId) await adminDeleteUser(userId); } catch {}
}

printAndExit();
