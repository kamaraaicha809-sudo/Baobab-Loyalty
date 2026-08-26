/**
 * Campaigns SDK — envoi de campagnes WhatsApp
 */

import { callEdgeFunction } from "./_core";
import { createClient } from "@/libs/supabase/client";

export interface SendCampaignParams {
  segmentCode: string;
  message: string;
  templateId: string;
  avantage?: string;
  customMonths?: number;
  // Filtres combinables (P5), en plus du segment de base
  minMontantDepense?: number;
  minNombreReservations?: number;
  typeChambreContains?: string;
  saisonContains?: string;
}

export interface SendCampaignResult {
  sent: number;
  failed: number;
  total: number;
  campaignId: string | null;
  excludedOptOut?: number;
}

export async function sendCampaign(params: SendCampaignParams): Promise<SendCampaignResult> {
  return callEdgeFunction<SendCampaignResult>("campaign-send", { body: params });
}

export interface RecentCampaign {
  id: string;
  name: string | null;
  segment_code: string;
  status: string;
  recipient_count: number;
  started_at: string;
  bookedCount: number;
  responsesCount: number;
  nightsRecovered: number;
  revenueFcfa: number;
}

/**
 * Dernières campagnes réelles avec, par campagne, le nombre de réponses
 * (clics sur le lien /offre), de réservations confirmées, de nuits et de CA
 * généré — calculé via sent_messages -> redemptions -> reservations, jamais
 * une estimation. Le CA n'inclut que les réservations confirmées par
 * l'hôtelier (montant_fcfa réel, voir reservations-confirm).
 */
export async function listRecentCampaigns(profileId: string, limit = 5): Promise<RecentCampaign[]> {
  const supabase = createClient();
  const { data: campaignRows, error } = await supabase
    .from("campaigns")
    .select("id, name, segment_code, status, recipient_count, started_at")
    .eq("profile_id", profileId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  const campaignsList = campaignRows ?? [];
  if (campaignsList.length === 0) return [];

  const campaignIds = campaignsList.map((c) => c.id);
  const { data: sentRows } = await supabase
    .from("sent_messages")
    .select("id, campaign_id")
    .in("campaign_id", campaignIds);

  const messageIdToCampaign = new Map((sentRows ?? []).map((m) => [m.id as string, m.campaign_id as string]));
  const messageIds = (sentRows ?? []).map((m) => m.id as string);

  const bookedByCampaign = new Map<string, number>();
  const responsesByCampaign = new Map<string, number>();
  const redemptionIdToCampaign = new Map<string, string>();

  if (messageIds.length > 0) {
    const { data: redemptionRows } = await supabase
      .from("redemptions")
      .select("id, sent_message_id, status")
      .in("sent_message_id", messageIds);

    for (const r of redemptionRows ?? []) {
      const campaignId = messageIdToCampaign.get(r.sent_message_id as string);
      if (!campaignId) continue;
      responsesByCampaign.set(campaignId, (responsesByCampaign.get(campaignId) || 0) + 1);
      redemptionIdToCampaign.set(r.id as string, campaignId);
      if (r.status === "booked") {
        bookedByCampaign.set(campaignId, (bookedByCampaign.get(campaignId) || 0) + 1);
      }
    }
  }

  const nightsByCampaign = new Map<string, number>();
  const revenueByCampaign = new Map<string, number>();
  const redemptionIds = Array.from(redemptionIdToCampaign.keys());

  if (redemptionIds.length > 0) {
    const { data: reservationRows } = await supabase
      .from("reservations")
      .select("redemption_id, nights, montant_fcfa")
      .eq("status", "confirmed")
      .in("redemption_id", redemptionIds);

    for (const r of reservationRows ?? []) {
      const campaignId = redemptionIdToCampaign.get(r.redemption_id as string);
      if (!campaignId) continue;
      nightsByCampaign.set(campaignId, (nightsByCampaign.get(campaignId) || 0) + (r.nights || 0));
      revenueByCampaign.set(campaignId, (revenueByCampaign.get(campaignId) || 0) + (r.montant_fcfa || 0));
    }
  }

  return campaignsList.map((c) => ({
    ...c,
    bookedCount: bookedByCampaign.get(c.id) || 0,
    responsesCount: responsesByCampaign.get(c.id) || 0,
    nightsRecovered: nightsByCampaign.get(c.id) || 0,
    revenueFcfa: revenueByCampaign.get(c.id) || 0,
  }));
}

export const campaigns = { sendCampaign, listRecentCampaigns };
