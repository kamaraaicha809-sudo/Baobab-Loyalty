import config from "@/config";

/**
 * Formate un montant selon la devise du déploiement (config.billing.currency).
 * Le format FCFA reproduit exactement celui déjà utilisé partout dans le
 * dashboard (`${amount.toLocaleString("fr-FR")} FCFA`) — aucun changement de
 * comportement pour l'Afrique. Le format EUR n'est utilisé que lorsque
 * config.region === "europe" (NEXT_PUBLIC_REGION=europe).
 */
export function formatCurrency(amount: number, currency: "FCFA" | "EUR" = config.billing.currency === "EUR" ? "EUR" : "FCFA"): string {
  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
