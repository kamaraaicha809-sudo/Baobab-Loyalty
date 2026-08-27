/**
 * profile-activate-beta-trial
 * Active l'essai beta (14 jours) pour un hotel qui vient de s'inscrire via
 * /signup?ref=beta.
 *
 * Doit passer par le service role : is_beta_tester et trial_ends_at sont
 * volontairement exclus du GRANT UPDATE accorde a "authenticated"
 * (migration 044_restrict_profiles_columns.sql), pour empecher un compte de
 * s'auto-attribuer de l'acces gratuit en appelant l'API REST directement.
 * Cette fonction est donc le SEUL chemin possible pour poser ce flag, avec
 * deux garde-fous anti-abus :
 *   - idempotent : si is_beta_tester est deja true, ne fait rien (empeche
 *     de rappeler cette fonction pour prolonger indefiniment l'essai)
 *   - fenetre de temps : uniquement dans les 30 minutes suivant la creation
 *     du compte (empeche un hotel dont l'essai de 30 jours est deja expire
 *     d'appeler directement cette fonction pour s'offrir 14 jours de plus)
 *
 * Auth: Required (JWT)
 * Method: POST
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

const ACTIVATION_WINDOW_MS = 30 * 60 * 1000;
const BETA_TRIAL_DAYS = 14;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return errors.unauthorized(authError || "Authentication required");
    }

    const supabase = getServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_beta_tester")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return errors.notFound("Profil introuvable");
    }

    if (profile.is_beta_tester) {
      return success({ activated: false, alreadyActive: true });
    }

    const { data: authUserData } = await supabase.auth.admin.getUserById(user.id);
    const createdAt = authUserData?.user?.created_at ? new Date(authUserData.user.created_at).getTime() : null;
    if (!createdAt || Date.now() - createdAt > ACTIVATION_WINDOW_MS) {
      return errors.forbidden("Cette activation n'est plus disponible pour ce compte.");
    }

    const trialEndsAt = new Date(Date.now() + BETA_TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_beta_tester: true, trial_ends_at: trialEndsAt })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return success({ activated: true, trialEndsAt });
  } catch (err) {
    return errors.internal(err instanceof Error ? err.message : "Activation failed");
  }
});
