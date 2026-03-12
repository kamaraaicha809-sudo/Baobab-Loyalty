/**
 * SDK Core - Edge Functions Client
 * 
 * Utilise supabase.functions.invoke() qui gère automatiquement :
 * - Le refresh token
 * - L'Authorization header
 * - Les erreurs d'auth
 */

import { createClient } from "@/libs/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Pattern singleton pour le client Supabase (performance)
let clientInstance: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

// Types pour les réponses API
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Erreur SDK personnalisée
 */
export class SdkError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "SdkError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Appelle une Edge Function Supabase
 * 
 * @param functionName - Nom de la fonction (peut inclure query string pour GET)
 * @param options - Options de l'appel
 * @returns Les données de la réponse
 * 
 * @example
 * // POST request
 * const data = await callEdgeFunction("billing-create-checkout", { 
 *   body: { priceId, successUrl, cancelUrl } 
 * });
 * 
 * @example
 * // GET request with params
 * const data = await callEdgeFunction("config-get?key=default_model", { 
 *   method: "GET" 
 * });
 */
export async function callEdgeFunction<T>(
  functionName: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    requireAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = "POST", body, requireAuth = true } = options;
  const supabase = getClient();

  // Vérifier l'auth si requis (quick-check local - la vraie validation se fait côté serveur)
  if (requireAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new SdkError("UNAUTHORIZED", "Veuillez vous reconnecter");
    }
  }

  // Extraire le nom de fonction et les query params
  const [baseFunctionName, queryString] = functionName.split("?");

  // Construire le body pour invoke
  // Pour les GET, on passe _method et _query dans le body
  let invokeBody: unknown;
  
  if (method === "GET") {
    invokeBody = {
      _method: "GET",
      ...(queryString ? { _query: queryString } : {}),
    };
  } else {
    invokeBody = body;
  }

  try {
    const { data, error } = await supabase.functions.invoke(baseFunctionName, {
      body: invokeBody,
      headers: {
        "x-http-method": method,
      },
    });

    // Gérer les erreurs de invoke
    if (error) {
      // Essayer de parser l'erreur structurée depuis la fonction
      if (error.context) {
        try {
          const contextBody = typeof error.context === "string"
            ? JSON.parse(error.context)
            : error.context;
          
          if (contextBody?.error) {
            throw new SdkError(
              contextBody.error.code || "FUNCTION_ERROR",
              contextBody.error.message || error.message,
              contextBody.error.details
            );
          }
        } catch (parseError) {
          // Si le parsing échoue, utiliser le message d'erreur brut
          if (parseError instanceof SdkError) throw parseError;
        }
      }
      
      throw new SdkError("FUNCTION_ERROR", error.message);
    }

    // Gérer le format de réponse { ok: boolean, data/error }
    if (data && typeof data === "object" && "ok" in data) {
      const response = data as ApiResponse<T>;
      
      if (!response.ok) {
        const errorResponse = response as ApiErrorResponse;
        throw new SdkError(
          errorResponse.error?.code || "ERROR",
          errorResponse.error?.message || "Unknown error",
          errorResponse.error?.details
        );
      }
      
      return (response as ApiSuccessResponse<T>).data;
    }

    // Si pas de format standard, retourner les données directement
    return data as T;
  } catch (err) {
    if (err instanceof SdkError) throw err;
    throw new SdkError(
      "NETWORK_ERROR",
      err instanceof Error ? err.message : "Network request failed"
    );
  }
}
