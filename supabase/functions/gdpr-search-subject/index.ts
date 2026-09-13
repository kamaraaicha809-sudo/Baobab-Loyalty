/**
 * gdpr-search-subject
 * Recherche un client au sein du PROPRE hôtel de l'appelant, pour l'étape
 * d'identification/vérification d'une demande RGPD (Art. 12).
 *
 * Auth: Required (owner/admin uniquement — même convention que
 * data_subject_requests, réservé aux rôles habilités à traiter une demande RGPD).
 * Method: POST
 * Body: { query: string }
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";
import { resolveProfile } from "../_shared/team.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (query.length < 2) return errors.badRequest("La recherche doit contenir au moins 2 caractères.");

    const { profile, teamRole } = await resolveProfile<{ id: string }>(userClient, user.id, "id");
    if (!profile) return errors.forbidden("Profil introuvable.");
    if (teamRole !== "owner" && teamRole !== "admin") {
      return errors.forbidden("Seul le propriétaire ou un administrateur peut traiter une demande RGPD.");
    }

    // RLS limite déjà cette requête aux clients du propre hôtel de
    // l'appelant (policy sur clients) — le filtre .eq("profile_id", ...)
    // ci-dessous documente cette portée plutôt que de s'y substituer.
    const like = `%${query}%`;
    const { data, error } = await userClient
      .from("clients")
      .select("id, nom, email, telephone, whatsapp, derniere_visite, anonymized, processing_restricted")
      .eq("profile_id", profile.id)
      .or(`nom.ilike.${like},email.ilike.${like},telephone.ilike.${like},whatsapp.ilike.${like}`)
      .limit(20);

    if (error) return errors.internal(error.message);

    return success({ results: data ?? [] });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Erreur interne");
  }
});
