/**
 * Réservations - Données pour le graphique de performance
 */

import { createClient } from "@/libs/supabase/client";

export interface ChartDay {
  jour: string;
  directes: number;
  autres: number;
}

const JOURS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;

/**
 * Récupère les données de réservations par jour (LUN-DIM) pour la semaine en cours.
 * Agrège les réservations directes vs autres par jour.
 */
export async function getReservationsChart(profileId: string): Promise<ChartDay[]> {
  const supabase = createClient();

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("reservations")
    .select("reservation_date, type_reservation")
    .eq("profile_id", profileId)
    .gte("reservation_date", monday.toISOString().split("T")[0])
    .lte("reservation_date", sunday.toISOString().split("T")[0]);

  if (error) throw error;

  const byDay: Record<number, { directes: number; autres: number }> = {};
  for (let i = 0; i < 7; i++) {
    byDay[i] = { directes: 0, autres: 0 };
  }

  (data || []).forEach((r) => {
    const d = new Date(r.reservation_date + "T12:00:00");
    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    if (r.type_reservation === "directe") {
      byDay[idx].directes += 1;
    } else {
      byDay[idx].autres += 1;
    }
  });

  return JOURS.map((jour, i) => ({
    jour,
    directes: byDay[i].directes,
    autres: byDay[i].autres,
  }));
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
