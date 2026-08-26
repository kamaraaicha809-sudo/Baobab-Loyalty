/**
 * API : Créer une réservation depuis la page publique /offre
 * POST { profile_id, hotel_name, checkin_date, nights, client_name, client_phone, avantage }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/libs/supabase/admin";
import { checkRateLimit, getClientIp } from "@/libs/rate-limit";
import config from "@/config";

const reservationSchema = z.object({
  profile_id: z.string().uuid(),
  hotel_name: z.string().max(200).optional(),
  checkin_date: z.string().max(10).optional(),
  nights: z.coerce.number().int().min(1).max(30).optional(),
  client_name: z.string().max(200).optional(),
  client_phone: z.string().max(30).optional(),
  avantage: z.string().max(500).optional(),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = reservationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    const { profile_id, hotel_name, checkin_date, nights, client_name, client_phone, avantage } = parsed.data;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service non configuré pour créer des réservations" },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    // Rate limit par IP : freine un attaquant depuis une seule source.
    const allowedByIp = await checkRateLimit(supabase, `reservations:ip:${ip}`, 5, 600);
    if (!allowedByIp) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }
    // Rate limit par hôtel : le lien /offre?pid=... est visible dans l'URL et
    // peut être capturé et rejoué depuis des IP différentes. Ce second plafond
    // borne le nombre de fausses demandes qu'un hôtel peut recevoir, quelle
    // que soit la diversité des IP utilisées par l'attaquant.
    const allowedByProfile = await checkRateLimit(supabase, `reservations:profile:${profile_id}`, 30, 3600);
    if (!allowedByProfile) {
      return NextResponse.json(
        { error: "Trop de demandes pour cet hôtel. Réessayez plus tard." },
        { status: 429 }
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
      .select("id, hotel_name, reception_email, reception_whatsapp, bsp_api_key, bsp_status")
      .eq("id", profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 });
    }

    // Déduplication : un double-clic, un rechargement de page ou un lien
    // rejoué juste après ne doit pas créer plusieurs réservations en double
    // pour le même client et la même date d'arrivée.
    if (client_phone || client_name) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      let dedupQuery = supabase
        .from("reservations")
        .select("id")
        .eq("profile_id", profile_id)
        .eq("check_in_date", checkIn)
        .eq("status", "pending_validation")
        .gte("created_at", tenMinutesAgo)
        .limit(1);

      dedupQuery = client_phone
        ? dedupQuery.eq("client_phone", client_phone)
        : dedupQuery.eq("client_name", client_name!);

      const { data: existing } = await dedupQuery.maybeSingle();
      if (existing) {
        return NextResponse.json({ success: true });
      }
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

    let reservationId: string | null = null;
    try {
      const { data: inserted, error } = await supabase
        .from("reservations")
        .insert({ ...insertPayload, source: "baobab" })
        .select("id")
        .single();
      if (error && error.message.includes("source")) {
        const { data: inserted2, error: err2 } = await supabase
          .from("reservations")
          .insert(insertPayload)
          .select("id")
          .single();
        if (err2) throw new Error(err2.message);
        reservationId = inserted2?.id ?? null;
      } else if (error) {
        throw new Error(error.message);
      } else {
        reservationId = inserted?.id ?? null;
      }
    } catch (insertErr) {
      return NextResponse.json({ error: String(insertErr) }, { status: 500 });
    }

    // Attribution "dernier contact" (best effort, ne doit jamais faire échouer
    // la réservation) : on retrouve le client par son numéro de téléphone —
    // c'est la seule donnée fiable dont on dispose ici, le lien /offre ne
    // porte aujourd'hui aucun identifiant de campagne ou de message. On
    // rattache la réservation au dernier message WhatsApp envoyé à ce client
    // dans les 30 derniers jours (fenêtre standard d'attribution "dernier
    // clic" pour ce type de relance marketing).
    if (reservationId && client_phone) {
      try {
        const digits = client_phone.replace(/\D/g, "");
        if (digits.length >= 7) {
          const e164 = `+${digits}`;
          const { data: matchedClient } = await supabase
            .from("clients")
            .select("id")
            .eq("profile_id", profile_id)
            .or(`whatsapp.eq.${e164},whatsapp.eq.${digits},telephone.eq.${e164},telephone.eq.${digits}`)
            .maybeSingle();

          if (matchedClient) {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { data: lastMessage } = await supabase
              .from("sent_messages")
              .select("id, campaign_id")
              .eq("client_id", matchedClient.id)
              .eq("profile_id", profile_id)
              .in("status", ["sent", "delivered", "read"])
              .gte("sent_at", thirtyDaysAgo)
              .order("sent_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (lastMessage) {
              let offerId: string | null = null;
              if (lastMessage.campaign_id) {
                const { data: campaign } = await supabase
                  .from("campaigns")
                  .select("offer_id")
                  .eq("id", lastMessage.campaign_id)
                  .maybeSingle();
                offerId = campaign?.offer_id ?? null;
              }

              // Le clic a peut-être déjà créé une redemption "clicked" (voir
              // /api/offre/track-click) : on la fait progresser vers "booked"
              // plutôt que d'en créer une seconde pour le même message.
              const { data: existingRedemption } = await supabase
                .from("redemptions")
                .select("id")
                .eq("sent_message_id", lastMessage.id)
                .maybeSingle();

              let redemptionId: string | null = null;
              if (existingRedemption) {
                await supabase
                  .from("redemptions")
                  .update({ status: "booked", offer_id: offerId })
                  .eq("id", existingRedemption.id);
                redemptionId = existingRedemption.id;
              } else {
                const { data: redemption } = await supabase
                  .from("redemptions")
                  .insert({
                    client_id: matchedClient.id,
                    offer_id: offerId,
                    sent_message_id: lastMessage.id,
                    profile_id,
                    status: "booked",
                  })
                  .select("id")
                  .single();
                redemptionId = redemption?.id ?? null;
              }

              if (redemptionId) {
                await supabase
                  .from("reservations")
                  .update({ client_id: matchedClient.id, offer_id: offerId, redemption_id: redemptionId })
                  .eq("id", reservationId);
              }
            }
          }
        }
      } catch {
        // Attribution non bloquante : la réservation est déjà créée
      }
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

    const hotelLabelHtml = escapeHtml(hotelLabel);
    const clientLabelHtml = escapeHtml(clientLabel);
    const clientPhoneHtml = escapeHtml(client_phone || "Non renseigné");
    const offerLabelHtml = escapeHtml(offerLabel);

    const htmlBody = `
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1e293b;">
  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Nouvelle demande de réservation</h2>
  <p style="color: #64748b; font-size: 14px; margin-top: 0;">via Baobab Loyalty — ${hotelLabelHtml}</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b; width: 40%;">Client</td>
      <td style="padding: 10px 0; font-weight: 600;">${clientLabelHtml}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b;">Téléphone</td>
      <td style="padding: 10px 0; font-weight: 600;">${clientPhoneHtml}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 0; color: #64748b;">Offre demandée</td>
      <td style="padding: 10px 0;">${offerLabelHtml}</td>
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
              from: config.resend.fromNoReply,
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

    const p = profile as Record<string, unknown>;
    if (
      profile.reception_whatsapp &&
      p.bsp_api_key &&
      p.bsp_status === "active"
    ) {
      try {
        const waTo = (profile.reception_whatsapp as string).startsWith("+")
          ? (profile.reception_whatsapp as string).slice(1)
          : profile.reception_whatsapp;

        const waText =
          `*Nouvelle réservation — ${hotelLabel}*\n\n` +
          `Client : ${clientLabel}\n` +
          `Téléphone : ${client_phone || "Non renseigné"}\n` +
          `Offre : ${offerLabel}\n\n` +
          `Arrivée : ${checkinFormatted}\n` +
          `Départ : ${checkoutFormatted}\n` +
          `Durée : ${nightCount} nuit${nightCount > 1 ? "s" : ""}\n\n` +
          `ACTION : Appelez le client pour confirmer la disponibilité.`;

        await fetch("https://waba-v2.360dialog.io/messages", {
          method: "POST",
          headers: {
            "D360-API-KEY": p.bsp_api_key as string,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: waTo,
            type: "text",
            text: { body: waText },
          }),
        });
      } catch {
        // WhatsApp non bloquant
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
