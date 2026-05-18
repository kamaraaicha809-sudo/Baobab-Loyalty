import { callEdgeFunction } from "./_core";

interface WelcomeEmailResponse {
  sent: boolean;
  demo?: boolean;
}

async function sendWelcomeEmail(): Promise<WelcomeEmailResponse> {
  return callEdgeFunction<WelcomeEmailResponse>("email-welcome", {
    method: "POST",
    body: {},
  });
}

export const email = {
  sendWelcomeEmail,
};
