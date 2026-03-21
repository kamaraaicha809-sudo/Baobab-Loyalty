/**
 * Réservations - Données pour le graphique de performance
 */

import { createClient } from "@/libs/supabase/client";

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

export const reservations = { getReservationsChart, getReservationsTodayCount, getReservationsFromAppCount };
