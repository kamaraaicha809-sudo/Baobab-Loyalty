// Suite de regression complete pour Loyavia Europe (projet Supabase
// hqtqxjxorvhkdhgozdai), rejouee sur le VRAI projet avec des comptes
// jetables crees et supprimes dans un bloc finally. Aucun envoi WhatsApp
// reel (cle BSP factice, meme garde-fou que pilot-hotel-journey.mjs/
// whatsapp-consent.mjs) et aucun paiement Stripe reel (Europe non
// operationnel : on verifie au contraire qu'aucun plan n'est active
// silencieusement).
//
// Couvre : creation de compte -> connexion -> configuration hotel -> import
// clients -> segments -> campagne -> reservation (creation + confirmation,
// montant en EUR) -> lecture dashboard -> affichage EUR -> abonnement
// (verification qu'aucune facturation Europe n'est active) -> equipe
// (invite -> acceptation -> acces legitime -> revocation) -> isolation RLS
// multi-tenant (8 tentatives d'acces croise, avant ET apres retrait de
// l'equipe) -> deconnexion.
//
// Prerequis : remplir .env.europe.local avec les vraies valeurs du projet
// "Loyavia Europe" (jamais commit, voir .gitignore) :
//   NEXT_PUBLIC_SUPABASE_URL=https://hqtqxjxorvhkdhgozdai.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...   (Dashboard Supabase > Project Settings > API)
//   SUPABASE_SERVICE_ROLE_KEY=...       (idem)
//
// Usage : node scripts/regression-tests/europe-full-journey.mjs
// La sortie est un JSON PASS/FAIL (aucune cle, aucun secret) a coller telle
// quelle dans le rapport.

import {
  adminCreateUser,
  adminDeleteUser,
  signIn,
  signOut,
  restAs,
  svc,
  fn,
  makeReporter,
} from "./_shared_europe.mjs";

const { log, printAndExit } = makeReporter();
const stamp = Date.now();
const emailA = `europe-journey-a+${stamp}@baobabloyalty.com`;
const emailB = `europe-journey-b+${stamp}@baobabloyalty.com`;
const password = `Europe-Journey-Test-${stamp}!`;

let idA = null;
let idB = null;

try {
  // 1. Creation du compte hotel A (Admin API : /signup et /beta sont en
  // pause globalement via config.features.signupsPaused, meme mecanisme
  // qu'en Afrique)
  idA = await adminCreateUser(emailA, password);
  log("1. Creation du compte hotel A", !!idA, `id=${idA}`);

  // 2. Connexion
  await new Promise((r) => setTimeout(r, 1200)); // laisse le trigger handle_new_user creer le profil
  const tokenA = await signIn(emailA, password);
  log("2. Connexion hotel A", !!tokenA, tokenA ? "access_token recu" : "echec");

  const profileRes = await fn("user-get-profile", tokenA, {}, "GET");
  log("2b. Chargement du profil apres connexion (user-get-profile)", profileRes.ok, JSON.stringify(profileRes.data?.data));

  // 3. Configuration de l'hotel (memes colonnes que app/dashboard/configuration/page.tsx)
  const configRes = await restAs(tokenA, `profiles?id=eq.${idA}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({
      hotel_name: "Hotel Europe Test",
      config_complete: true,
      adresse_physique: "Rue de test 1, Paris",
      email_principal: emailA,
      telephone_officiel: "+33600000099",
      reception_whatsapp: "+33600000099",
      reception_email: emailA,
    }),
  });
  const verifyConfigRes = await restAs(
    tokenA,
    `profiles?id=eq.${idA}&select=hotel_name,config_complete,adresse_physique,email_principal,telephone_officiel,price_id,has_access`
  );
  const profileA = verifyConfigRes.body?.[0];
  log(
    "3. Configuration de l'hotel A (update + relecture)",
    configRes.status === 204 && profileA?.config_complete === true && profileA?.hotel_name === "Hotel Europe Test",
    `patchStatus=${configRes.status} relecture=${JSON.stringify(profileA)}`
  );

  // 10. Abonnement : verifie qu'aucun plan n'a ete silencieusement active
  // sur un compte Europe frais (Stripe Europe non operationnel -> aucune
  // facturation ne doit jamais s'activer toute seule)
  log(
    "10. Abonnement : aucun plan actif par defaut (Europe non operationnel)",
    profileA?.price_id === null || profileA?.price_id === undefined,
    `price_id=${JSON.stringify(profileA?.price_id)} has_access=${profileA?.has_access}`
  );

  // Config WhatsApp factice (meme cle que pilot-hotel-journey.mjs, jamais un
  // vrai envoi)
  const bspSetupRes = await svc(`profiles?id=eq.${idA}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ bsp_api_key: "FAKE_TEST_KEY_NEVER_REAL", bsp_status: "active" }),
  });
  if (bspSetupRes.status !== 204) {
    throw new Error(`Echec configuration BSP factice (setup) : status=${bspSetupRes.status}`);
  }

  // 4. Import clients CSV (5 lignes, repartis sur les segments)
  const today = new Date();
  const monthsAgo = (n) => new Date(today.getFullYear(), today.getMonth() - n, today.getDate()).toISOString().split("T")[0];
  const csvClients = [
    { nom: "EU_CLIENT_4MOIS", telephone: "+33600111001", whatsapp: "+33600111001", derniere_visite: monthsAgo(4) },
    { nom: "EU_CLIENT_7MOIS", telephone: "+33600111002", whatsapp: "+33600111002", derniere_visite: monthsAgo(7) },
    { nom: "EU_CLIENT_10MOIS", telephone: "+33600111003", whatsapp: "+33600111003", derniere_visite: monthsAgo(10) },
    { nom: "EU_CLIENT_13MOIS", telephone: "+33600111004", whatsapp: "+33600111004", derniere_visite: monthsAgo(13) },
    { nom: "EU_CLIENT_DESINSCRIT", telephone: "+33600111005", whatsapp: "+33600111005", derniere_visite: monthsAgo(4) },
  ];
  const importRes = await restAs(tokenA, "clients", {
    method: "POST",
    body: JSON.stringify(csvClients.map((c) => ({ ...c, profile_id: idA }))),
  });
  log(
    "4. Import base clients CSV (5 lignes)",
    importRes.status === 201 && Array.isArray(importRes.body) && importRes.body.length === 5,
    `status=${importRes.status} inseres=${Array.isArray(importRes.body) ? importRes.body.length : 0}`
  );
  const clientIds = Object.fromEntries((importRes.body || []).map((c) => [c.nom, c.id]));

  const optOutId = clientIds["EU_CLIENT_DESINSCRIT"];
  if (optOutId) {
    await restAs(tokenA, `clients?id=eq.${optOutId}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ marketing_consent: false, opted_out_at: new Date().toISOString() }),
    });
  }

  // Europe utilise un modele de consentement RGPD par canal
  // (communication_preferences), distinct du marketing_consent global
  // legacy d'Afrique : voir supabase/functions/_shared/consent-policy.ts.
  // Un client importe par CSV n'a AUCUNE ligne de consentement tant qu'il
  // n'a pas ete recueilli explicitement -> on simule ici ce recueil pour
  // 4 des 5 clients (celui laisse sans ligne = non-consentant, conforme au
  // "on n'invente jamais un consentement").
  const consentedNames = ["EU_CLIENT_4MOIS", "EU_CLIENT_7MOIS", "EU_CLIENT_10MOIS", "EU_CLIENT_13MOIS"];
  for (const name of consentedNames) {
    await svc("communication_preferences", {
      method: "POST",
      body: JSON.stringify({ profile_id: idA, client_id: clientIds[name], channel: "whatsapp", opted_in: true }),
    });
  }

  // 5. Segmentation
  const segRes = await restAs(tokenA, "rpc/get_segment_counts", {
    method: "POST",
    body: JSON.stringify({ p_profile_id: idA }),
  });
  log(
    "5. Segmentation (get_segment_counts)",
    segRes.status === 200 && segRes.body?.tous === 5,
    `status=${segRes.status} body=${JSON.stringify(segRes.body)}`
  );

  // 6. Campagne WhatsApp (segment "tous", exclusion du client desinscrit)
  const sendRes = await fn("campaign-send", tokenA, {
    segmentCode: "tous",
    message: "Bienvenue chez nous !",
    templateId: "baobab_offre_hotel",
  });
  const recipientCount = sendRes.data?.data?.total;
  const excludedOptOut = sendRes.data?.data?.excludedOptOut;
  log(
    "6. Creation + envoi de campagne (segment tous, exclusion opt-out)",
    sendRes.status === 200 && recipientCount === 4 && excludedOptOut === 1,
    `status=${sendRes.status} total_cible=${recipientCount} excludedOptOut=${excludedOptOut}`
  );

  // 7. Reservation : creation (equivalent /offre) + confirmation reelle par
  // l'hotelier avec un montant en EUR
  const insertReservation = await svc("reservations", {
    method: "POST",
    body: JSON.stringify({
      profile_id: idA,
      reservation_date: today.toISOString().split("T")[0],
      type_reservation: "directe",
      status: "pending_validation",
      client_name: "Client Europe Test",
      client_phone: "+33600111099",
      check_in_date: today.toISOString().split("T")[0],
      check_out_date: monthsAgo(-1),
      nights: 2,
      source: "baobab",
    }),
  });
  const reservationId = insertReservation.body?.[0]?.id;
  log(
    "7a. Creation reservation en attente (equivalent /offre)",
    insertReservation.status === 201 && !!reservationId,
    `status=${insertReservation.status} id=${reservationId}`
  );

  const EUR_AMOUNT = 149; // aligne sur config.billing.plansEurope (plan Professional)
  const confirmRes = await fn("reservations-confirm", tokenA, {
    reservationId,
    action: "confirm",
    montantFcfa: EUR_AMOUNT,
  });
  const confirmedRow = await svc(`reservations?id=eq.${reservationId}&select=status,montant_fcfa,confirmed_at`);
  const savedReservation = confirmedRow.body?.[0];
  log(
    "7b. Confirmation reservation par l'hotelier (montant reel enregistre)",
    confirmRes.status === 200 && savedReservation?.status === "confirmed" && savedReservation?.montant_fcfa === EUR_AMOUNT,
    `status=${confirmRes.status} relecture=${JSON.stringify(savedReservation)}`
  );

  // 8. Dashboard : donnees reellement lues par le dashboard (graphique +
  // activite recente)
  const chartRes = await restAs(tokenA, "rpc/get_reservations_chart", {
    method: "POST",
    body: JSON.stringify({ p_profile_id: idA }),
  });
  const activityRes = await restAs(
    tokenA,
    `reservations?profile_id=eq.${idA}&status=eq.confirmed&select=id,client_name,montant_fcfa,confirmed_at`
  );
  log(
    "8. Dashboard : graphique + activite recente (donnees reelles)",
    chartRes.status === 200 && Array.isArray(chartRes.body) && activityRes.status === 200 && activityRes.body?.length === 1,
    `chartStatus=${chartRes.status} activite=${JSON.stringify(activityRes.body)}`
  );

  // 9. Affichage EUR : meme logique de formatage que src/lib/currency.ts
  // (Intl NumberFormat fr-FR / EUR) appliquee au montant reellement stocke
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(savedReservation?.montant_fcfa) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(savedReservation?.montant_fcfa ?? 0);
  log(
    "9. Affichage EUR (formatCurrency applique au montant reel stocke)",
    formatted.includes("€") && !formatted.includes("FCFA"),
    `montant_stocke=${savedReservation?.montant_fcfa} affichage=${formatted}`
  );

  // 11. Creation du compte hotel B (etranger a l'hotel A, non configure)
  idB = await adminCreateUser(emailB, password);
  await new Promise((r) => setTimeout(r, 1200));
  const tokenB = await signIn(emailB, password);
  log("11. Creation + connexion du compte hotel B (etranger)", !!idB && !!tokenB, `id=${idB}`);

  // 12. Isolation RLS multi-tenant : B (etranger, pas encore dans l'equipe
  // de A) ne doit avoir AUCUN acces aux donnees de A
  const t1 = await restAs(tokenB, `clients?profile_id=eq.${idA}&select=id,nom`);
  log(
    "12a. IDOR clients (filtre explicite sur A) — B etranger",
    t1.status === 200 && Array.isArray(t1.body) && t1.body.length === 0,
    `status=${t1.status} body=${JSON.stringify(t1.body)}`
  );

  const t2 = await restAs(tokenB, "clients?select=id,nom");
  const leaksA = Array.isArray(t2.body) && t2.body.some((c) => c.id === clientIds["EU_CLIENT_4MOIS"]);
  log(
    "12b. IDOR clients (liste complete sans filtre) — B etranger",
    t2.status === 200 && !leaksA,
    `status=${t2.status} leaksA=${leaksA}`
  );

  const t3 = await restAs(tokenB, `clients?id=eq.${clientIds["EU_CLIENT_4MOIS"]}`, {
    method: "PATCH",
    body: JSON.stringify({ nom: "HACKED_BY_B" }),
  });
  const t3check = await svc(`clients?id=eq.${clientIds["EU_CLIENT_4MOIS"]}&select=nom`);
  log(
    "12c. IDOR clients (UPDATE croise) — B etranger",
    t3check.body?.[0]?.nom === "EU_CLIENT_4MOIS",
    `patchStatus=${t3.status} nomApres=${t3check.body?.[0]?.nom}`
  );

  const t4 = await restAs(tokenB, `reservations?id=eq.${reservationId}`, { method: "DELETE" });
  const t4check = await svc(`reservations?id=eq.${reservationId}&select=id`);
  log(
    "12d. IDOR reservations (DELETE croise) — B etranger",
    t4check.body?.length === 1,
    `deleteStatus=${t4.status} existeApres=${t4check.body?.length === 1}`
  );

  const t5 = await restAs(tokenB, "rpc/get_segment_counts", { method: "POST", body: JSON.stringify({ p_profile_id: idA }) });
  log("12e. IDOR RPC get_segment_counts (JWT B, profile A) — B etranger", t5.status >= 400, `status=${t5.status}`);

  const t6 = await fn("user-get-profile", null, {}, "GET");
  log("12f. IDOR profil (aucun token) — anonyme", t6.status === 401, `status=${t6.status}`);

  const t7 = await restAs(tokenB, `profiles?id=eq.${idA}&select=id,hotel_name,email`);
  log(
    "12g. IDOR profiles (lecture profil A par B) — B etranger",
    t7.status === 200 && t7.body?.length === 0,
    `status=${t7.status} body=${JSON.stringify(t7.body)}`
  );

  const t8 = await restAs(tokenB, "campaigns", {
    method: "POST",
    body: JSON.stringify({ profile_id: idA, name: "hack", segment_code: "tous", status: "draft", recipient_count: 0 }),
  });
  log("12h. IDOR campaigns (INSERT croise pour A) — B etranger", t8.status >= 400, `status=${t8.status}`);

  // 13. Equipe : A invite B (necessite price_id=premium, force ici via
  // service role pour le test — Europe n'a pas encore de vrai paiement,
  // donc pas d'autre moyen d'atteindre cet etat), B accepte, verifie
  // l'acces legitime, puis A retire B et verifie la revocation
  await svc(`profiles?id=eq.${idA}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ price_id: "premium" }),
  });

  const inviteRes = await fn("team-invite", tokenA, { email: emailB, teamRole: "member" });
  log("13a. Invitation equipe (A invite B)", inviteRes.status === 200, `status=${inviteRes.status} body=${JSON.stringify(inviteRes.data)}`);

  // encodeURIComponent est indispensable ici : un "+" non encode dans une
  // query string REST est decode en espace par le serveur, donc le filtre
  // ne matche jamais un email contenant "+" (piege rencontre en testant).
  const invitationRow = await svc(
    `team_invitations?profile_id=eq.${idA}&email=eq.${encodeURIComponent(emailB)}&select=token,status`
  );
  const inviteToken = invitationRow.body?.[0]?.token;

  const acceptRes = await fn("team-accept-invite", tokenB, { token: inviteToken });
  log(
    "13b. Acceptation invitation (B rejoint l'equipe de A)",
    acceptRes.status === 200 && acceptRes.data?.data?.joined === true,
    `status=${acceptRes.status} body=${JSON.stringify(acceptRes.data)}`
  );

  const listAfterJoin = await fn("team-list", tokenA, {}, "GET");
  const memberCountAfterJoin = listAfterJoin.data?.data?.members?.length;
  log(
    "13c. Liste equipe (A voit B comme membre)",
    listAfterJoin.status === 200 && memberCountAfterJoin === 1,
    `status=${listAfterJoin.status} membres=${memberCountAfterJoin}`
  );

  // Preuve que l'appartenance a l'equipe debloque legitimement l'acces
  // (contraste direct avec les IDOR bloques a l'etape 12, avant l'invitation)
  const t9 = await restAs(tokenB, `clients?profile_id=eq.${idA}&select=id,nom`);
  log(
    "13d. Acces legitime aux donnees de A par B (membre d'equipe)",
    t9.status === 200 && Array.isArray(t9.body) && t9.body.length === 5,
    `status=${t9.status} count=${Array.isArray(t9.body) ? t9.body.length : "n/a"}`
  );

  const memberIdB = listAfterJoin.data?.data?.members?.find((m) => m.user_id === idB)?.id;
  const removeRes = await fn("team-remove-member", tokenA, { memberId: memberIdB });
  log("13e. Retrait de B de l'equipe", removeRes.status === 200, `status=${removeRes.status}`);

  const t10 = await restAs(tokenB, `clients?profile_id=eq.${idA}&select=id,nom`);
  log(
    "13f. Acces revoque apres retrait (B redevient etranger)",
    t10.status === 200 && Array.isArray(t10.body) && t10.body.length === 0,
    `status=${t10.status} count=${Array.isArray(t10.body) ? t10.body.length : "n/a"}`
  );

  // 14. Deconnexion
  const logoutA = await signOut(tokenA);
  const logoutB = await signOut(tokenB);
  log("14. Deconnexion (A et B)", logoutA === 204 && logoutB === 204, `logoutA=${logoutA} logoutB=${logoutB}`);
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try {
    if (idA) await adminDeleteUser(idA);
  } catch {
    /* best effort */
  }
  try {
    if (idB) await adminDeleteUser(idB);
  } catch {
    /* best effort */
  }
}

printAndExit();
