/**
 * fne-worker
 * Traite une facture QUEUED a la fois vers l'API FNE (DGI Cote d'Ivoire).
 *
 * Declenche par pg_cron toutes les minutes (migration 032). Ne fait rien tant que
 * fne_config.is_active = false (garde de securite pendant l'inscription DGI).
 *
 * Auth : secret partage x-fne-worker-secret (pas de JWT, appel interne uniquement).
 * Method: POST
 */

import { getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { callFne } from "../_shared/fne/client.ts";
import { compareTotals } from "../_shared/fne/mapper.ts";
import type { FneCertificationResponse, FneInvoicePayload, TaxCode } from "../_shared/fne/types.ts";

// tentative 1 (immediate) -> 2 -> 3 -> 4 -> 5, au-dela : abandon (NEEDS_FIX)
const BACKOFF_MS: Record<number, number> = { 1: 30_000, 2: 120_000, 3: 600_000, 4: 3_600_000 };
const MAX_ATTEMPTS = 5;

function nextAttemptDelayMs(attemptCount: number): number | null {
  const base = BACKOFF_MS[attemptCount];
  if (base === undefined) return null;
  const jitter = base * 0.2 * (Math.random() * 2 - 1); // +/- 20%
  return Math.max(1000, Math.round(base + jitter));
}

async function sendFneAlert(subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("[fne-worker] RESEND_API_KEY absent, alerte non envoyee:", subject);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Baobab Loyalty <noreply@baobabloyalty.com>",
        to: "support@baobabloyalty.com",
        subject: `[FNE] ${subject}`,
        html,
      }),
    });
  } catch (err) {
    console.error("[fne-worker] Echec envoi alerte email:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  const workerSecret = Deno.env.get("FNE_WORKER_SECRET");
  if (!workerSecret || req.headers.get("x-fne-worker-secret") !== workerSecret) {
    return errors.unauthorized("Secret worker invalide ou manquant");
  }

  const supabase = getServiceClient();

  try {
    const { data: config } = await supabase.from("fne_config").select("*").eq("is_active", true).maybeSingle();
    if (!config) {
      return success({ processed: false, reason: "fne_config inactive" });
    }

    // fne_claim_next_invoice() renvoie une seule ligne composite (pas SETOF) : PostgREST
    // la retourne deja comme un objet unique (ou null), pas besoin de .single() ici.
    const { data: invoice, error: claimError } = await supabase.rpc("fne_claim_next_invoice");
    if (claimError) return errors.internal(`Claim echoue: ${claimError.message}`);
    // Selon la version de PostgREST, une ligne composite NULL peut revenir soit comme
    // `null`, soit comme un objet dont tous les champs sont null : on couvre les deux.
    if (!invoice || !invoice.id) {
      return success({ processed: false, reason: "aucune facture QUEUED" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("hotel_name, email, ncc, whatsapp_display_phone")
      .eq("id", invoice.profile_id)
      .single();

    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("line_no", { ascending: true });

    if (!profile || !items || items.length === 0) {
      await supabase
        .from("invoices")
        .update({ state: "NEEDS_FIX", last_error: "Profil ou lignes de facture introuvables" })
        .eq("id", invoice.id);
      return errors.internal("Profil ou invoice_items manquants pour cette facture");
    }

    const payload: FneInvoicePayload = {
      invoiceType: "sale",
      paymentMethod: invoice.payment_method,
      template: invoice.template,
      isRne: false,
      ...(invoice.template === "B2B" ? { clientNcc: profile.ncc, clientCompanyName: profile.hotel_name } : {}),
      ...(profile.whatsapp_display_phone ? { clientPhone: profile.whatsapp_display_phone } : {}),
      ...(profile.email ? { clientEmail: profile.email } : {}),
      pointOfSale: config.default_point_of_sale,
      establishment: config.default_establishment,
      commercialMessage: `Abonnement ${invoice.plan_slug ?? ""}`,
      footer: "Facture generee automatiquement - support@baobabloyalty.com",
      foreignCurrency: (invoice.foreign_currency ?? "") as FneInvoicePayload["foreignCurrency"],
      foreignCurrencyRate: invoice.foreign_currency_rate ?? 0,
      items: items.map((it) => ({
        taxes: [it.tax_code as TaxCode],
        reference: it.reference ?? "BAOBAB-SUB",
        description: it.description,
        quantity: it.quantity,
        amount: it.unit_amount_ht,
        discount: 0,
        measurementUnit: it.measurement_unit ?? "jour",
      })),
      discount: 0,
    };

    const { data: submission, error: submissionInsertError } = await supabase
      .from("fne_submissions")
      .insert({
        invoice_id: invoice.id,
        kind: "sign",
        attempt_no: invoice.attempt_count,
        request_body: payload,
        request_sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (submissionInsertError || !submission) {
      // Verrou d'unicite declenche (une soumission deja en vol) : on ne fait rien,
      // le prochain tick reessaiera - jamais deux POST /sign simultanes (D1).
      return success({ processed: false, reason: "soumission deja en vol pour cette facture" });
    }

    const apiKey = Deno.env.get(config.api_key_ref) ?? Deno.env.get("FNE_API_KEY");
    if (!apiKey) {
      await supabase
        .from("fne_submissions")
        .update({ outcome: "permanent", error_class: "missing_api_key" })
        .eq("id", submission.id);
      await supabase
        .from("invoices")
        .update({ state: "NEEDS_FIX", last_error: "Cle API FNE non configuree (Vault)" })
        .eq("id", invoice.id);
      await sendFneAlert(
        "Cle API FNE manquante",
        `<p>Facture ${invoice.internal_number} bloquee : aucune cle API FNE trouvee (secret "${config.api_key_ref}").</p>`
      );
      return errors.internal("Cle API FNE non configuree");
    }

    const url = `${config.base_url}/external/invoices/sign`;
    const result = await callFne(url, apiKey, payload);

    await supabase
      .from("fne_submissions")
      .update({
        response_status: result.status,
        response_body: result.outcome === "success" ? result.body : result.body ?? null,
        error_class: result.outcome === "success" ? null : result.errorClass,
        outcome: result.outcome,
      })
      .eq("id", submission.id);

    if (result.outcome === "success") {
      const body = result.body as FneCertificationResponse;
      const comparison = compareTotals(
        { totalHt: invoice.total_ht_local, vat: invoice.vat_local },
        { amount: body.invoice.amount, vatAmount: body.invoice.vatAmount }
      );

      if (!comparison.matches) {
        await supabase
          .from("invoices")
          .update({
            state: "AMOUNT_MISMATCH",
            last_error: `Ecart FNE vs local : deltaHt=${comparison.deltaHt} deltaVat=${comparison.deltaVat}`,
          })
          .eq("id", invoice.id);
        await sendFneAlert(
          "Ecart de montants FNE (AMOUNT_MISMATCH)",
          `<p>Facture ${invoice.internal_number} certifiee mais totaux divergents : ` +
            `deltaHt=${comparison.deltaHt} XOF, deltaVat=${comparison.deltaVat} XOF. Facture NON delivree au client.</p>`
        );
        return success({ processed: true, invoiceId: invoice.id, outcome: "AMOUNT_MISMATCH" });
      }

      await supabase.from("fne_certifications").insert({
        invoice_id: invoice.id,
        fne_invoice_id: body.invoice.id,
        fne_reference: body.reference,
        verification_url: body.token,
        issuer_ncc: config.issuer_ncc,
        amount_fne: body.invoice.amount,
        vat_amount_fne: body.invoice.vatAmount,
        balance_sticker: body.balance_sticker,
        warning: body.warning,
        raw_response: body,
      });

      await Promise.all(
        body.invoice.items.map((fneItem, index) => {
          const localItem = items[index];
          if (!localItem) return Promise.resolve();
          return supabase.from("invoice_items").update({ fne_item_id: fneItem.id }).eq("id", localItem.id);
        })
      );

      await supabase
        .from("invoices")
        .update({ state: "CERTIFIED", paid_at: new Date().toISOString() })
        .eq("id", invoice.id);

      await supabase.from("fne_sticker_log").insert({
        balance: body.balance_sticker,
        warning: body.warning,
        source_invoice: invoice.id,
      });

      if (body.warning || body.balance_sticker < config.sticker_threshold) {
        await sendFneAlert(
          "Stock de stickers FNE bas",
          `<p>Il reste ${body.balance_sticker} stickers FNE (seuil : ${config.sticker_threshold}).</p>`
        );
      }

      return success({ processed: true, invoiceId: invoice.id, outcome: "CERTIFIED" });
    }

    if (result.outcome === "indeterminate") {
      // Read timeout ou perte de reponse : etat indetermine, JAMAIS de retry (D1).
      await supabase
        .from("invoices")
        .update({ state: "NEEDS_VERIFICATION", last_error: `Reponse FNE perdue (${result.errorClass})` })
        .eq("id", invoice.id);
      await sendFneAlert(
        "Facture FNE en attente de verification manuelle",
        `<p>Facture ${invoice.internal_number} (${invoice.total_ttc_local} XOF) : la reponse de la DGI ne nous est ` +
          `jamais parvenue (${result.errorClass}). Verifiez manuellement dans l'espace FNE si elle a ete certifiee.</p>`
      );
      return success({ processed: true, invoiceId: invoice.id, outcome: "NEEDS_VERIFICATION" });
    }

    if (result.outcome === "permanent") {
      await supabase
        .from("invoices")
        .update({ state: "NEEDS_FIX", last_error: `HTTP ${result.status} (${result.errorClass})` })
        .eq("id", invoice.id);
      await sendFneAlert(
        "Facture FNE rejetee (NEEDS_FIX)",
        `<p>Facture ${invoice.internal_number} rejetee par la DGI : HTTP ${result.status} - ${JSON.stringify(result.body)}.</p>`
      );
      return success({ processed: true, invoiceId: invoice.id, outcome: "NEEDS_FIX" });
    }

    // outcome === "retryable"
    if (result.errorClass === "http_401") {
      const { count: prior401 } = await supabase
        .from("fne_submissions")
        .select("id", { count: "exact", head: true })
        .eq("invoice_id", invoice.id)
        .eq("error_class", "http_401")
        .neq("id", submission.id);

      if ((prior401 ?? 0) >= 1) {
        await supabase
          .from("invoices")
          .update({ state: "NEEDS_FIX", last_error: "Cle API FNE invalide (401 repete)" })
          .eq("id", invoice.id);
        await sendFneAlert(
          "Cle API FNE invalide",
          `<p>La DGI a rejete la cle API FNE deux fois de suite pour la facture ${invoice.internal_number}. ` +
            `Verifiez la cle dans le Vault (${config.api_key_ref}).</p>`
        );
        return success({ processed: true, invoiceId: invoice.id, outcome: "NEEDS_FIX" });
      }
    }

    const delayMs = nextAttemptDelayMs(invoice.attempt_count);
    if (delayMs === null || invoice.attempt_count >= MAX_ATTEMPTS) {
      await supabase
        .from("invoices")
        .update({ state: "NEEDS_FIX", last_error: `Abandon apres ${invoice.attempt_count} tentatives (${result.errorClass})` })
        .eq("id", invoice.id);
      await sendFneAlert(
        "Facture FNE abandonnee apres 5 tentatives",
        `<p>Facture ${invoice.internal_number} : ${result.errorClass} repete, plus de retry automatique.</p>`
      );
      return success({ processed: true, invoiceId: invoice.id, outcome: "NEEDS_FIX" });
    }

    await supabase
      .from("invoices")
      .update({
        state: "QUEUED",
        next_attempt_at: new Date(Date.now() + delayMs).toISOString(),
        last_error: `${result.errorClass} (tentative ${invoice.attempt_count})`,
      })
      .eq("id", invoice.id);

    return success({ processed: true, invoiceId: invoice.id, outcome: "QUEUED", nextAttemptInMs: delayMs });
  } catch (err) {
    console.error("[fne-worker] Erreur inattendue:", err);
    return errors.internal(err instanceof Error ? err.message : "Erreur worker FNE inconnue");
  }
});
