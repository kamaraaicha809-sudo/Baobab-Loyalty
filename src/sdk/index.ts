/**
 * Kodefast SDK
 * Client for calling Supabase Edge Functions
 *
 * Usage:
 * import { billing, user, ai, email, storage, prompts } from "@/src/sdk";
 *
 * // Create checkout
 * const { url } = await billing.createCheckout({ priceId, mode, successUrl, cancelUrl });
 *
 * // Get profile
 * const profile = await user.getProfile();
 *
 * // Generate AI content
 * const { content } = await ai.generate({ prompt: "..." });
 *
 * // Send email (admin only)
 * await email.send({ to: "user@example.com", subject: "Hello", html: "<p>Hi!</p>" });
 *
 * // Upload file
 * const { url } = await storage.upload(file, "avatars");
 *
 * // Manage prompts (admin only)
 * const allPrompts = await prompts.list();
 * await prompts.create({ name: "system", content: "..." });
 */

export { billing } from "./billing";
export { user } from "./user";
export { ai } from "./ai";
export { email } from "./email";
export { storage } from "./storage";
export { prompts } from "./prompts";
export { linkedin } from "./linkedin";

// Re-export types
export type { CreateCheckoutParams, CreateCheckoutResponse, CreatePortalParams, CreatePortalResponse } from "./billing";
export type { UserProfile } from "./user";
export type { GenerateParams, GenerateResponse, GenerateLinkedInPostParams } from "./ai";
export type { UploadResponse, DeleteResponse } from "./storage";
export type { Prompt, CreatePromptParams, UpdatePromptParams } from "./prompts";
export type { GenerateTemplateParams, GenerateTemplateResponse, MessageTemplate, SaveTemplateParams } from "./linkedin";

// Re-export error class
export { SdkError } from "./_core";
