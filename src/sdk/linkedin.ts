/**
 * LinkedIn SDK module
 * Functions for generating WhatsApp templates from LinkedIn posts via Unipile
 */

import { callEdgeFunction } from "./_core";
import { createClient } from "@/libs/supabase/client";

// Types
export interface GenerateTemplateParams {
  url: string;
}

export interface GenerateTemplateResponse {
  content: string;
  variables_found: string[];
  post_preview: string;
}

export interface MessageTemplate {
  id: string;
  profile_id: string;
  name: string;
  content: string;
  variables: string[];
  source: "manual" | "linkedin";
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveTemplateParams {
  profileId: string;
  name: string;
  content: string;
  variables: string[];
  linkedinUrl?: string;
}

/**
 * Fetches a LinkedIn post and converts it to a WhatsApp template
 * Requires active subscription or demo mode
 */
export async function generateTemplate(
  params: GenerateTemplateParams
): Promise<GenerateTemplateResponse> {
  return callEdgeFunction<GenerateTemplateResponse>("linkedin-to-template", {
    method: "POST",
    body: { url: params.url },
  });
}

/**
 * Saves a generated template to the database
 */
export async function saveTemplate(
  params: SaveTemplateParams
): Promise<MessageTemplate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      profile_id: params.profileId,
      name: params.name,
      content: params.content,
      variables: params.variables,
      source: params.linkedinUrl ? "linkedin" : "manual",
      linkedin_url: params.linkedinUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MessageTemplate;
}

/**
 * Returns saved templates for a profile, most recent first
 */
export async function getTemplates(
  profileId: string
): Promise<MessageTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MessageTemplate[];
}

/**
 * Deletes a saved template
 */
export async function deleteTemplate(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// Export as namespace
export const linkedin = {
  generateTemplate,
  saveTemplate,
  getTemplates,
  deleteTemplate,
};
