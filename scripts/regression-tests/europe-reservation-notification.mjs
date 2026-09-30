// Suite de regression Europe (Loyavia) : notification "nouvelle reservation"
// du dashboard (components/dashboard/ReservationNotifier.tsx).
//
// Verifie en conditions reelles (vrai projet Supabase Europe, vrai JWT, RLS
// et Realtime actifs) que l'abonnement du dashboard recoit bien les
// changements de reservations et que la regle reelle
// (src/lib/reservation-notification.ts, compilee a la volee) ne notifie que
// les demandes issues d'une campagne :
//   - la creation par /offre (INSERT sans offre) ne notifie pas encore ;
//   - l'attribution a la campagne (UPDATE offer_id/redemption_id) notifie ;
//   - une reservation importee, une confirmation, ou une ancienne
//     reservation modifiee ne notifient jamais ;
//   - un hotel ne recoit jamais les reservations d'un autre hotel.
//
// Usage : node scripts/regression-tests/europe-reservation-notification.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";
import { svc, adminCreateUser, adminDeleteUser, signIn, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared_europe.mjs";

const { log, printAndExit } = makeReporter();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, ".europe-sdk-build");

async function loadRule() {
  fs.mkdirSync(buildDir, { recursive: true });
  const src = fs.readFileSync(path.resolve(__dirname, "../../src/lib/reservation-notification.ts"), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(buildDir, "reservation-notification.mjs"), js);
  return import(pathToFileURL(path.join(buildDir, "reservation-notification.mjs")).href);
}

const stamp = Date.now();
const emailA = `regression-eu-notif-a-${stamp}@loyavia.com`;
const emailB = `regression-eu-notif-b-${stamp}@loyavia.com`;
const password = `Reg1!EuNotif#${stamp}`;
const today = new Date().toISOString().split("T")[0];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let idA, idB, channel, realtime;
const received = [];

const insertReservation = async (profileId, extra = {}) => {
  const r = await svc("reservations", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId, reservation_date: today, type_reservation: "directe", status: "pending_validation", source: "baobab", ...extra }),
  });
  if (r.status !== 201) throw new Error(`insert reservation: ${r.status} ${JSON.stringify(r.body)}`);
  return r.body[0].id;
};
const updateReservation = (id, patch) => svc(`reservations?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(patch) });
const eventsFor = (id) => received.filter((p) => p.new?.id === id);

async function subscribeAs(token, profileId) {
  realtime = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  await realtime.realtime.setAuth(token);
  await new Promise((resolve, reject) => {
    channel = realtime
      .channel("reservation-notifier-test")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `profile_id=eq.${profileId}` }, (p) => received.push(p))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reject(new Error(`realtime: ${status}`));
      });
  });
  await wait(1500);
}

async function run(isCampaignReservation) {
  const offer = await svc("offers", { method: "POST", body: JSON.stringify({ profile_id: idA, name: "Offre test notification", type: "remise" }) });
  if (offer.status !== 201) throw new Error(`insert offer: ${offer.status} ${JSON.stringify(offer.body)}`);
  const offerId = offer.body[0].id;

  // 1-2. Parcours reel de /offre : INSERT sans offre, puis attribution.
  const r1 = await insertReservation(idA);
  await wait(2500);
  const insertEvents = eventsFor(r1);
  log("NOTIF 1 : la creation de la demande arrive en direct au dashboard", insertEvents.some((p) => p.eventType === "INSERT"), `${insertEvents.length} evenement(s)`);
  log("NOTIF 2 : demande pas encore attribuee -> pas de notification", insertEvents.every((p) => !isCampaignReservation(p.new)), JSON.stringify(insertEvents.map((p) => p.new)));

  await updateReservation(r1, { offer_id: offerId });
  await wait(2500);
  const updateEvents = eventsFor(r1).filter((p) => p.eventType === "UPDATE");
  log("NOTIF 3 : attribution a la campagne -> notification", updateEvents.some((p) => isCampaignReservation(p.new)), JSON.stringify(updateEvents.map((p) => p.new)));

  // 4. Confirmation par l'hotelier : aucune nouvelle notification.
  await updateReservation(r1, { status: "confirmed", confirmed_at: new Date().toISOString() });
  await wait(2500);
  const last = eventsFor(r1).at(-1);
  log("NOTIF 4 : confirmation par l'hotel -> pas de notification", last?.new?.status === "confirmed" && !isCampaignReservation(last.new), JSON.stringify(last?.new));

  // 5. Reservation hors campagne (import) meme avec une offre.
  const r2 = await insertReservation(idA, { source: "import", offer_id: offerId });
  await wait(2500);
  const r2Events = eventsFor(r2);
  log("NOTIF 5 : reservation importee -> pas de notification", r2Events.length > 0 && r2Events.every((p) => !isCampaignReservation(p.new)), JSON.stringify(r2Events.map((p) => p.new?.source)));

  // 6. Ancienne demande modifiee (actualisation, correction) : pas de notification.
  const r3 = await insertReservation(idA, { created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() });
  await updateReservation(r3, { offer_id: offerId });
  await wait(2500);
  const r3Events = eventsFor(r3);
  log("NOTIF 6 : ancienne demande modifiee -> pas de notification", r3Events.length > 0 && r3Events.every((p) => !isCampaignReservation(p.new)), `${r3Events.length} evenement(s)`);

  // 7. Isolation : une reservation d'un autre hotel n'arrive jamais.
  const other = await insertReservation(idB);
  await updateReservation(other, { redemption_id: null, offer_id: null });
  await wait(2500);
  log("NOTIF 7 : les reservations d'un autre hotel n'arrivent jamais", eventsFor(other).length === 0, `${eventsFor(other).length} evenement(s)`);
}

try {
  const { isCampaignReservation } = await loadRule();
  idA = await adminCreateUser(emailA, password);
  idB = await adminCreateUser(emailB, password);
  const tokenA = await signIn(emailA, password);
  await wait(800);
  await subscribeAs(tokenA, idA);
  await run(isCampaignReservation);
} catch (err) {
  log("EXECUTION", false, String(err?.message ?? err));
} finally {
  try { if (channel) await realtime.removeChannel(channel); } catch {}
  for (const id of [idA, idB]) {
    if (!id) continue;
    try { await svc(`reservations?profile_id=eq.${id}`, { method: "DELETE" }); } catch {}
    try { await svc(`offers?profile_id=eq.${id}`, { method: "DELETE" }); } catch {}
    try { await adminDeleteUser(id); } catch {}
  }
  fs.rmSync(buildDir, { recursive: true, force: true });
}

printAndExit();
process.exit(process.exitCode ?? 0);
