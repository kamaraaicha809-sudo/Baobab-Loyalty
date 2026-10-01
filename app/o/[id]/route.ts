/**
 * Lien court du bouton "Reserver mon offre" du template WhatsApp
 * baobab_offre_reservation : https://baobabloyalty.com/o/{sent_messages.id}
 *
 * Retrouve le message envoye (donc le client, l'hotel et l'offre de la
 * campagne), enregistre le clic (redemption "clicked", une seule fois par
 * message) puis redirige vers /offre pre-remplie. Aucune donnee personnelle
 * n'apparait dans le lien WhatsApp lui-meme : seulement un identifiant non
 * devinable (UUID).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/libs/supabase/admin";
import { checkRateLimit, getClientIp } from "@/libs/rate-limit";

interface SentMessageRef {
  id: string;
  client_id: string;
  profile_id: string;
  campaign_id: string | null;
}

interface OfferContext {
  clientName: string;
  clientPhone: string;
  hotelName: string;
  avantage: string;
}

const idSchema = z.string().uuid();

async function loadOfferContext(db: SupabaseClient, message: SentMessageRef): Promise<OfferContext> {
  const [{ data: client }, { data: profile }, campaignResult] = await Promise.all([
    db.from("clients").select("nom, whatsapp, telephone").eq("id", message.client_id).maybeSingle(),
    db.from("profiles").select("hotel_name").eq("id", message.profile_id).maybeSingle(),
    message.campaign_id
      ? db.from("campaigns").select("avantage").eq("id", message.campaign_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    clientName: client?.nom ?? "",
    clientPhone: client?.whatsapp || client?.telephone || "",
    hotelName: profile?.hotel_name ?? "",
    avantage: (campaignResult.data as { avantage?: string | null } | null)?.avantage ?? "",
  };
}

async function recordClick(db: SupabaseClient, message: SentMessageRef): Promise<void> {
  const { data: existing } = await db
    .from("redemptions")
    .select("id")
    .eq("sent_message_id", message.id)
    .maybeSingle();
  if (existing) return;

  await db.from("redemptions").insert({
    client_id: message.client_id,
    sent_message_id: message.id,
    profile_id: message.profile_id,
    status: "clicked",
  });
}

function buildOfferUrl(request: Request, profileId: string, context: OfferContext): URL {
  const url = new URL("/offre", request.url);
  url.searchParams.set("pid", profileId);
  if (context.clientName) url.searchParams.set("nom", context.clientName);
  if (context.clientPhone) url.searchParams.set("tel", context.clientPhone);
  if (context.hotelName) url.searchParams.set("hotel", context.hotelName);
  if (context.avantage) url.searchParams.set("avantage", context.avantage);
  return url;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const home = new URL("/", request.url);
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.redirect(home);

  const db = createAdminClient();
  if (!db) return NextResponse.redirect(home);

  try {
    const allowed = await checkRateLimit(db, `offre-link:ip:${getClientIp(request)}`, 30, 600);
    if (!allowed) return NextResponse.redirect(home);

    const { data: message } = await db
      .from("sent_messages")
      .select("id, client_id, profile_id, campaign_id")
      .eq("id", id)
      .maybeSingle<SentMessageRef>();
    if (!message) return NextResponse.redirect(home);

    const context = await loadOfferContext(db, message);
    // Suivi best effort : un echec d'enregistrement ne doit jamais empecher
    // le client d'arriver sur l'offre.
    await recordClick(db, message).catch(() => undefined);

    return NextResponse.redirect(buildOfferUrl(request, message.profile_id, context));
  } catch {
    return NextResponse.redirect(home);
  }
}
