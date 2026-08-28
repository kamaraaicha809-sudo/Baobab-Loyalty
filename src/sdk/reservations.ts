/**
 * Réservations - Données pour le graphique de performance
 */

import { createClient } from "@/libs/supabase/client";
import { callEdgeFunction } from "./_core";

export interface ChartDay {
  jour: string;
  directes: number;
  autres: number;
}

/**
 * Récupère les données de réservations par jour (LUN-DIM) pour la semaine en cours.
 * Utilise la fonction SQL optimisée get_reservations_chart.
 */
export async function getReservationsChart(profileId: string): Promise<ChartDay[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_reservations_chart", {
    p_profile_id: profileId,
  });
  if (error) throw error;
  return (data ?? []) as ChartDay[];
}

/**
 * Compte le nombre total de réservations via Baobab Loyalty pour aujourd'hui.
 * Sert pour la carte "Impact global".
 */
export async function getReservationsTodayCount(profileId: string): Promise<number> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("reservation_date", today);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Compte le nombre total de réservations obtenues via l'application (source baobab).
 */
export async function getReservationsFromAppCount(profileId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .or("source.eq.baobab,source.is.null");

  if (error) {
    if (error.message?.includes("column") && error.message?.includes("source")) {
      const { count: c } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId);
      return c ?? 0;
    }
    throw error;
  }
  return count ?? 0;
}

export interface RevenueGenerated {
  total: number;
  hasConfirmedRevenueEver: boolean;
}

/**
 * Somme des revenus (montant_fcfa) des réservations obtenues via Baobab sur
 * les `days` derniers jours. `hasConfirmedRevenueEver` distingue "0 FCFA
 * généré récemment" (donnée réelle) de "aucune réservation n'a jamais eu de
 * montant confirmé" (fonctionnalité de confirmation du montant pas encore
 * utilisée) — l'UI doit afficher ces deux cas différemment pour ne jamais
 * laisser croire à un chiffre fictif.
 */
export async function getRevenueGenerated(profileId: string, days = 3): Promise<RevenueGenerated> {
  const supabase = createClient();
  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: recentRows, error: recentError } = await supabase
    .from("reservations")
    .select("montant_fcfa")
    .eq("profile_id", profileId)
    .or("source.eq.baobab,source.is.null")
    .gte("reservation_date", sinceDate);
  if (recentError) throw recentError;

  const total = (recentRows ?? []).reduce((sum, r) => sum + (r.montant_fcfa || 0), 0);

  const { count: everCount, error: everError } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .gt("montant_fcfa", 0);
  if (everError) throw everError;

  return { total, hasConfirmedRevenueEver: (everCount ?? 0) > 0 };
}

export interface PendingReservation {
  id: string;
  client_name: string | null;
  client_phone: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  nights: number | null;
  created_at: string;
}

/**
 * Réservations en attente de validation par l'hôtelier (créées via /offre).
 */
export async function getPendingReservations(profileId: string): Promise<PendingReservation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("id, client_name, client_phone, check_in_date, check_out_date, nights, created_at")
    .eq("profile_id", profileId)
    .eq("status", "pending_validation")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PendingReservation[];
}

export interface ConfirmReservationResult {
  id: string;
  status: string;
}

/**
 * Confirme une réservation en attente et enregistre le montant réel (FCFA).
 * C'est le seul endroit du produit qui fait passer montant_fcfa de 0 à une
 * vraie valeur — sans ça, le CA affiché au dashboard reste "Bientôt disponible".
 */
export async function confirmReservation(reservationId: string, montantFcfa: number): Promise<ConfirmReservationResult> {
  return callEdgeFunction<ConfirmReservationResult>("reservations-confirm", {
    body: { reservationId, action: "confirm", montantFcfa },
  });
}

export async function cancelReservation(reservationId: string): Promise<ConfirmReservationResult> {
  return callEdgeFunction<ConfirmReservationResult>("reservations-confirm", {
    body: { reservationId, action: "cancel" },
  });
}

export interface RecentActivityItem {
  id: string;
  client_name: string | null;
  hotel_name: string | null;
  offer_name: string | null;
  confirmed_at: string;
}

/**
 * Dernières réservations réellement confirmées par l'hôtelier, pour le
 * widget "Flux en direct" du dashboard. Tant que cette liste est vide
 * (aucune confirmation encore faite), l'UI affiche un exemple à la place.
 */
export async function getRecentActivity(profileId: string, limit = 5): Promise<RecentActivityItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("id, client_name, hotel_name, confirmed_at, offers(name)")
    .eq("profile_id", profileId)
    .eq("status", "confirmed")
    .not("confirmed_at", "is", null)
    .order("confirmed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => {
    const offer = row.offers as unknown as { name: string } | { name: string }[] | null;
    const offerName = Array.isArray(offer) ? offer[0]?.name ?? null : offer?.name ?? null;
    return {
      id: row.id,
      client_name: row.client_name,
      hotel_name: row.hotel_name,
      offer_name: offerName,
      confirmed_at: row.confirmed_at as string,
    };
  });
}

export const reservations = {
  getReservationsChart,
  getReservationsTodayCount,
  getReservationsFromAppCount,
  getRevenueGenerated,
  getPendingReservations,
  confirmReservation,
  cancelReservation,
  getRecentActivity,
};
