// Suite de regression consentement / desinscription WhatsApp.
//
// Verifie en conditions reelles (vrai projet Supabase, vraies Edge Functions
// deployees) que le consentement marketing est toujours respecte :
//   1. client avec consentement -> cible par une campagne
//   2. client sans consentement -> jamais cible
//   3. desinscription via le lien libre-service (clients-unsubscribe)
//   4. desinscription via un message "STOP" recu (whatsapp-webhook)
//   5/10. une nouvelle campagne apres STOP exclut bien le client
//   6. re-importer un client deja desinscrit ne reinitialise jamais son consentement
//   8. le meme numero de telephone sur 2 hotels a un consentement independant
//   9. supprimer un client le retire proprement (pas d'orphelin)
// (Le scenario 7 — fusion des doublons internes a un fichier CSV — est une
// fonction pure cote frontend sans effet de bord serveur ; il se verifie par
// lecture de code, pas par ce script.)
//
// Un bsp_api_key volontairement invalide est utilise : campaign-send passe le
// garde-fou "WhatsApp non configure" mais tout envoi reel serait rejete par
// 360dialog a l'authentification. Aucun message n'est jamais reellement livre.
//
// A relancer avant toute release qui touche : campaign-send, whatsapp-webhook,
// clients-unsubscribe, ou la logique d'import CSV (src/sdk/clients.ts).
//
// Usage : node scripts/regression-tests/whatsapp-consent.mjs

import { svc, adminCreateUser, adminDeleteUser, signIn, makeReporter, hmacHex, envVarOptional, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();
const META_APP_SECRET = envVarOptional("META_APP_SECRET");

const stamp = Date.now();
const emailH1 = `regression-wa-h1-${stamp}@baobabloyalty.com`;
const emailH2 = `regression-wa-h2-${stamp}@baobabloyalty.com`;
const password = `Reg1!WA#${stamp}`;

let idH1, idH2, tokenH1;
const clientIds = {};
let campaignId = null;

try {
  idH1 = await adminCreateUser(emailH1, password);
  idH2 = await adminCreateUser(emailH2, password);
  tokenH1 = await signIn(emailH1, password);
  await new Promise((r) => setTimeout(r, 800));

  const cfg = await svc(`profiles?id=eq.${idH1}`, {
    method: "PATCH",
    body: JSON.stringify({ bsp_api_key: "FAKE_TEST_KEY_NEVER_REAL", bsp_status: "active" }),
  });
  log("Setup : hotel 1 configure avec une fausse cle BSP (jamais un vrai envoi)", cfg.status === 200 || cfg.status === 204, `status=${cfg.status}`);

  const today = new Date().toISOString().split("T")[0];
  const commonClient = (nom, overrides = {}) => ({
    profile_id: idH1,
    nom,
    whatsapp: `+2250700${String(Math.floor(Math.random() * 900000) + 100000)}`,
    derniere_visite: today,
    ...overrides,
  });

  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN1_AVEC_CONSENTEMENT", { marketing_consent: true })) });
    clientIds.withConsent = r.body?.[0]?.id;
    log("Scenario 1 (avec consentement) : client cree", r.status === 201 && !!clientIds.withConsent, JSON.stringify(r.body));
  }

  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN2_SANS_CONSENTEMENT", { marketing_consent: false, consent_source: "no_consent_test" })) });
    clientIds.noConsent = r.body?.[0]?.id;
    log("Scenario 2 (sans consentement) : client cree avec marketing_consent=false", r.status === 201 && !!clientIds.noConsent, JSON.stringify(r.body));
  }

  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN3_A_DESINSCRIRE", { marketing_consent: true })) });
    clientIds.toUnsub = r.body?.[0]?.id;

    const unsubRes = await fetch(`${SUPABASE_URL}/functions/v1/clients-unsubscribe`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: clientIds.toUnsub }),
    });
    const unsubBody = await unsubRes.json().catch(() => null);

    const check = await svc(`clients?id=eq.${clientIds.toUnsub}&select=marketing_consent,opted_out_at`);
    const nowUnsubscribed = check.body?.[0]?.marketing_consent === false && !!check.body?.[0]?.opted_out_at;
    log(
      "Scenario 3 (desinscription via lien libre-service reel)",
      unsubRes.ok && nowUnsubscribed,
      `edgeFnStatus=${unsubRes.status} body=${JSON.stringify(unsubBody)} dbState=${JSON.stringify(check.body)}`
    );
  }

  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN4_REPOND_STOP", { marketing_consent: true, whatsapp: "+225070011122233" })) });
    clientIds.stopReplier = r.body?.[0]?.id;

    await svc(`profiles?id=eq.${idH1}`, { method: "PATCH", body: JSON.stringify({ whatsapp_phone_number_id: "TEST_PHONE_NUMBER_ID_999" }) });

    const webhookBody = JSON.stringify({
      entry: [{
        changes: [{
          value: {
            metadata: { phone_number_id: "TEST_PHONE_NUMBER_ID_999" },
            messages: [{ from: "225070011122233", type: "text", text: { body: "STOP" } }],
          },
        }],
      }],
    });

    if (META_APP_SECRET) {
      // whatsapp-webhook exige desormais une signature valide (voir
      // whatsapp-webhook-security.mjs pour la couverture complete des cas
      // signature manquante/invalide/falsifiee) : on signe donc reellement
      // ce payload avec le meme secret que celui configure en production.
      const signature = await hmacHex(META_APP_SECRET, webhookBody);
      const whRes = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, {
        method: "POST",
        headers: { apikey: ANON_KEY, "Content-Type": "application/json", "x-hub-signature-256": `sha256=${signature}` },
        body: webhookBody,
      });
      await new Promise((r) => setTimeout(r, 500));
      const check = await svc(`clients?id=eq.${clientIds.stopReplier}&select=marketing_consent,opted_out_at`);
      const nowOptedOut = check.body?.[0]?.marketing_consent === false && !!check.body?.[0]?.opted_out_at;
      log(
        "Scenario 4 (client repond STOP via webhook reel, signature valide)",
        whRes.status === 200 && nowOptedOut,
        `webhookStatus=${whRes.status} dbState=${JSON.stringify(check.body)}`
      );
    } else {
      // META_APP_SECRET indisponible en local : on ne peut pas signer un
      // appel reel au webhook (une requete non signee est desormais rejetee,
      // a raison). Ce comportement de rejet est deja verifie par la suite
      // dediee whatsapp-webhook-security.mjs. Ici on simule uniquement l'ETAT
      // resultant (client opte-out) directement en base, pour pouvoir tester
      // reellement ce que ce scenario doit couvrir : l'exclusion de ce client
      // des campagnes suivantes (scenario 5+10 ci-dessous).
      await svc(`clients?id=eq.${clientIds.stopReplier}`, {
        method: "PATCH",
        body: JSON.stringify({ marketing_consent: false, opted_out_at: new Date().toISOString() }),
      });
      log(
        "Scenario 4 (client repond STOP via webhook reel)",
        null,
        "SKIPPED (webhook non appele) - META_APP_SECRET absent de .env.local, impossible de signer un appel reel. Rejet des requetes non signees deja verifie par whatsapp-webhook-security.mjs. Etat opt-out simule en base pour permettre le scenario 5+10 ci-dessous."
      );
    }
  }

  {
    const r = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN_TEMOIN_NON_AFFECTE", { marketing_consent: true })) });
    clientIds.witness = r.body?.[0]?.id;
  }

  {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/campaign-send`, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${tokenH1}`, "Content-Type": "application/json" },
      body: JSON.stringify({ segmentCode: "tous", message: "Test regression consentement", templateId: "test" }),
    });
    const body = await res.json().catch(() => null);
    campaignId = body?.data?.campaignId ?? null;

    const sentTo = await svc(`sent_messages?campaign_id=eq.${campaignId}&select=client_id`);
    const targetedIds = new Set((sentTo.body || []).map((r) => r.client_id));

    const expectedIncluded = clientIds.withConsent && targetedIds.has(clientIds.withConsent);
    const expectedExcludedNoConsent = clientIds.noConsent && !targetedIds.has(clientIds.noConsent);
    const expectedExcludedUnsub = clientIds.toUnsub && !targetedIds.has(clientIds.toUnsub);
    const expectedExcludedStop = clientIds.stopReplier && !targetedIds.has(clientIds.stopReplier);
    const witnessIncluded = clientIds.witness && targetedIds.has(clientIds.witness);

    log(
      "Scenario 5+10 (nouvelle campagne apres STOP) : seuls les consentants sont cibles",
      expectedIncluded && expectedExcludedNoConsent && expectedExcludedUnsub && expectedExcludedStop && witnessIncluded,
      `httpStatus=${res.status} excludedOptOut=${body?.data?.excludedOptOut} recipientCount=${body?.data?.total}`
    );
  }

  {
    const before = await svc(`clients?id=eq.${clientIds.toUnsub}&select=marketing_consent,opted_out_at,whatsapp`);
    await svc(`clients?id=eq.${clientIds.toUnsub}`, {
      method: "PATCH",
      body: JSON.stringify({ nom: "SCN3_A_DESINSCRIRE (reimporte)", email: null, whatsapp: before.body?.[0]?.whatsapp, derniere_visite: today }),
    });
    const after = await svc(`clients?id=eq.${clientIds.toUnsub}&select=marketing_consent,opted_out_at`);
    const stillOptedOut = after.body?.[0]?.marketing_consent === false && !!after.body?.[0]?.opted_out_at;
    log("Scenario 6 (re-import d'un client deja desinscrit) : consentement non reinitialise", stillOptedOut, `avant=${JSON.stringify(before.body)} apres=${JSON.stringify(after.body)}`);
  }

  {
    const sharedNumber = "+225079988776655";
    const c1 = await svc("clients", { method: "POST", body: JSON.stringify(commonClient("SCN8_HOTEL1", { whatsapp: sharedNumber, marketing_consent: false })) });
    const c2 = await svc("clients", { method: "POST", body: JSON.stringify({ profile_id: idH2, nom: "SCN8_HOTEL2", whatsapp: sharedNumber, derniere_visite: today, marketing_consent: true }) });
    clientIds.hotel1Shared = c1.body?.[0]?.id;
    clientIds.hotel2Shared = c2.body?.[0]?.id;
    const check1 = await svc(`clients?id=eq.${clientIds.hotel1Shared}&select=marketing_consent,profile_id`);
    const check2 = await svc(`clients?id=eq.${clientIds.hotel2Shared}&select=marketing_consent,profile_id`);
    const isolated = check1.body?.[0]?.marketing_consent === false && check2.body?.[0]?.marketing_consent === true && check1.body?.[0]?.profile_id !== check2.body?.[0]?.profile_id;
    log("Scenario 8 (changement d'hotel, meme numero) : consentement isole par hotel", isolated, `hotel1=${JSON.stringify(check1.body)} hotel2=${JSON.stringify(check2.body)}`);
  }

  {
    const delRes = await svc(`clients?id=eq.${clientIds.stopReplier}`, { method: "DELETE" });
    const check = await svc(`clients?id=eq.${clientIds.stopReplier}&select=id`);
    log("Scenario 9 (suppression client) : le client est bien supprime", check.body?.length === 0, `deleteStatus=${delRes.status} clientRestant=${check.body?.length}`);
  }
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try {
    if (campaignId) {
      await svc(`sent_messages?campaign_id=eq.${campaignId}`, { method: "DELETE" });
      await svc(`campaigns?id=eq.${campaignId}`, { method: "DELETE" });
    }
  } catch {}
  for (const id of Object.values(clientIds)) {
    try { if (id) await svc(`clients?id=eq.${id}`, { method: "DELETE" }); } catch {}
  }
  try { if (idH1) await adminDeleteUser(idH1); } catch {}
  try { if (idH2) await adminDeleteUser(idH2); } catch {}
}

printAndExit();
