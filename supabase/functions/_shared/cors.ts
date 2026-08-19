/**
 * CORS headers for Edge Functions
 * Used by all functions to handle cross-origin requests
 */

// baobabloyalty.com (apex) redirige (307) vers www.baobabloyalty.com : tout
// trafic navigateur reel arrive donc avec Origin = www. Si SITE_URL est
// configure sans le www (secret Vault ou valeur par defaut ci-dessous), le
// header CORS ne correspond plus a l'origine reelle et le navigateur bloque
// silencieusement TOUS les appels aux Edge Functions (profil, facturation,
// campagnes...). On normalise donc vers le www quel que soit SITE_URL.
function normalizeOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "baobabloyalty.com") {
      parsed.hostname = "www.baobabloyalty.com";
    }
    return parsed.origin;
  } catch {
    return url;
  }
}

const allowedOrigin = normalizeOrigin(Deno.env.get("SITE_URL") || "https://baobabloyalty.com");

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
