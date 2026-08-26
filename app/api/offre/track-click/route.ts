/**
 * API : Enregistre le clic sur le lien d'offre WhatsApp (page /offre) comme
 * une "réponse" du client, avant même qu'il ne réserve. Alimente le taux de
 * réponse (P4) — best effort, ne doit jamais bloquer l'affichage de /offre.
 * POST { profile_id, client_phone }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/libs/supabase/admin";
import { checkRateLimit, getClientIp } from "@/libs/rate-limit";

const trackSchema = z.object({
  profile_id: z.string().uuid(),
  client_phone: z.string().max(30).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = trackSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ tracked: false }, { status: 200 });
    }
    const { profile_id, client_phone } = parsed.data;
    if (!client_phone) return NextResponse.json({ tracked: false });

    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ tracked: false });

    const ip = getClientIp(request);
    const allowed = await checkRateLimit(supabase, `offre-click:ip:${ip}`, 20, 600);
    if (!allowed) return NextResponse.json({ tracked: false });

    const digits = client_phone.replace(/\D/g, "");
    if (digits.length < 7) return NextResponse.json({ tracked: false });
    const e164 = `+${digits}`;

    const { data: matchedClient } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", profile_id)
      .or(`whatsapp.eq.${e164},whatsapp.eq.${digits},telephone.eq.${e164},telephone.eq.${digits}`)
      .maybeSingle();

    if (!matchedClient) return NextResponse.json({ tracked: false });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: lastMessage } = await supabase
      .from("sent_messages")
      .select("id")
      .eq("client_id", matchedClient.id)
      .eq("profile_id", profile_id)
      .in("status", ["sent", "delivered", "read"])
      .gte("sent_at", thirtyDaysAgo)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastMessage) return NextResponse.json({ tracked: false });

    // Un clic peut être compté plusieurs fois (rafraîchissement de page) :
    // on ne crée la trace "clicked" qu'une seule fois par message envoyé.
    const { data: existing } = await supabase
      .from("redemptions")
      .select("id")
      .eq("sent_message_id", lastMessage.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("redemptions").insert({
        client_id: matchedClient.id,
        sent_message_id: lastMessage.id,
        profile_id,
        status: "clicked",
      });
    }

    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ tracked: false }, { status: 200 });
  }
}
