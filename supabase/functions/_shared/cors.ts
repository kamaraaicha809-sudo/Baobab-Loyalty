/**
 * CORS headers for Edge Functions
 * Used by all functions to handle cross-origin requests
 */

const allowedOrigin = Deno.env.get("SITE_URL") || "https://baobabloyalty.com";

export const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-http-method",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

/**
 * Handle CORS preflight request
 */
export function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
