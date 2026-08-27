// Suite de regression RLS / multi-tenant / IDOR.
//
// Cree 2 comptes hoteliers jetables en production, tente 8 acces croises
// (SELECT/UPDATE/DELETE/INSERT/RPC de l'hotel B sur les donnees de l'hotel A,
// et en anonyme pur), et verifie qu'aucun ne passe. Nettoie tout ensuite.
//
// A relancer avant toute release qui touche : policies RLS, is_team_member/
// is_team_admin, les Edge Functions qui derivent profile_id, ou les RPC
// get_segment_counts/get_reservations_chart.
//
// Usage : node scripts/regression-tests/rls-multitenant.mjs

import { svc, restAs, adminCreateUser, adminDeleteUser, signIn, makeReporter, SUPABASE_URL, ANON_KEY } from "./_shared.mjs";

const { log, printAndExit } = makeReporter();

const stamp = Date.now();
const emailA = `regression-rls-a-${stamp}@baobabloyalty.com`;
const emailB = `regression-rls-b-${stamp}@baobabloyalty.com`;
const password = `Reg1!Test#${stamp}`;

let idA, idB, tokenA, tokenB, clientAId;

try {
  idA = await adminCreateUser(emailA, password);
  idB = await adminCreateUser(emailB, password);
  tokenA = await signIn(emailA, password);
  tokenB = await signIn(emailB, password);
  log("Setup : creation + connexion de 2 comptes de test", true, `A=${idA.slice(0, 8)}... B=${idB.slice(0, 8)}...`);

  const profA = await svc(`profiles?id=eq.${idA}&select=id,hotel_name`);
  log("Setup : profil A auto-cree par le trigger handle_new_user", profA.status === 200 && profA.body.length === 1, JSON.stringify(profA.body));

  const insertClientA = await svc("clients", {
    method: "POST",
    body: JSON.stringify({ profile_id: idA, nom: "REGRESSION_TEST_CLIENT_A", derniere_visite: new Date().toISOString().split("T")[0], whatsapp: "+2250700000001" }),
  });
  clientAId = insertClientA.body?.[0]?.id;
  log("Setup : client de test cree pour l'hotel A", insertClientA.status === 201 && !!clientAId, JSON.stringify(insertClientA.body));

  const t1 = await restAs(tokenB, `clients?profile_id=eq.${idA}&select=id,nom`);
  log("IDOR clients (filtre explicite sur profile A)", t1.status === 200 && Array.isArray(t1.body) && t1.body.length === 0, `status=${t1.status} body=${JSON.stringify(t1.body)}`);

  const t2 = await restAs(tokenB, `clients?select=id,nom`);
  const leaksA = Array.isArray(t2.body) && t2.body.some((c) => c.id === clientAId);
  log("IDOR clients (liste complete sans filtre)", t2.status === 200 && !leaksA, `status=${t2.status} count=${Array.isArray(t2.body) ? t2.body.length : "n/a"} leaksA=${leaksA}`);

  const t3 = await restAs(tokenB, `clients?id=eq.${clientAId}`, { method: "PATCH", body: JSON.stringify({ nom: "HACKED_BY_B" }) });
  const t3check = await svc(`clients?id=eq.${clientAId}&select=nom`);
  const stillIntact = t3check.body?.[0]?.nom === "REGRESSION_TEST_CLIENT_A";
  log("IDOR clients (tentative UPDATE croise)", stillIntact, `patchStatus=${t3.status} nomApres=${t3check.body?.[0]?.nom}`);

  const t4 = await restAs(tokenB, `clients?id=eq.${clientAId}`, { method: "DELETE" });
  const t4check = await svc(`clients?id=eq.${clientAId}&select=id`);
  const stillExists = t4check.body?.length === 1;
  log("IDOR clients (tentative DELETE croise)", stillExists, `deleteStatus=${t4.status} existsApres=${stillExists}`);

  const t5 = await restAs(tokenB, "rpc/get_segment_counts", { method: "POST", body: JSON.stringify({ p_profile_id: idA }) });
  log("IDOR RPC get_segment_counts (JWT de B, profile_id de A)", t5.status >= 400, `status=${t5.status} body=${JSON.stringify(t5.body)}`);

  const t6res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_segment_counts`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_profile_id: idA }),
  });
  const t6body = await t6res.json().catch(() => null);
  log("IDOR RPC get_segment_counts (anonyme total)", t6res.status >= 400, `status=${t6res.status} body=${JSON.stringify(t6body)}`);

  const t7 = await restAs(tokenB, `profiles?id=eq.${idA}&select=id,hotel_name,email`);
  log("IDOR profiles (lecture profil A par B)", t7.status === 200 && t7.body.length === 0, `status=${t7.status} body=${JSON.stringify(t7.body)}`);

  const t8 = await restAs(tokenB, "campaigns", { method: "POST", body: JSON.stringify({ profile_id: idA, name: "hack", segment_code: "tous", status: "draft", recipient_count: 0 }) });
  log("IDOR campaigns (INSERT croise pour profile A)", t8.status >= 400, `status=${t8.status} body=${JSON.stringify(t8.body)}`);
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
} finally {
  try { if (clientAId) await svc(`clients?id=eq.${clientAId}`, { method: "DELETE" }); } catch {}
  try { if (idA) await adminDeleteUser(idA); } catch {}
  try { if (idB) await adminDeleteUser(idB); } catch {}
}

printAndExit();
