/**
 * Client Supabase pour le navigateur (côté client)
 * 
 * Usage:
 * import { createClient } from "@/libs/supabase/client";
 * const supabase = createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // En mode démo ou si Supabase n'est pas configuré, on log un warning
    // au lieu de throw pour ne pas casser l'app
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      console.warn("Supabase not configured (demo mode active)");
    } else {
      throw new Error(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }
    // Retourner un client avec des URLs placeholder (ne sera pas utilisé en démo)
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
    );
  }

  return createBrowserClient(url, anonKey);
}
