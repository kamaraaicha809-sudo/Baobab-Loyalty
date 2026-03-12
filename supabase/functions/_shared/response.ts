/**
 * Standard response format for all Edge Functions
 * 
 * Success: { ok: true, data: T }
 * Error: { ok: false, error: { code, message, details? } }
 */

import { corsHeaders } from "./cors.ts";

interface SuccessResponse<T> {
  ok: true;
  data: T;
}

interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Return a success response
 */
export function success<T>(data: T, status = 200, extraHeaders?: Record<string, string>): Response {
  const body: SuccessResponse<T> = { ok: true, data };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

/**
 * Return an error response
 */
export function error(
  status: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const body: ErrorResponse = {
    ok: false,
    error: { code, message, ...(details && { details }) },
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Common error helpers
export const errors = {
  unauthorized: (message = "Unauthorized") => error(401, "UNAUTHORIZED", message),
  forbidden: (message = "Forbidden") => error(403, "FORBIDDEN", message),
  badRequest: (message: string, details?: unknown) => error(400, "BAD_REQUEST", message, details),
  validationError: (message: string, details?: unknown) => error(400, "VALIDATION_ERROR", message, details),
  notFound: (message = "Not found") => error(404, "NOT_FOUND", message),
  internal: (message = "Internal server error") => error(500, "INTERNAL_ERROR", message),
};
