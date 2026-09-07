// Parcours complet d'un hotel pilote, rejoue exactement comme le ferait le
// frontend (memes tables/Edge Functions, memes colonnes), sur un compte
// jetable cree et supprime dans un bloc finally. Aucun envoi WhatsApp reel :
// cle BSP volontairement invalide (FAKE_TEST_KEY_NEVER_REAL), rejetee a
// l'authentification par 360dialog — meme garde-fou que whatsapp-consent.mjs.
//
// Couvre : creation de compte -> connexion -> configuration hotel -> import
// CSV -> segmentation -> creation/selection/envoi de campagne -> exclusion
// d'un client desinscrit -> suivi des resultats. La reception reelle d'un
// message et le mot-cle STOP en conditions reelles ne sont PAS couverts ici
// (necessitent Meta + un vrai telephone) : voir whatsapp-consent.mjs et
// whatsapp-webhook-security.mjs pour ces deux points, deja testes en reel.
//
// Usage : npm run test:pilot-journey

import {
  adminCreateUser,
  adminDeleteUser,
  signIn,
  restAs,
  svc,
  SUPABASE_URL,
  ANON_KEY,
  makeReporter,
} from "./_shared.mjs";

const { log, printAndExit } = makeReporter();
const stamp = Date.now();
const email = `pilot-journey+${stamp}@baobabloyalty.com`;
const password = "Pilot-Journey-Test-2026!";

async function fn(name, token, body, method = "POST") {
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

let userId = null;

try {
  // 1. Creation du compte (equivalent d'un onboarding manuel de pilote,
  // signups etant volontairement en pause sur /signup et /beta)
  userId = await adminCreateUser(email, password);
  log("1. Creation du compte hotel pilote", !!userId, `id=${userId}`);

  // 2. Connexion
  await new Promise((r) => setTimeout(r, 1200)); // laisse le trigger handle_new_user creer le profil
  const token = await signIn(email, password);
  log("2. Connexion", !!token, token ? "access_token recu" : "echec");

  const profileRes = await fn("user-get-profile", token, {}, "GET");
  log("2b. Chargement du profil apres connexion (user-get-profile)", profileRes.ok, JSON.stringify(profileRes.data?.data));

  // 3. Configuration de l'hotel — memes colonnes ET meme absence de .select()
  // que app/dashboard/configuration/page.tsx (Prefer: return=minimal, pas de
  // RETURNING implicite sur profiles — voir la mise en garde de la migration
  // 055_restrict_profiles_select_columns.sql)
  const configRes = await restAs(token, `profiles?id=eq.${userId}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({
      hotel_name: "Hotel Pilote Test",
      config_complete: true,
      adresse_physique: "Boulevard de la Marina, Abidjan",
      email_principal: email,
      telephone_officiel: "+2250700000099",
      reception_whatsapp: "+2250700000099",
      reception_email: email,
    }),
  });
  const verifyConfigRes = await restAs(
    token,
    `profiles?id=eq.${userId}&select=hotel_name,config_complete,adresse_physique,email_principal,telephone_officiel`
  );
  const savedRow = verifyConfigRes.body?.[0];
  log(
    "3. Configuration de l'hotel (update + verification relecture)",
    configRes.status === 204 && savedRow?.config_complete === true && savedRow?.hotel_name === "Hotel Pilote Test",
    `patchStatus=${configRes.status} relecture=${JSON.stringify(savedRow)}`
  );

  // Config WhatsApp factice (necessaire pour exercer campaign-send sans
  // jamais declencher un vrai envoi) — via service role, exactement comme le
  // ferait whatsapp-connect (bsp_api_key/bsp_status sont volontairement hors
  // du GRANT UPDATE authenticated depuis la migration 044 : un hotelier ne
  // peut jamais les ecrire lui-meme en direct, meme dans ce test). Meme cle
  // que whatsapp-consent.mjs.
  const bspSetupRes = await svc(`profiles?id=eq.${userId}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ bsp_api_key: "FAKE_TEST_KEY_NEVER_REAL", bsp_status: "active" }),
  });
  if (bspSetupRes.status !== 204) {
    throw new Error(`Echec configuration BSP factice (setup, pas un vrai test) : status=${bspSetupRes.status} body=${JSON.stringify(bspSetupRes.body)}`);
  }

  // 4. Import de la base clients CSV (memes colonnes que importClients() de
  // src/sdk/clients.ts), reparti sur les 4 segments pour verifier la
  // segmentation ensuite
  const today = new Date();
  const monthsAgo = (n) => new Date(today.getFullYear(), today.getMonth() - n, today.getDate()).toISOString().split("T")[0];
  const csvClients = [
    { nom: "PILOTE_CLIENT_4MOIS", telephone: "+2250700111001", whatsapp: "+2250700111001", derniere_visite: monthsAgo(4) },
    { nom: "PILOTE_CLIENT_7MOIS", telephone: "+2250700111002", whatsapp: "+2250700111002", derniere_visite: monthsAgo(7) },
    { nom: "PILOTE_CLIENT_10MOIS", telephone: "+2250700111003", whatsapp: "+2250700111003", derniere_visite: monthsAgo(10) },
    { nom: "PILOTE_CLIENT_13MOIS", telephone: "+2250700111004", whatsapp: "+2250700111004", derniere_visite: monthsAgo(13) },
    { nom: "PILOTE_CLIENT_DESINSCRIT", telephone: "+2250700111005", whatsapp: "+2250700111005", derniere_visite: monthsAgo(4) },
  ];
  const importRes = await restAs(token, "clients", {
    method: "POST",
    body: JSON.stringify(csvClients.map((c) => ({ ...c, profile_id: userId }))),
  });
  log(
    "4. Import base clients CSV (5 lignes)",
    importRes.status === 201 && Array.isArray(importRes.body) && importRes.body.length === 5,
    `status=${importRes.status} inseres=${Array.isArray(importRes.body) ? importRes.body.length : 0}`
  );

  const clientIds = Object.fromEntries((importRes.body || []).map((c) => [c.nom, c.id]));

  // Marque un client comme non-consentant (equivalent d'un vrai STOP recu, ou
  // du toggle manuel "Desinscrit" de /dashboard/segments)
  const optOutId = clientIds["PILOTE_CLIENT_DESINSCRIT"];
  if (optOutId) {
    await restAs(token, `clients?id=eq.${optOutId}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ marketing_consent: false, opted_out_at: new Date().toISOString() }),
    });
  }

  // 5. Segmentation (RPC utilisee par le dashboard)
  const segRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_segment_counts`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_profile_id: userId }),
  });
  const segCounts = await segRes.json();
  log(
    "5. Segmentation (get_segment_counts)",
    segRes.ok && segCounts?.tous === 5,
    `status=${segRes.status} body=${JSON.stringify(segCounts)}`
  );

  // 6+7+8. Creation de campagne + selection des clients + envoi (segment "tous")
  const sendRes = await fn("campaign-send", token, {
    segmentCode: "tous",
    message: "Offre pilote de bienvenue !",
    templateId: "baobab_offre_hotel",
  });
  log(
    "6+7+8. Creation + selection + envoi de campagne (segment tous)",
    sendRes.status === 200,
    `status=${sendRes.status} body=${JSON.stringify(sendRes.data)}`
  );

  // 11. Exclusion du client desinscrit : 5 clients au total, 1 exclu -> 4 cibles
  const recipientCount = sendRes.data?.data?.total;
  const excludedOptOut = sendRes.data?.data?.excludedOptOut;
  log(
    "11. Exclusion du client desinscrit de la campagne",
    recipientCount === 4 && excludedOptOut === 1,
    `total_cible=${recipientCount} excludedOptOut=${excludedOptOut} (attendu: total=4, exclu=1)`
  );

  // 12. Suivi des resultats (ce que lit le dashboard pour l'historique de campagnes)
  const campaignsRes = await restAs(token, `campaigns?profile_id=eq.${userId}&select=id,name,segment_code,status,recipient_count,started_at`);
  const sentMessagesRes = await restAs(token, `sent_messages?profile_id=eq.${userId}&select=id,status,error_message`);
  log(
    "12. Suivi des resultats (campagnes + sent_messages)",
    campaignsRes.status === 200 && sentMessagesRes.status === 200,
    `campagnes=${JSON.stringify(campaignsRes.body)} sent_messages=${JSON.stringify(sentMessagesRes.body)}`
  );

  // 9/10 (rappel, non couverts ici) : reception reelle sur un vrai telephone
  // impossible sans Meta ; STOP/desinscription deja verifies en reel par
  // whatsapp-consent.mjs (9/9) et whatsapp-webhook-security.mjs (6/6).
} finally {
  if (userId) await adminDeleteUser(userId);
}

printAndExit();
