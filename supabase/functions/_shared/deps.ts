/**
 * Centralized dependencies for all Edge Functions
 * Import from here to ensure consistent versions
 */

// Deno standard library
export { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// Supabase
export { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
export type { User, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Stripe
export { default as Stripe } from "https://esm.sh/stripe@14.14.0?target=deno";

// Valibot (validation)
export * as v from "https://deno.land/x/valibot@v0.30.0/mod.ts";
