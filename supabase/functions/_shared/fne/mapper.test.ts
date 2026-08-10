import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  BILLING_UNITS_PER_INVOICE,
  buildInvoicePayload,
  compareTotals,
  computeDailyLineItem,
  resolveTaxCode,
  resolveTemplate,
} from "./mapper.ts";

Deno.test("computeDailyLineItem - decoupe les 3 plans reels en 30 jours exacts", () => {
  assertEquals(computeDailyLineItem(39000), { quantity: 30, unitAmountHt: 1300 });
  assertEquals(computeDailyLineItem(69000), { quantity: 30, unitAmountHt: 2300 });
  assertEquals(computeDailyLineItem(189000), { quantity: 30, unitAmountHt: 6300 });
  assertEquals(BILLING_UNITS_PER_INVOICE, 30);
});

Deno.test("computeDailyLineItem - refuse un prix non divisible par 30", () => {
  assertThrows(() => computeDailyLineItem(40000), Error, "n'est pas divisible");
});

Deno.test("computeDailyLineItem - refuse un prix nul ou negatif", () => {
  assertThrows(() => computeDailyLineItem(0), Error, "invalide");
  assertThrows(() => computeDailyLineItem(-100), Error, "invalide");
});

Deno.test("resolveTaxCode - pilote par vat_registered, jamais code en dur", () => {
  assertEquals(resolveTaxCode(false), "TVAD");
  assertEquals(resolveTaxCode(true), "TVA");
});

Deno.test("resolveTemplate - hors Cote d'Ivoire => B2F meme avec NCC", () => {
  assertEquals(resolveTemplate({ country: "SN", ncc: "1234567X" }), "B2F");
});

Deno.test("resolveTemplate - Cote d'Ivoire avec NCC => B2B", () => {
  assertEquals(resolveTemplate({ country: "CI", ncc: "1234567X" }), "B2B");
});

Deno.test("resolveTemplate - Cote d'Ivoire sans NCC => B2C (cas nominal)", () => {
  assertEquals(resolveTemplate({ country: "CI", ncc: null }), "B2C");
});

Deno.test("buildInvoicePayload - B2C nominal, totaux TVAD coherents", () => {
  const { payload, totalHt, totalTtc, vat } = buildInvoicePayload({
    template: "B2C",
    paymentMethod: "mobile-money",
    taxCode: "TVAD",
    planPriceXof: 39000,
    planName: "Starter",
    periodLabel: "01/09/2026 au 30/09/2026",
    pointOfSale: "WEB",
    establishment: "Baobab Loyalty",
    ncc: null,
    hotelName: "Hotel Test",
    clientPhone: "0700000000",
    clientEmail: "hotel@test.ci",
    foreignCurrency: "",
    foreignCurrencyRate: 0,
  });

  assertEquals(totalHt, 39000);
  assertEquals(vat, 0);
  assertEquals(totalTtc, 39000);
  assertEquals(payload.items[0].quantity, 30);
  assertEquals(payload.items[0].amount, 1300);
  assertEquals(payload.clientNcc, undefined);
});

Deno.test("buildInvoicePayload - B2B exige un NCC", () => {
  assertThrows(
    () =>
      buildInvoicePayload({
        template: "B2B",
        paymentMethod: "mobile-money",
        taxCode: "TVAD",
        planPriceXof: 69000,
        planName: "Pro",
        periodLabel: "01/09/2026 au 30/09/2026",
        pointOfSale: "WEB",
        establishment: "Baobab Loyalty",
        ncc: null,
        hotelName: "Hotel Test",
        clientPhone: null,
        clientEmail: null,
        foreignCurrency: "",
        foreignCurrencyRate: 0,
      }),
    Error,
    "clientNcc obligatoire"
  );
});

Deno.test("buildInvoicePayload - TVA 18% calcule un total TTC coherent", () => {
  const { totalHt, totalTtc, vat } = buildInvoicePayload({
    template: "B2B",
    paymentMethod: "card",
    taxCode: "TVA",
    planPriceXof: 189000,
    planName: "Premium",
    periodLabel: "01/09/2026 au 30/09/2026",
    pointOfSale: "WEB",
    establishment: "Baobab Loyalty",
    ncc: "1234567X",
    hotelName: "Hotel Test",
    clientPhone: null,
    clientEmail: null,
    foreignCurrency: "",
    foreignCurrencyRate: 0,
  });

  assertEquals(totalHt, 189000);
  assertEquals(vat, 34020); // 189000 * 0.18
  assertEquals(totalTtc, 223020);
});

Deno.test("compareTotals - detecte le moindre ecart (D4)", () => {
  const ok = compareTotals({ totalHt: 39000, vat: 0 }, { amount: 39000, vatAmount: 0 });
  assertEquals(ok.matches, true);

  const mismatch = compareTotals({ totalHt: 39000, vat: 0 }, { amount: 39001, vatAmount: 0 });
  assertEquals(mismatch.matches, false);
  assertEquals(mismatch.deltaHt, 1);
});
