/**
 * Campaigns SDK — envoi de campagnes WhatsApp
 */

import { createClient } from "@/libs/supabase/client";

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
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke("campaign-send", {
    body: params,
  });

  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error?.message || "Erreur lors de l'envoi");

  return data.data as SendCampaignResult;
}

export const campaigns = { sendCampaign };
