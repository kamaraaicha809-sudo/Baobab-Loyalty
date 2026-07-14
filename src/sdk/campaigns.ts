/**
 * Campaigns SDK — envoi de campagnes WhatsApp
 */

import { callEdgeFunction } from "./_core";

export interface SendCampaignParams {
  segmentCode: string;
  message: string;
  templateId: string;
  avantage?: string;
  customMonths?: number;
}

export interface SendCampaignResult {
  sent: number;
  failed: number;
  total: number;
  campaignId: string | null;
}

export async function sendCampaign(params: SendCampaignParams): Promise<SendCampaignResult> {
  return callEdgeFunction<SendCampaignResult>("campaign-send", { body: params });
}

export const campaigns = { sendCampaign };
