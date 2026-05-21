/**
 * API : Créer une réservation depuis la page publique /offre
 * POST { profile_id, hotel_name, checkin_date, nights, client_name, client_phone, avantage }
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/libs/supabase/admin";

interface ReservationBody {
  profile_id: string;
  hotel_name?: string;
  checkin_date?: string;
  nights?: number;
  client_name?: string;
  client_phone?: string;
  avantage?: string;
}

export async function POST(request: Request) {
  try {
    const body: ReservationBody = await request.json();
    const { profile_id, hotel_name, checkin_date, nights, client_name, client_phone, avantage } = body;

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
    const checkIn = checkin_date || today;
    const nightCount = nights || 1;

    const checkOutDate = new Date(checkIn);
    checkOutDate.setDate(checkOutDate.getDate() + nightCount);
    const checkOut = checkOutDate.toISOString().split("T")[0];

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, hotel_name, reception_email, reception_whatsapp")
      .eq("id", profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 });
    }

    const insertPayload: Record<string, unknown> = {
      profile_id,
      reservation_date: today,
      check_in_date: checkIn,
      check_out_date: checkOut,
      type_reservation: "directe",
      hotel_name: hotel_name || profile.hotel_name || null,
      montant_fcfa: 0,
      status: "pending_validation",
      nights: nightCount,
      client_name: client_name || null,
      client_phone: client_phone || null,
    };

    try {
      const { error } = await supabase.from("reservations").insert({ ...insertPayload, source: "baobab" });
      if (error && error.message.includes("source")) {
        const { error: err2 } = await supabase.from("reservations").insert(insertPayload);
        if (err2) throw new Error(err2.message);
      } else if (error) {
        throw new Error(error.message);
      }
    } catch (insertErr) {
      return NextResponse.json({ error: String(insertErr) }, { status: 500 });
    }

    // Notifier la réception (email + WhatsApp — best effort)
    const hotelLabel = hotel_name || profile.hotel_name || "votre hôtel";
    const clientLabel = client_name || "Client";
    const checkinFormatted = new Date(checkIn).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const checkoutFormatted = new Date(checkOut).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
    const offerLabel = avantage || "Offre de fidélisation";

    const emailBody = `
Nouvelle demande de réservation via Baobab Loyalty

Hôtel : ${hotelLabel}
Client : ${clientLabel}
Téléphone : ${client_phone || "Non renseigné"}
Offre demandée : ${offerLabel}

Arrivée : ${checkinFormatted}
Départ : ${checkoutFormatted}
Durée : ${nightCount} nuit${nightCount > 1 ? "s" : ""}

ACTION REQUISE : Appelez le client pour confirmer la disponibilité et valider la réservation.
    `.trim();

    const htmlBody = `
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1e293b;">
  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Nouvelle demande de réservation</h2>
  <p style="color: #64748b; font-size: 14px; margin-top: 0;">via Baobab Loyalty — ${hotelLabel}</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b; width: 40%;">Client</td>
      <td style="padding: 10px 0; font-weight: 600;">${clientLabel}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b;">Téléphone</td>
      <td style="padding: 10px 0; font-weight: 600;">${client_phone || "Non renseigné"}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b;">Offre demandée</td>
      <td style="padding: 10px 0;">${offerLabel}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b;">Arrivée</td>
      <td style="padding: 10px 0; font-weight: 600;">${checkinFormatted}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b;">Départ</td>
      <td style="padding: 10px 0; font-weight: 600;">${checkoutFormatted}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; color: #64748b;">Durée</td>
      <td style="padding: 10px 0;">${nightCount} nuit${nightCount > 1 ? "s" : ""}</td>
    </tr>
  </table>

  <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 10px; padding: 16px; margin-top: 8px;">
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #92400e;">
      ACTION REQUISE : Appelez le client pour confirmer la disponibilité et valider la réservation.
    </p>
  </div>

  <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Ce message a été envoyé automatiquement par Baobab Loyalty.</p>
</div>
    `.trim();

    if (profile.reception_email) {
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Baobab Loyalty <notifications@baobab-loyalty.com>",
              to: [profile.reception_email],
              subject: `Nouvelle réservation à valider — ${clientLabel} (${checkinFormatted})`,
              text: emailBody,
              html: htmlBody,
            }),
          });
        }
      } catch {
        // Email non bloquant
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
