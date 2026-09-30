// Suite de regression : notification "Nouvelle reservation" du dashboard
// (Afrique).
//
// Verifie en conditions reelles (vrai projet Supabase Afrique, vraie API /offre
// en production, vraie Edge Function reservations-confirm, vrai flux Realtime
// ouvert avec le JWT d'un hotel) que la regle isRecoveredReservation() utilisee
// par le dashboard ne retient QUE la confirmation d'une reservation venue d'un
// lien de campagne :
//   1. la demande creee via /offre (en attente) ne declenche rien
//   2. sa confirmation par l'hotel declenche exactement une notification
//   3. une reservation d'une autre origine, confirmee, ne declenche rien
//   4. une ancienne confirmation modifiee plus tard ne declenche rien
//   5. un hotel ne recoit jamais les changements d'un autre hotel (RLS), meme
//      en visant son identifiant dans le filtre
//
// Aucun email ni message WhatsApp n'est envoye : les hotels de test n'ont ni
// email ni WhatsApp de reception.
//
// Usage : node scripts/regression-tests/recovered-reservation-notification.mjs

import { createClient } from "@supabase/supabase-js";
import { svc, adminCreateUser, adminDeleteUser, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";
import { isRecoveredReservation } from "../../src/lib/recovered-reservation.ts";

const SITE = process.env.SITE_BASE_URL || "https://baobabloyalty.com";
const { log, printAndExit } = makeReporter();

const stamp = Date.now();
const emailA = `regression-notif-a-${stamp}@baobabloyalty.com`;
const emailB = `regression-notif-b-${stamp}@baobabloyalty.com`;
const password = `Reg1!Notif#${stamp}`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(predicate, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await wait(200);
  }
  return false;
}

async function signedInClient(email) {
  const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  client.realtime.setAuth(data.session.access_token);
  return { client, token: data.session.access_token };
}

// Meme abonnement que ReservationNotifier : tous les changements de
// reservations filtres sur un profile_id.
function listen(client, name, profileId) {
  const events = [];
  return new Promise((resolve, reject) => {
    const channel = client
      .channel(name)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations", filter: `profile_id=eq.${profileId}` },
        (payload) => events.push(payload)
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") resolve({ channel, events });
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reject(err ?? new Error(status));
      });
  });
}

async function bookViaOffer(profileId, clientName) {
  const res = await fetch(`${SITE}/api/reservations/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_id: profileId, client_name: clientName, nights: 1 }),
  });
  const found = await svc(`reservations?profile_id=eq.${profileId}&client_name=eq.${clientName}&select=id,status,source`);
  return { status: res.status, row: found.body?.[0] };
}

async function confirm(token, reservationId) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/reservations-confirm`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reservationId, action: "confirm", montantFcfa: 45000 }),
  });
  return res.status;
}

const notificationsFor = (events, id) => events.filter((e) => e.new?.id === id && isRecoveredReservation(e.new)).length;

let idA, idB, hotelA, hotelB;

try {
  idA = await adminCreateUser(emailA, password);
  idB = await adminCreateUser(emailB, password);
  await wait(800);
  hotelA = await signedInClient(emailA);
  hotelB = await signedInClient(emailB);

  const own = await listen(hotelA.client, "a-own", idA);
  const spy = await listen(hotelA.client, "a-spy-b", idB);
  const bOwn = await listen(hotelB.client, "b-own", idB);
  await wait(2000);

  // 1. Demande via le lien de campagne : en attente, aucune notification.
  const booking = await bookViaOffer(idA, "REGRESSION_NOTIF_A");
  const bookingId = booking.row?.id;
  const insertSeen = await waitFor(() => own.events.some((e) => e.eventType === "INSERT" && e.new?.id === bookingId));
  log(
    "1. Demande via /offre (en attente) : aucune notification",
    booking.status === 200 && booking.row?.status === "pending_validation" && booking.row?.source === "baobab"
      && insertSeen && notificationsFor(own.events, bookingId) === 0,
    `api=${booking.status} ligne=${JSON.stringify(booking.row)} insertRecu=${insertSeen}`
  );

  // 2. Confirmation par l'hotel : exactement une notification.
  const confirmStatus = await confirm(hotelA.token, bookingId);
  const confirmedSeen = await waitFor(() => notificationsFor(own.events, bookingId) > 0);
  await wait(1500);
  log(
    "2. Confirmation par l'hotel : une seule notification",
    confirmStatus === 200 && confirmedSeen && notificationsFor(own.events, bookingId) === 1,
    `confirm=${confirmStatus} notifications=${notificationsFor(own.events, bookingId)}`
  );

  // 3. Reservation d'une autre origine (import), confirmee : rien.
  const today = new Date().toISOString().split("T")[0];
  const other = await svc("reservations", {
    method: "POST",
    body: JSON.stringify({
      profile_id: idA, reservation_date: today, check_in_date: today, check_out_date: today,
      type_reservation: "directe", montant_fcfa: 0, status: "pending_validation", source: "import",
      client_name: "REGRESSION_NOTIF_IMPORT",
    }),
  });
  const otherId = other.body?.[0]?.id;
  const otherConfirm = await confirm(hotelA.token, otherId);
  const otherSeen = await waitFor(() => own.events.some((e) => e.new?.id === otherId && e.new?.status === "confirmed"));
  log(
    "3. Reservation importee puis confirmee : aucune notification",
    other.status === 201 && otherConfirm === 200 && otherSeen && notificationsFor(own.events, otherId) === 0,
    `insert=${other.status} confirm=${otherConfirm} majRecue=${otherSeen}`
  );

  // 4. Ancienne confirmation modifiee plus tard (montant corrige) : rien.
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  await svc(`reservations?id=eq.${bookingId}`, { method: "PATCH", body: JSON.stringify({ confirmed_at: twoHoursAgo }) });
  const before = own.events.length;
  await svc(`reservations?id=eq.${bookingId}`, { method: "PATCH", body: JSON.stringify({ montant_fcfa: 50000 }) });
  const lateSeen = await waitFor(() => own.events.slice(before).some((e) => e.new?.montant_fcfa === 50000));
  const lateEvent = own.events.slice(before).find((e) => e.new?.montant_fcfa === 50000);
  log(
    "4. Ancienne confirmation modifiee plus tard : aucune notification",
    lateSeen && lateEvent && !isRecoveredReservation(lateEvent.new),
    `majRecue=${lateSeen}`
  );

  // 5. Isolation : l'hotel A ne voit jamais les reservations de B.
  const bookingB = await bookViaOffer(idB, "REGRESSION_NOTIF_B");
  const bConfirm = await confirm(hotelB.token, bookingB.row?.id);
  const bSaw = await waitFor(() => notificationsFor(bOwn.events, bookingB.row?.id) === 1);
  await wait(2000);
  log(
    "5. Un hotel ne recoit jamais les reservations d'un autre (RLS)",
    bookingB.status === 200 && bConfirm === 200 && bSaw && spy.events.length === 0,
    `B_notifie=${bSaw} evenementsVusParA=${spy.events.length}`
  );
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  for (const h of [hotelA, hotelB]) {
    try { await h?.client.removeAllChannels(); } catch {}
  }
  for (const id of [idA, idB]) {
    try { if (id) await svc(`reservations?profile_id=eq.${id}`, { method: "DELETE" }); } catch {}
    try { if (id) await adminDeleteUser(id); } catch {}
  }
}

printAndExit();
process.exit();
