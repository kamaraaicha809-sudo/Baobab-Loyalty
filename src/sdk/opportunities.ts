/**
 * Opportunités de revenus : croise les segments d'ancienneté (clients.ts)
 * avec l'historique réel de dépense et le taux de conversion mesuré
 * (funnel.ts) pour proposer des relances concrètes et actionnables.
 *
 * Jamais de chiffre inventé : le revenu potentiel n'est calculé que si
 * l'hôtel a déjà au moins une réservation confirmée ET un taux de
 * conversion mesuré sur une campagne déjà envoyée. Sinon `potentialRevenueFcfa`
 * vaut `null` et l'opportunité (nombre de clients, action) reste affichée
 * sans montant.
 */

import { createClient } from "@/libs/supabase/client";
import { getSegmentCounts } from "./clients";

export interface RevenueOpportunity {
  segmentCode: string;
  segmentLabel: string;
  title: string;
  reasoning: string;
  clientCount: number;
  potentialRevenueFcfa: number | null;
  ctaHref: string;
}

const INACTIVITY_SEGMENTS: { code: string; label: string; title: string; reasoning: string }[] = [
  {
    code: "3-6mois",
    label: "clients inactifs depuis 3 à 6 mois",
    title: "Relancer les clients récemment inactifs",
    reasoning: "Ces clients n'ont pas réservé depuis 3 à 6 mois. Une offre de retour ciblée peut les ramener avant qu'ils n'oublient votre hôtel.",
  },
  {
    code: "6-9mois",
    label: "clients inactifs depuis 6 à 9 mois",
    title: "Reconquérir les clients avant qu'ils partent à la concurrence",
    reasoning: "Sans nouvelle de votre part depuis 6 à 9 mois, ce segment est à risque. L'IA recommande une offre de retour pour les reconquérir.",
  },
  {
    code: "9-12mois",
    label: "clients inactifs depuis 9 à 12 mois",
    title: "Agir avant le premier anniversaire d'inactivité",
    reasoning: "Ces clients approchent d'un an sans réservation. Une offre plus forte peut encore les faire revenir avant qu'il ne soit trop tard.",
  },
  {
    code: "1an+",
    label: "clients inactifs depuis plus d'un an",
    title: "Réactiver vos clients historiques",
    reasoning: "Plus d'un an sans réservation : une offre exceptionnelle est nécessaire pour relancer la relation avec ces clients.",
  },
];

/**
 * Dépense moyenne réelle par réservation (CA total confirmé / nb réservations),
 * calculée sur tout l'historique client de l'hôtel — pas une moyenne marché.
 */
async function getAverageSpendPerBookingFcfa(profileId: string): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("montant_total_depense, nombre_reservations")
    .eq("profile_id", profileId)
    .gt("nombre_reservations", 0);

  if (error) throw error;
  const rows = data ?? [];
  const totalSpend = rows.reduce((sum, r) => sum + (r.montant_total_depense || 0), 0);
  const totalBookings = rows.reduce((sum, r) => sum + (r.nombre_reservations || 0), 0);
  return totalBookings > 0 ? totalSpend / totalBookings : null;
}

/**
 * @param conversionRate Taux de conversion réel (funnel.ts::getCampaignFunnelStats),
 * `null` si l'hôtel n'a pas encore de campagne mesurable.
 */
export async function getRevenueOpportunities(
  profileId: string,
  conversionRate: number | null,
  limit = 3
): Promise<RevenueOpportunity[]> {
  const [counts, avgSpendPerBooking] = await Promise.all([
    getSegmentCounts(profileId),
    getAverageSpendPerBookingFcfa(profileId),
  ]);

  const canEstimateRevenue = avgSpendPerBooking != null && conversionRate != null && conversionRate > 0;

  return INACTIVITY_SEGMENTS.map((seg) => {
    const clientCount = counts[seg.code] ?? 0;
    return {
      segmentCode: seg.code,
      segmentLabel: seg.label,
      title: seg.title,
      reasoning: seg.reasoning,
      clientCount,
      potentialRevenueFcfa: canEstimateRevenue
        ? Math.round(clientCount * (avgSpendPerBooking as number) * (conversionRate as number))
        : null,
      ctaHref: `/dashboard/templates?segment=${seg.code}`,
    };
  })
    .filter((o) => o.clientCount > 0)
    .sort((a, b) => b.clientCount - a.clientCount)
    .slice(0, limit);
}

export const opportunities = { getRevenueOpportunities };
