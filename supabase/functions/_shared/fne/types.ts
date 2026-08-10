/**
 * Types stricts pour le connecteur FNE (Facture Normalisee Electronique - DGI Cote d'Ivoire)
 * Unions litterales uniquement - jamais de `string` brut sur les champs enumeres (annexe 1 DGI).
 */

export type InvoiceType = "sale" | "purchase";

export type PaymentMethod = "cash" | "card" | "check" | "mobile-money" | "transfer" | "deferred";

export type Template = "B2B" | "B2C" | "B2G" | "B2F";

export type TaxCode = "TVA" | "TVAB" | "TVAC" | "TVAD";

export type ForeignCurrency =
  | ""
  | "XOF"
  | "USD"
  | "EUR"
  | "JPY"
  | "CAD"
  | "GBP"
  | "AUD"
  | "CNH"
  | "CHF"
  | "HKD"
  | "NZD";

export interface FneInvoiceItemPayload {
  taxes: TaxCode[];
  reference: string;
  description: string;
  quantity: number;
  amount: number; // prix unitaire HT, entier XOF
  discount: number;
  measurementUnit: string;
}

export interface FneInvoicePayload {
  invoiceType: InvoiceType;
  paymentMethod: PaymentMethod;
  template: Template;
  isRne: boolean;
  clientNcc?: string; // obligatoire si template === "B2B"
  clientCompanyName?: string;
  clientPhone?: string;
  clientEmail?: string;
  pointOfSale: string;
  establishment: string;
  commercialMessage?: string;
  footer?: string;
  foreignCurrency: ForeignCurrency;
  foreignCurrencyRate: number;
  items: FneInvoiceItemPayload[];
  discount: number;
}

export interface FneInvoiceItemResponse {
  id: string; // fne_item_id - a persister, indispensable pour un avoir futur
}

export interface FneCertificationResponse {
  ncc: string;
  reference: string;
  token: string; // verification_url
  warning: boolean;
  balance_sticker: number;
  invoice: {
    id: string; // fne_invoice_id (uuid) - PAS la reference
    amount: number;
    vatAmount: number;
    items: FneInvoiceItemResponse[];
  };
}

export interface FneRefundItem {
  id: string; // fne_item_id
  quantity: number;
}

export interface FneRefundResponse {
  reference: string; // prefixee "A"
  token?: string;
  balance_sticker?: number;
}

/** Classification des echecs HTTP - decide si un retry automatique est acceptable (spec §6). */
export type ErrorClass = "retryable" | "permanent" | "indeterminate";
