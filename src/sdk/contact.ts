/**
 * Contact SDK module
 * Public form submission — no auth required
 */

import { callEdgeFunction, SdkError } from "./_core";

export interface SendContactParams {
  name: string;
  email: string;
  message: string;
}

export interface SendContactResponse {
  sent: boolean;
  demo?: boolean;
}

/**
 * Send a message from the public /contact form to the support inbox.
 * Public endpoint — no authentication required.
 */
export async function send(
  params: SendContactParams
): Promise<SendContactResponse> {
  return callEdgeFunction<SendContactResponse>("contact-send", {
    method: "POST",
    body: params,
    requireAuth: false,
  });
}

export const contact = {
  send,
};

export type { SendContactParams as ContactSendParams, SendContactResponse as ContactSendResponse };

export { SdkError };
