/**
 * Mapping facture interne Baobab Loyalty -> payload FNE.
 * Arithmetique entiere XOF uniquement (D5 de la spec) : aucun float ne doit atteindre
 * la base ou le payload envoye a la DGI.
 */

import type {
  FneInvoicePayload,
  FneInvoiceItemPayload,
  Template,
  TaxCode,
  PaymentMethod,
} from "./types.ts";

/** Nombre d'unites "jour" par cycle de facturation mensuel (convention interne, permet un avoir partiel). */
export const BILLING_UNITS_PER_INVOICE = 30;

/** Arrondi documente une fois (D5) : demi vers le haut, utilise seulement si une division ne tombe pas juste. */
export function roundHalfUp(value: number): number {
  return Math.round(value);
}

/**
 * Decoupe le prix mensuel d'un plan (entier XOF) en 30 unites "jour".
 * Leve une erreur si le prix n'est pas divisible par 30 : plutot que de laisser
 * un total_ht_local diverger silencieusement du montant reellement encaisse par
 * Moneroo, on force les prix de plans a rester des multiples de 30 (a arbitrer
 * au moment de la conception du pricing, pas apres coup - D6).
 */
export function computeDailyLineItem(planPriceXof: number): {
  quantity: number;
  unitAmountHt: number;
} {
  if (!Number.isInteger(planPriceXof) || planPriceXof <= 0) {
    throw new Error(`Prix de plan invalide (doit etre un entier XOF positif) : ${planPriceXof}`);
  }
  if (planPriceXof % BILLING_UNITS_PER_INVOICE !== 0) {
    throw new Error(
      `Le prix du plan (${planPriceXof} XOF) n'est pas divisible par ${BILLING_UNITS_PER_INVOICE} jours ; ` +
        `ajuste le prix du plan pour permettre un avoir partiel exact.`
    );
  }
  return {
    quantity: BILLING_UNITS_PER_INVOICE,
    unitAmountHt: planPriceXof / BILLING_UNITS_PER_INVOICE,
  };
}

/** Regime TVA pilote par config (fne_config.vat_registered), jamais code en dur. */
export function resolveTaxCode(vatRegistered: boolean): TaxCode {
  return vatRegistered ? "TVA" : "TVAD";
}

/**
 * Determine le template FNE a partir du profil hotelier.
 * Pas de notion d'entite gouvernementale dans Baobab Loyalty (pas de clients B2G) :
 * seuls B2F (hors Cote d'Ivoire), B2B (avec NCC) et B2C (defaut) sont produits ici.
 */
export function resolveTemplate(profile: { country: string; ncc: string | null }): Template {
  if (profile.country !== "CI") return "B2F";
  if (profile.ncc) return "B2B";
  return "B2C";
}

export interface BuildPayloadArgs {
  template: Template;
  paymentMethod: PaymentMethod;
  taxCode: TaxCode;
  planPriceXof: number;
  planName: string;
  periodLabel: string; // ex. "01/09/2026 au 30/09/2026"
  pointOfSale: string;
  establishment: string;
  ncc: string | null;
  hotelName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  foreignCurrency: "" | "XOF";
  foreignCurrencyRate: number;
}

export function buildInvoicePayload(args: BuildPayloadArgs): {
  payload: FneInvoicePayload;
  totalHt: number;
  totalTtc: number;
  vat: number;
} {
  const { quantity, unitAmountHt } = computeDailyLineItem(args.planPriceXof);

  if (args.template === "B2B" && !args.ncc) {
    throw new Error("clientNcc obligatoire pour le template B2B");
  }

  const item: FneInvoiceItemPayload = {
    taxes: [args.taxCode],
    reference: "BAOBAB-SUB",
    description: `Abonnement Baobab Loyalty ${args.planName} — ${args.periodLabel}`,
    quantity,
    amount: unitAmountHt,
    discount: 0,
    measurementUnit: "jour",
  };

  const totalHt = quantity * unitAmountHt;
  const vat = args.taxCode === "TVAD" || args.taxCode === "TVAC" ? 0 : roundHalfUp(totalHt * (args.taxCode === "TVA" ? 0.18 : 0.09));
  const totalTtc = totalHt + vat;

  const payload: FneInvoicePayload = {
    invoiceType: "sale",
    paymentMethod: args.paymentMethod,
    template: args.template,
    isRne: false,
    ...(args.template === "B2B" ? { clientNcc: args.ncc!, clientCompanyName: args.hotelName } : {}),
    ...(args.clientPhone ? { clientPhone: args.clientPhone } : {}),
    ...(args.clientEmail ? { clientEmail: args.clientEmail } : {}),
    pointOfSale: args.pointOfSale,
    establishment: args.establishment,
    commercialMessage: `Abonnement ${args.planName}`,
    footer: "Facture generee automatiquement - support@baobabloyalty.com",
    foreignCurrency: args.foreignCurrency,
    foreignCurrencyRate: args.foreignCurrencyRate,
    items: [item],
    discount: 0,
  };

  return { payload, totalHt, totalTtc, vat };
}

/**
 * Compare les totaux locaux aux totaux recalcules par la FNE (D4 : la FNE est la
 * source de verite). Tout ecart, meme de 1 XOF, doit bloquer la livraison de la facture.
 */
export function compareTotals(
  local: { totalHt: number; vat: number },
  fne: { amount: number; vatAmount: number }
): { matches: boolean; deltaHt: number; deltaVat: number } {
  const deltaHt = fne.amount - local.totalHt;
  const deltaVat = fne.vatAmount - local.vat;
  return { matches: deltaHt === 0 && deltaVat === 0, deltaHt, deltaVat };
}
