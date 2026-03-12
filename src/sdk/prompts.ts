/**
 * SDK module for AI Prompts CRUD operations
 */

import { callEdgeFunction } from "./_core";

// Types
export interface Prompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptParams {
  name: string;
  description?: string;
  content: string;
}

export interface UpdatePromptParams {
  id: string;
  name?: string;
  description?: string;
  content?: string;
}

// SDK methods
const list = async (): Promise<Prompt[]> => {
  return callEdgeFunction<Prompt[]>("prompts-list", {
    method: "GET",
    requireAuth: false,
  });
};

const create = async (params: CreatePromptParams): Promise<Prompt> => {
  return callEdgeFunction<Prompt>("prompts-create", {
    method: "POST",
    body: params,
    requireAuth: true,
  });
};

const update = async (params: UpdatePromptParams): Promise<Prompt> => {
  return callEdgeFunction<Prompt>("prompts-update", {
    method: "PUT",
    body: params,
    requireAuth: true,
  });
};

const remove = async (id: string): Promise<{ deleted: boolean }> => {
  return callEdgeFunction<{ deleted: boolean }>("prompts-delete", {
    method: "DELETE",
    body: { id },
    requireAuth: true,
  });
};

export const prompts = {
  list,
  create,
  update,
  delete: remove,
};
