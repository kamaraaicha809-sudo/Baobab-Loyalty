/**
 * Email SDK Module
 * Send transactional emails via Supabase Edge Functions
 */

import { callEdgeFunction } from "./_core";

interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

interface SendEmailResponse {
  id: string;
  sent: boolean;
}

export const email = {
  /**
   * Send a transactional email
   * Requires admin role or service role
   */
  send: async (payload: SendEmailPayload): Promise<SendEmailResponse> => {
    return callEdgeFunction<SendEmailResponse>("email-send", {
      body: payload,
      requireAuth: true,
    });
  },
};
