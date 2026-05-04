/**
 * SDK WhatsApp
 * Gère la connexion/déconnexion WhatsApp Business via Meta Embedded Signup
 */

import { callEdgeFunction } from "./_core";

interface ConnectParams {
  code: string;
  phone_number_id: string;
  waba_id: string;
}

interface ConnectResponse {
  status: "active";
  connected_at: string;
}

interface DisconnectResponse {
  status: "inactive";
}

export const whatsapp = {
  connect: (params: ConnectParams) =>
    callEdgeFunction<ConnectResponse>("whatsapp-connect", { body: params }),

  disconnect: () =>
    callEdgeFunction<DisconnectResponse>("whatsapp-disconnect", { body: {} }),
};
