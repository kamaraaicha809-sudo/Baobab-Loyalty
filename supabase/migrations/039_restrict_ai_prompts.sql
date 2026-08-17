-- Migration 039: Restreint la lecture publique de ai_prompts
--
-- "Public can read ai_prompts" (migration 002) + le GRANT SELECT par défaut
-- à anon (migration 026) permettaient à n'importe qui possédant la clé anon
-- publique de lire l'intégralité des prompts systèmes IA de Baobab Loyalty
-- (savoir-faire marketing/prompt engineering). Tous les accès légitimes
-- passent déjà par des Edge Functions avec service_role (ai-generate,
-- linkedin-to-template, prompts-list/create/update/delete) — la policy
-- "Service role can manage ai_prompts" (migration 002) couvre déjà ce cas,
-- donc la lecture publique n'est plus nécessaire.

DROP POLICY IF EXISTS "Public can read ai_prompts" ON public.ai_prompts;
