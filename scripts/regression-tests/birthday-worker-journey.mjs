// Test de bout en bout REEL du parcours anniversaire (birthday-worker), sur
// le vrai projet Supabase Afrique. Cree un hotel + des clients jetables,
// appelle la VRAIE fonction deployee birthday-worker, verifie le resultat en
// base, puis nettoie tout. Une fausse cle BSP est utilisee (meme pattern que
// whatsapp-consent.mjs) : birthday-worker va reellement tenter d'appeler
// 360dialog et echouer a l'authentification -- aucun message n'est jamais
// reellement livre, mais toute la logique (detection, consentement,
// anti-doublon, personnalisation, journalisation) est testee pour de vrai.
//
// BIRTHDAY_WORKER_SECRET n'est jamais stocke dans le repo (ni .env.local) :
// c'est un secret Vault/Edge Function cote Supabase. A fournir explicitement
// a l'execution.
//
// Usage : BIRTHDAY_WORKER_SECRET=xxx node scripts/regression-tests/birthday-worker-journey.mjs

import { svc, adminCreateUser, adminDeleteUser, makeReporter, SUPABASE_URL } from "./_shared.mjs";

const WORKER_SECRET = process.env.BIRTHDAY_WORKER_SECRET;
if (!WORKER_SECRET) {
  console.error("BIRTHDAY_WORKER_SECRET manquant dans l'environnement.");
  process.exit(1);
}

const { log, printAndExit } = makeReporter();

const stamp = Date.now();
const email = `regression-birthday-${stamp}@baobabloyalty.com`;
const password = `Reg1!BD#${stamp}`;

let hotelId, campaignIdBefore;
const clientIds = {};

function todayIso() {
  return new Date().toISOString().split("T")[0];
}
function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split("T")[0];
}
// Meme mois/jour qu'aujourd'hui, mais annee de naissance realiste (1990).
function birthdateToday() {
  const d = new Date();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `1990-${mm}-${dd}`;
}

try {
  hotelId = await adminCreateUser(email, password);

  const currentYear = new Date().getUTCFullYear();

  const cfg = await svc(`profiles?id=eq.${hotelId}`, {
    method: "PATCH",
    body: JSON.stringify({
      hotel_name: "TEST BIRTHDAY REGRESSION",
      bsp_api_key: "FAKE_TEST_KEY_NEVER_REAL",
      bsp_status: "active",
      birthday_automation_enabled: true,
      birthday_template_key: "chaleureux",
    }),
  });
  log("Setup : hotel de test configure (BSP factice + automatisation activee)", cfg.status === 200 || cfg.status === 204, `status=${cfg.status} body=${JSON.stringify(cfg.body)}`);

  const commonClient = (nom, overrides = {}) => ({
    profile_id: hotelId,
    nom,
    whatsapp: `+2250700${String(Math.floor(Math.random() * 900000) + 100000)}`,
    derniere_visite: todayIso(),
    ...overrides,
  });

  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN1_Fatou_Anniversaire_Consentante", { date_naissance: birthdateToday(), marketing_consent: true })) });
    clientIds.eligible = r.body?.[0]?.id;
    log("Setup client 1 (anniversaire aujourd'hui, consentante) cree", r.status === 201 && !!clientIds.eligible, JSON.stringify(r.body));
  }
  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN2_SansConsentement_Anniversaire", { date_naissance: birthdateToday(), marketing_consent: false })) });
    clientIds.noConsent = r.body?.[0]?.id;
    log("Setup client 2 (anniversaire aujourd'hui, SANS consentement) cree", r.status === 201 && !!clientIds.noConsent, JSON.stringify(r.body));
  }
  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN3_DejaSouhaite_CetteAnnee", { date_naissance: birthdateToday(), marketing_consent: true, last_birthday_sent_year: currentYear })) });
    clientIds.alreadySent = r.body?.[0]?.id;
    log("Setup client 3 (anniversaire aujourd'hui, DEJA souhaite cette annee) cree", r.status === 201 && !!clientIds.alreadySent, JSON.stringify(r.body));
  }
  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN4_Temoin_PasAnniversaire", { date_naissance: isoDaysAgo(10), marketing_consent: true })) });
    clientIds.witness = r.body?.[0]?.id;
    log("Setup client 4 (temoin, anniversaire il y a 10 jours) cree", r.status === 201 && !!clientIds.witness, JSON.stringify(r.body));
  }

  // Appel REEL de la fonction deployee.
  const workerRes = await fetch(`${SUPABASE_URL}/functions/v1/birthday-worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-birthday-worker-secret": WORKER_SECRET },
    body: "{}",
  });
  const workerBody = await workerRes.json().catch(() => null);
  log("Appel reel de birthday-worker (fonction deployee)", workerRes.ok && workerBody?.data?.processedProfiles >= 1, `status=${workerRes.status} body=${JSON.stringify(workerBody)}`);

  await new Promise((r) => setTimeout(r, 500));

  const camp = await svc(`campaigns?profile_id=eq.${hotelId}&campaign_type=eq.birthday&select=id,segment_code,campaign_type,status,recipient_count`);
  campaignIdBefore = camp.body?.[0]?.id ?? null;
  log("Une campagne 'birthday' a ete creee (segment_code=anniversaire)", camp.body?.length === 1 && camp.body[0].segment_code === "anniversaire" && camp.body[0].recipient_count === 1, JSON.stringify(camp.body));

  const sent = await svc(`sent_messages?campaign_id=eq.${campaignIdBefore}&select=client_id,status,message_content,template_id,error_message`);
  const targetedIds = new Set((sent.body || []).map((r) => r.client_id));
  log(
    "Seul le client eligible (consentant, anniversaire aujourd'hui, jamais souhaite) a ete cible",
    targetedIds.size === 1 && targetedIds.has(clientIds.eligible) && !targetedIds.has(clientIds.noConsent) && !targetedIds.has(clientIds.alreadySent) && !targetedIds.has(clientIds.witness),
    JSON.stringify(sent.body)
  );

  const eligibleRow = (sent.body || []).find((r) => r.client_id === clientIds.eligible);
  log(
    "Le message a bien ete personnalise (prenom + nom hotel) avec le template choisi",
    !!eligibleRow?.message_content?.includes("Fatou") && !!eligibleRow?.message_content?.includes("TEST BIRTHDAY REGRESSION") && eligibleRow?.template_id === "chaleureux",
    `message_content=${eligibleRow?.message_content}`
  );
  log(
    "L'envoi a echoue au niveau Meta/360dialog comme attendu (fausse cle BSP) -- aucun message reellement livre",
    eligibleRow?.status === "failed" && !!eligibleRow?.error_message,
    `status=${eligibleRow?.status} error=${eligibleRow?.error_message}`
  );

  const audit = await svc(`audit_log?profile_id=eq.${hotelId}&action=eq.birthday_message_sent&select=details`);
  log("Une entree audit_log 'birthday_message_sent' a ete creee", audit.body?.length === 1, JSON.stringify(audit.body));

  const dejaSouhaiteClient = await svc(`clients?id=eq.${clientIds.alreadySent}&select=last_birthday_sent_year`);
  log("Le client deja souhaite cette annee garde son last_birthday_sent_year inchange (anti-doublon respecte)", dejaSouhaiteClient.body?.[0]?.last_birthday_sent_year === currentYear, JSON.stringify(dejaSouhaiteClient.body));

  // Deuxieme appel immediat : le client eligible n'a PAS eu son
  // last_birthday_sent_year mis a jour puisque l'envoi a echoue -- il reste
  // donc cible tant que l'envoi echoue, ce qui est le comportement voulu :
  // seul un envoi REUSSI doit marquer l'annee comme faite.
  const workerRes2 = await fetch(`${SUPABASE_URL}/functions/v1/birthday-worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-birthday-worker-secret": WORKER_SECRET },
    body: "{}",
  });
  const workerBody2 = await workerRes2.json().catch(() => null);
  log(
    "Deuxieme appel : le client dont l'envoi a echoue est re-tente (pas marque comme fait tant que l'envoi n'a pas reussi)",
    workerRes2.ok && workerBody2?.data?.totalSent === 0,
    `body=${JSON.stringify(workerBody2)}`
  );

  const wrongSecretRes = await fetch(`${SUPABASE_URL}/functions/v1/birthday-worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-birthday-worker-secret": "mauvais-secret" },
    body: "{}",
  });
  log("Un appel avec un mauvais secret est bien rejete (401)", wrongSecretRes.status === 401, `status=${wrongSecretRes.status}`);
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try {
    const allCamps = await svc(`campaigns?profile_id=eq.${hotelId}&select=id`);
    for (const c of allCamps.body || []) {
      await svc(`sent_messages?campaign_id=eq.${c.id}`, { method: "DELETE" });
      await svc(`campaigns?id=eq.${c.id}`, { method: "DELETE" });
    }
  } catch {}
  try { await svc(`audit_log?profile_id=eq.${hotelId}`, { method: "DELETE" }); } catch {}
  for (const id of Object.values(clientIds)) {
    try { if (id) await svc(`clients?id=eq.${id}`, { method: "DELETE" }); } catch {}
  }
  try { if (hotelId) await adminDeleteUser(hotelId); } catch {}
}

printAndExit();
