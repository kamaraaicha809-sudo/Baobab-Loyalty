/**
 * Funnel campagne -> revenu : taux de réponse, taux de conversion, nuits
 * récupérées, CA généré et ROI, calculés à partir de données réelles
 * (sent_messages, redemptions, reservations). Voir supabase/functions/_shared/plan.ts
 * pour la version Edge Function de PLAN_PRICES_XOF — les deux doivent rester
 * synchronisées avec config.js (billing.plans).
 */

import { createClient } from "@/libs/supabase/client";

const PLAN_PRICES_XOF: Record<string, number> = {
  starter: 39000,
  pro: 69000,
  premium: 189000,
  essentiel: 39000,
  croissance: 69000,
};

export interface CampaignFunnelStats {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  responses: number;
  reservationsBooked: number;
  nightsRecovered: number;
  revenueGenerated: number;
  responseRate: number | null;
  conversionRate: number | null;
  planCostFcfa: number | null;
  roiFcfa: number | null;
}

export async function getCampaignFunnelStats(profileId: string, days = 30): Promise<CampaignFunnelStats> {
  const supabase = createClient();
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: messages }, { data: redemptions }, { data: reservationRows }, { data: profileRow }] = await Promise.all([
    supabase.from("sent_messages").select("status").eq("profile_id", profileId).gte("sent_at", sinceIso),
    supabase.from("redemptions").select("status").eq("profile_id", profileId).gte("redemption_date", sinceIso),
    supabase
      .from("reservations")
      .select("nights, montant_fcfa")
      .eq("profile_id", profileId)
      .eq("status", "confirmed")
      .not("redemption_id", "is", null)
      .gte("created_at", sinceIso),
    supabase.from("profiles").select("price_id").eq("id", profileId).maybeSingle(),
  ]);

  const messagesSent = messages?.length ?? 0;
  const messagesDelivered = (messages ?? []).filter((m) => m.status === "delivered" || m.status === "read").length;
  const messagesRead = (messages ?? []).filter((m) => m.status === "read").length;

  // Une ligne redemption existe dès le premier clic (voir /api/offre/track-click) :
  // sa seule présence vaut "réponse", quel que soit son statut final.
  const responses = (redemptions ?? []).length;
  const reservationsBooked = (redemptions ?? []).filter((r) => r.status === "booked").length;

  const nightsRecovered = (reservationRows ?? []).reduce((sum, r) => sum + (r.nights || 0), 0);
  const revenueGenerated = (reservationRows ?? []).reduce((sum, r) => sum + (r.montant_fcfa || 0), 0);

  const responseRate = messagesDelivered > 0 ? responses / messagesDelivered : null;
  const conversionRate = messagesDelivered > 0 ? reservationsBooked / messagesDelivered : null;

  const planSlug = profileRow?.price_id?.toLowerCase();
  const planCostFcfa = planSlug && PLAN_PRICES_XOF[planSlug] != null ? PLAN_PRICES_XOF[planSlug] : null;
  const roiFcfa = planCostFcfa != null ? revenueGenerated - planCostFcfa : null;

  return {
    messagesSent,
    messagesDelivered,
    messagesRead,
    responses,
    reservationsBooked,
    nightsRecovered,
    revenueGenerated,
    responseRate,
    conversionRate,
    planCostFcfa,
    roiFcfa,
  };
}

export const funnel = { getCampaignFunnelStats };
