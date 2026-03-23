/**
 * email-send
 * Sends transactional emails via Resend
 *
 * Auth: Required (admin role or service role)
 * Method: POST
 * Body: { to, subject, html, text?, replyTo?, from? }
 */

import { createClient } from "../_shared/deps.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    let isAuthorized = false;

    // Check if using service role key (exact match required)
    if (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`) {
      isAuthorized = true;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        const serviceClient = createClient(supabaseUrl, serviceRoleKey!, {
          auth: { persistSession: false },
        });
        const { data: profile } = await serviceClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") isAuthorized = true;
      }
    }

    if (!isAuthorized) return errors.forbidden("Admin or service role access required");

    const body = await req.json();
    const { to, subject, html, text, replyTo, from } = body;

    if (!to) return errors.badRequest("Recipient (to) is required");
    if (!subject) return errors.badRequest("Subject is required");
    if (!html) return errors.badRequest("HTML content is required");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return errors.internal("Email service not configured");

    const defaultFrom = from || Deno.env.get("EMAIL_FROM") || "Kodefast <noreply@kodefast.com>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(text && { text }),
        ...(replyTo && { reply_to: replyTo }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return errors.internal(`Email sending failed: ${errorData.message || "Unknown error"}`);
    }

    const data = await response.json();
    return success({ id: data.id, sent: true });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Email sending failed");
  }
});
