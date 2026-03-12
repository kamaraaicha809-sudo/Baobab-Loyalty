/**
 * Authentication helpers for Edge Functions
 * Verifies JWT tokens from Supabase Auth
 */

import { createClient, User } from "./deps.ts";
import type { SupabaseClient } from "./deps.ts";

interface AuthResult {
  user: User | null;
  userClient: SupabaseClient | null;
  error: string | null;
}

/**
 * Extract and verify JWT from Authorization header
 * Returns user, userClient (for RLS queries), and error
 */
export async function requireAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, userClient: null, error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return { user: null, userClient: null, error: "Server configuration error" };
  }

  // Create client with secure options
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Verify token using getUser(token) - more secure than getUser() without token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, userClient: null, error: error?.message || "Invalid token" };
  }

  // Create userClient for RLS queries
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return { user, userClient, error: null };
}

/**
 * Require admin role
 * Checks if user has admin role in profiles table
 */
export async function requireAdmin(req: Request): Promise<AuthResult> {
  const { user, userClient, error } = await requireAuth(req);
  
  if (error || !user || !userClient) {
    return { user: null, userClient: null, error: error || "Authentication required" };
  }

  // Check admin role
  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { user: null, userClient: null, error: "Admin access required" };
  }

  return { user, userClient, error: null };
}

/**
 * Get Supabase client with service role (for admin operations)
 */
export function getServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Get Supabase client for authenticated user
 */
export function getUserClient(token: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}
