/**
 * Middleware Supabase pour rafraîchir les sessions
 * 
 * Usage dans middleware.js:
 * import { updateSession } from "@/libs/supabase/middleware";
 * 
 * export async function middleware(request) {
 *   return await updateSession(request);
 * }
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_PATHS = [
  "/",
  "/signin",
  "/signup",
  "/auth",
  "/checkout",
  "/privacy-policy",
  "/tos",
  "/api",
  "/presentation",
  "/demo",
  "/offre",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const modifiedRequest = new NextRequest(request.url, { headers: requestHeaders });

  // Skip auth check for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: modifiedRequest });
  }

  // Mode démo ou Supabase non configuré : skip l'auth
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseConfigured = url && anonKey;

  if (isDemoMode || !supabaseConfigured) {
    if (!supabaseConfigured) {
      console.warn("⚠️ Supabase not configured. Auth will be disabled.");
    }
    return NextResponse.next({ request: modifiedRequest });
  }

  let supabaseResponse = NextResponse.next({ request: modifiedRequest });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return modifiedRequest.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          modifiedRequest.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request: modifiedRequest });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Rafraîchir le token d'authentification
  await supabase.auth.getUser();

  return supabaseResponse;
}
