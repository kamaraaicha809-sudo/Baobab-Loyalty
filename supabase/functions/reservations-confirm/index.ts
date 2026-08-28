/**
 * reservations-confirm
 * Confirme ou annule une réservation en attente (status = pending_validation),
 * et enregistre le montant réel côté hôtelier. C'est le seul endroit qui
 * fait passer reservations.montant_fcfa de 0 à une vraie valeur.
 *
 * Auth: Required (JWT) — bypassed in DEMO_MODE
 * Method: POST
 * Body: { reservationId, action: "confirm" | "cancel", montantFcfa? }
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";
import { logAudit } from "../_shared/audit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("Indisponible en mode démo.");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Auth required");

    const { profile } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");

    const body = await req.json();
    const reservationId = typeof body.reservationId === "string" ? body.reservationId : null;
    const action = body.action;
    const montantFcfa = body.montantFcfa;

    if (!reservationId || (action !== "confirm" && action !== "cancel")) {
      return errors.badRequest("reservationId et action (confirm|cancel) sont requis.");
    }
    if (action === "confirm") {
      if (typeof montantFcfa !== "number" || !Number.isFinite(montantFcfa) || montantFcfa < 0) {
        return errors.badRequest("montantFcfa doit être un nombre positif ou nul.");
      }
    }

    const db = getServiceClient();

    // On vérifie l'appartenance à l'hôtel avant toute écriture : sans ce
    // contrôle, un hôtel connecté pourrait confirmer/annuler la réservation
    // d'un autre hôtel en devinant un reservationId.
    const { data: reservation, error: fetchError } = await db
      .from("reservations")
      .select("id, profile_id, status, redemption_id, client_id, check_in_date")
      .eq("id", reservationId)
      .single();

    if (fetchError || !reservation) return errors.notFound("Réservation introuvable.");
    if (reservation.profile_id !== profile.id) {
      return errors.forbidden("Cette réservation n'appartient pas à votre hôtel.");
    }
    if (reservation.status !== "pending_validation") {
      return errors.badRequest("Cette réservation a déjà été traitée.");
    }

    const newStatus = action === "confirm" ? "confirmed" : "cancelled";
    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (action === "confirm") {
      updatePayload.montant_fcfa = montantFcfa;
      updatePayload.confirmed_at = new Date().toISOString();
    }

    const { error: updateError } = await db
      .from("reservations")
      .update(updatePayload)
      .eq("id", reservationId);
    if (updateError) return errors.internal(updateError.message);

    // Répercute sur la redemption liée (visibilité du funnel campagne ->
    // réservation) : une réservation annulée ne doit pas rester comptée
    // comme "booked" dans les statistiques de conversion.
    if (reservation.redemption_id) {
      await db
        .from("redemptions")
        .update({ status: action === "confirm" ? "booked" : "cancelled" })
        .eq("id", reservation.redemption_id);
    }

    // Met à jour les critères de segmentation dérivés des réservations
    // Baobab (P5). type_chambre_preferee et saison_habituelle n'apparaissent
    // pas ici : ce formulaire /offre ne collecte ni le type de chambre ni la
    // saison, seul l'import CSV peut renseigner ces deux champs.
    if (action === "confirm" && reservation.client_id) {
      const { data: client } = await db
        .from("clients")
        .select("nombre_reservations, montant_total_depense")
        .eq("id", reservation.client_id)
        .maybeSingle();
      if (client) {
        await db
          .from("clients")
          .update({
            nombre_reservations: (client.nombre_reservations ?? 0) + 1,
            montant_total_depense: (client.montant_total_depense ?? 0) + montantFcfa,
            derniere_visite: reservation.check_in_date ?? new Date().toISOString().split("T")[0],
          })
          .eq("id", reservation.client_id);
      }
    }

    await logAudit(db, {
      profileId: profile.id,
      actorUserId: user.id,
      action: action === "confirm" ? "reservation_confirmed" : "reservation_cancelled",
      details: { reservationId, montantFcfa: action === "confirm" ? montantFcfa : undefined },
    });

    return success({ id: reservationId, status: newStatus });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
