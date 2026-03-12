/**
 * API : Créer une réservation depuis la page publique /offre
 * POST { profile_id, hotel_name }
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/libs/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile_id, hotel_name } = body;

    if (!profile_id) {
      return NextResponse.json({ error: "profile_id requis" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service non configuré pour créer des réservations" },
        { status: 503 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 });
    }

    const { error } = await supabase.from("reservations").insert({
      profile_id,
      reservation_date: today,
      type_reservation: "directe",
      hotel_name: hotel_name || null,
      montant_fcfa: 0,
      source: "baobab",
    });

    if (error) {
      const insertData: Record<string, unknown> = {
        profile_id,
        reservation_date: today,
        type_reservation: "directe",
        hotel_name: hotel_name || null,
        montant_fcfa: 0,
      };
      if (!error.message.includes("source")) {
        (insertData as Record<string, string>).source = "baobab";
      }
      const { error: err2 } = await supabase.from("reservations").insert(insertData);
      if (err2) {
        return NextResponse.json({ error: err2.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
