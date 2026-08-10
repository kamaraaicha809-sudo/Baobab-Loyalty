/**
 * Transforme un paiement Moneroo confirme en facture FNE mise en file (QUEUED).
 * Appele depuis billing-webhook, en best-effort : ne doit jamais faire echouer
 * l'accuse de reception du webhook Moneroo si une etape ici plante.
 *
 * Ne construit PAS le payload FNE final (etablissement/point de vente peuvent
 * changer entre l'encaissement et l'envoi reel) : ce role revient a fne-worker,
 * au moment de l'appel, avec la config active la plus recente.
 */

import type { SupabaseClient } from "../deps.ts";
import { buildInvoicePayload, resolveTaxCode, resolveTemplate } from "./mapper.ts";
import type { PaymentMethod } from "./types.ts";

// Doit rester synchronise avec config.js (billing.plans) - config.js n'est pas
// importable depuis une Edge Function Deno (fichier frontend, pas un module partage).
const PLAN_PRICES_XOF: Record<string, number> = {
  starter: 39000,
  pro: 69000,
  premium: 189000,
};

function mapMonerooPaymentMethod(raw: string | undefined | null): PaymentMethod {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("card") || m.includes("visa") || m.includes("mastercard")) return "card";
  if (m.includes("transfer") || m.includes("virement")) return "transfer";
  if (m.includes("check") || m.includes("cheque")) return "check";
  if (m.includes("cash") || m.includes("especes")) return "cash";
  // Mobile money (Orange Money, MTN Money, Moov, Wave...) est le canal dominant sur ce marche.
  return "mobile-money";
}

export interface EnqueueFneInvoiceArgs {
  userId: string;
  planSlug: string | undefined;
  monerooPaymentId: string | null;
  monerooMethod: string | undefined;
}

export async function enqueueFneInvoice(supabase: SupabaseClient, args: EnqueueFneInvoiceArgs): Promise<void> {
  const { data: config } = await supabase
    .from("fne_config")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (!config) {
    console.log("[fne] Aucune fne_config active - facture non mise en file (inscription DGI en cours).");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, hotel_name, email, ncc, country, whatsapp_display_phone")
    .eq("id", args.userId)
    .single();

  if (profileError || !profile) {
    console.error("[fne] Profil introuvable pour la facture FNE:", profileError?.message);
    return;
  }

  const internalNumber = `BL-${Date.now()}-${args.userId.slice(0, 8)}`;
  const planSlug = args.planSlug ?? "";
  const planPriceXof = PLAN_PRICES_XOF[planSlug];
  const template = resolveTemplate({ country: profile.country, ncc: profile.ncc });
  const taxCode = resolveTaxCode(config.vat_registered);
  const paymentMethod = mapMonerooPaymentMethod(args.monerooMethod);

  const baseInvoiceRow = {
    internal_number: internalNumber,
    moneroo_payment_id: args.monerooPaymentId,
    plan_slug: planSlug || null,
    profile_id: args.userId,
    template,
    payment_method: paymentMethod,
  };

  if (!planPriceXof) {
    await insertInvoiceIgnoringDuplicate(supabase, {
      ...baseInvoiceRow,
      total_ht_local: 0,
      total_ttc_local: 0,
      vat_local: 0,
      state: "NEEDS_FIX",
      last_error: `Plan inconnu ou non tarife pour la FNE : "${planSlug}"`,
    });
    return;
  }

  let totals: { totalHt: number; totalTtc: number; vat: number; description: string; unitAmountHt: number };
  try {
    const built = buildInvoicePayload({
      template,
      paymentMethod,
      taxCode,
      planPriceXof,
      planName: planSlug,
      periodLabel: new Date().toISOString().slice(0, 10),
      pointOfSale: config.default_point_of_sale,
      establishment: config.default_establishment,
      ncc: profile.ncc,
      hotelName: profile.hotel_name || profile.email,
      clientPhone: profile.whatsapp_display_phone,
      clientEmail: profile.email,
      foreignCurrency: "",
      foreignCurrencyRate: 0,
    });
    totals = {
      totalHt: built.totalHt,
      totalTtc: built.totalTtc,
      vat: built.vat,
      description: built.payload.items[0].description,
      unitAmountHt: built.payload.items[0].amount,
    };
  } catch (err) {
    await insertInvoiceIgnoringDuplicate(supabase, {
      ...baseInvoiceRow,
      total_ht_local: 0,
      total_ttc_local: 0,
      vat_local: 0,
      state: "NEEDS_FIX",
      last_error: err instanceof Error ? err.message : "Erreur de mapping FNE inconnue",
    });
    return;
  }

  const invoiceId = await insertInvoiceIgnoringDuplicate(supabase, {
    ...baseInvoiceRow,
    total_ht_local: totals.totalHt,
    total_ttc_local: totals.totalTtc,
    vat_local: totals.vat,
    state: "QUEUED",
  });

  if (!invoiceId) return; // deja traite (webhook Moneroo redelivre) ou echec deja logge

  const { error: itemError } = await supabase.from("invoice_items").insert({
    invoice_id: invoiceId,
    line_no: 1,
    reference: "BAOBAB-SUB",
    description: totals.description,
    quantity: 30,
    unit_amount_ht: totals.unitAmountHt,
    measurement_unit: "jour",
    tax_code: taxCode,
  });

  if (itemError) {
    console.error("[fne] Echec insertion invoice_items:", itemError.message);
  }
}

/** Insere une facture ; retourne null si moneroo_payment_id existe deja (webhook redelivre). */
async function insertInvoiceIgnoringDuplicate(
  supabase: SupabaseClient,
  row: Record<string, unknown>
): Promise<string | null> {
  const { data, error } = await supabase.from("invoices").insert(row).select("id").single();
  if (error) {
    if (error.code === "23505") {
      console.log("[fne] Facture deja mise en file pour ce paiement Moneroo (dedup) :", row.moneroo_payment_id);
      return null;
    }
    console.error("[fne] Echec insertion invoices:", error.message);
    return null;
  }
  return data.id as string;
}
