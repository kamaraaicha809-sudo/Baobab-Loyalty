# AUDIT FINAL — Baobab Loyalty

**Date :** 25 mars 2026
**Projet :** Baobab Loyalty Kodefast
**Supabase :** nsohqxohmxeklejdltip (eu-west-1) — ACTIVE_HEALTHY

---

## VERDICT : ❌ PAS PRÊT

**3 blocages critiques** doivent être résolus avant tout partage public.

---

## 1 — Supabase & Authentification

### ❌ CRITIQUE — Schéma public vide (migrations non appliquées)

**Problème :** Le projet Supabase est actif mais le schéma `public` est complètement vide. Les 17 migrations SQL présentes dans `supabase/migrations/` n'ont jamais été appliquées sur la base de données.
Aucune table n'existe : pas de `profiles`, `clients`, `reservations`, `campaigns`, etc.
L'application plantera dès la première requête réelle.

**Correction :**
```bash
supabase link --project-ref nsohqxohmxeklejdltip
supabase db push
```
Ou appliquer manuellement chaque fichier `supabase/migrations/00X_*.sql` via le SQL Editor Supabase Dashboard.

---

### ❌ CRITIQUE — `billing-webhook` bloqué par verify_jwt

**Problème :** La fonction `billing-webhook` a `verify_jwt: true` dans Supabase, mais les webhooks Moneroo n'envoient **jamais** de JWT. Supabase rejettera toutes les requêtes avec une erreur 401 **avant** que le code ne s'exécute.
Conséquence : aucun paiement ne sera jamais confirmé. La base de données ne sera jamais mise à jour après un achat réussi.

**Correction :** Désactiver `verify_jwt` pour cette fonction uniquement :
```bash
supabase functions deploy billing-webhook --no-verify-jwt
```
La fonction gère elle-même la sécurité via la vérification HMAC-SHA256 de la signature `x-moneroo-signature`.

---

### ❌ CRITIQUE — `config-get` bloqué par verify_jwt

**Problème :** La fonction `config-get` est documentée comme publique ("Auth: Not required") et lit des données de configuration de l'app (`app_config`). Mais elle a `verify_jwt: true`, ce qui signifie que toutes les requêtes sans JWT seront bloquées par Supabase.
Cette fonction est appelée depuis la landing page (publique, sans utilisateur connecté).

**Correction :**
```bash
supabase functions deploy config-get --no-verify-jwt
```

---

### ⚠️ RLS — Non vérifiable (schéma vide)

Le schéma public étant vide, il est impossible de vérifier l'état du RLS. Après application des migrations, vérifier que :
- RLS activé sur toutes les tables (`rowsecurity = true`)
- Aucune policy `USING (true)` sur INSERT, UPDATE, DELETE
- La policy démo (`user_id = 'demo-user-id'`) est supprimée si le mode démo est retiré

---

### ✅ Variables d'environnement `.env.local`

Toutes renseignées et cohérentes :
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_DEMO_MODE=false` ✅
- `SITE_URL=https://baobab-loyalty.com` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (côté serveur uniquement)

---

### ✅ Edge Functions déployées (15/15)

Toutes les fonctions sont déployées et en statut `ACTIVE` :

| Fonction | Statut | verify_jwt |
|----------|--------|------------|
| ai-generate | ACTIVE | ✅ true |
| billing-create-checkout | ACTIVE | ✅ true |
| billing-create-portal | ACTIVE | ✅ true |
| billing-webhook | ACTIVE | ❌ true (doit être false) |
| config-get | ACTIVE | ❌ true (doit être false) |
| config-update | ACTIVE | ✅ true |
| email-send | ACTIVE | ✅ true |
| linkedin-to-template | ACTIVE | ✅ true |
| prompts-create | ACTIVE | ✅ true |
| prompts-delete | ACTIVE | ✅ true |
| prompts-list | ACTIVE | ✅ true |
| prompts-update | ACTIVE | ✅ true |
| storage-delete | ACTIVE | ✅ true |
| storage-upload | ACTIVE | ✅ true |
| user-get-profile | ACTIVE | ✅ true |

---

### ✅ Auth — Middleware et layouts protégés

- `middleware.ts` : appelle `updateSession()` sur toutes les routes ✅
- `app/dashboard/layout.tsx` : vérifie `supabase.auth.getUser()` et redirige si non-auth ✅
- Toutes les Edge Functions utilisent `requireAuth()` ou `requireAdmin()` ✅

---

### ⚠️ Templates emails Supabase — Test manuel requis

Vérifier dans le Dashboard Supabase > Authentication > Email Templates que :
- L'email de confirmation utilise l'URL `https://baobab-loyalty.com/auth/callback`
- L'email de reset password utilise l'URL `https://baobab-loyalty.com/auth/callback`
- Les templates sont en français et aux couleurs de Baobab Loyalty
- Les redirect URLs pointent vers `https://baobab-loyalty.com` (pas localhost)

---

### ⚠️ SERVICE_ROLE_KEY — Non exposée côté client ✅

`SUPABASE_SERVICE_ROLE_KEY` n'est utilisée que dans :
- `supabase/functions/email-send/index.ts` (serveur Deno)
- `supabase/functions/_shared/auth.ts` (serveur Deno)
- `app/offre/` (serveur Next.js uniquement, pas dans le bundle client)

---

## 2 — Sécurité

### ✅ `.env.local` dans `.gitignore`

`.gitignore` couvre `.env.local` et tous les `*.local`. Aucun secret ne sera commité. ✅

---

### ✅ Aucune clé API en dur dans le code

Vérification complète du code source : aucun pattern `sk-`, `pk_`, `whsec_`, ou JWT encodé en dur. Tous les secrets passent par `.env` ou Supabase Vault. ✅

---

### ✅ Variables NEXT_PUBLIC_ — Exposition correcte

Seules `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEMO_MODE` et `NEXT_PUBLIC_SITE_URL` sont exposées au client. La `SERVICE_ROLE_KEY` n'a pas de préfixe `NEXT_PUBLIC_`. ✅

---

### ⚠️ CORS — Fallback potentiellement incorrect

**Problème modéré :** Dans `supabase/functions/_shared/cors.ts`, le fallback hardcodé est `"https://baobabloyalty.com"` (sans tiret), mais le vrai domaine est `"https://baobab-loyalty.com"` (avec tiret).
Ce n'est un problème que si la variable `SITE_URL` n'est pas définie dans le Vault Supabase. À priorité basse si SITE_URL est correctement configuré.

**Correction :** Vérifier que `SITE_URL=https://baobab-loyalty.com` est bien dans le Vault Supabase, ou corriger le fallback dans `cors.ts`.

---

### ⚠️ Protection mots de passe compromis — Désactivée

Supabase recommande d'activer la vérification HaveIBeenPwned pour les mots de passe.
**Correction :** Dashboard Supabase > Authentication > Password Security > Activer "Leaked Password Protection". ✅ Simple à activer.

---

### ✅ Aucun console.log côté client

Zéro violation dans `app/`, `components/`, `src/`. ✅
Quelques `console.error` dans les Edge Functions Deno (côté serveur uniquement, non visible au client) — acceptable.

---

### ✅ Pages protégées redirigent vers /signin

Le `dashboard/layout.tsx` redirige vers `/signin` si l'utilisateur n'est pas authentifié. ✅

---

## 3 — UX & Responsive

### ✅ Landing page complète

- Titre clair et proposition de valeur ✅
- CTA "S'inscrire" visible ✅
- Section pricing avec les 3 plans en FCFA (29 000 / 49 000 / 69 000) ✅
- Plan "Croissance" mis en avant (POPULAIRE) ✅

---

### ✅ Pages légales présentes

| Page | URL | Statut |
|------|-----|--------|
| Politique de confidentialité | `/privacy-policy` | ✅ RGPD-compatible |
| Conditions d'utilisation | `/tos` | ✅ |

---

### ✅ Pages 404 et 500 personnalisées

- `app/not-found.tsx` ✅
- `app/error.tsx` ✅ (root + dashboard + admin)

---

### ✅ Images avec next/image

Aucune balise `<img>` HTML brute trouvée dans `app/` et `components/`. ✅

---

### ✅ SEO configuré

| Élément | Valeur |
|---------|--------|
| Title | "Baobab Loyalty" |
| Description | Aide les propriétaires d'hôtels à remplir leurs chambres vides... |
| metadataBase | `NEXT_PUBLIC_SITE_URL` ou `https://baobab-loyalty.com/` |
| OG Image | `app/icon.tsx` (généré dynamiquement, logo "B" doré) |
| Twitter Card | summary_large_image |
| Robots | index + follow |
| Structured Data | SoftwareApplication schema (LD+JSON) |

---

### ✅ Favicon personnalisé

`app/icon.tsx` génère dynamiquement un favicon PNG 32x32 avec le logo "B" doré (#EBC161) sur fond noir (#2C2C2C). ✅

---

### ⚠️ États de chargement, vides et erreurs — Test manuel requis

À vérifier manuellement :
- Skeleton loaders sur le dashboard et les pages de données
- États vides (0 clients, 0 campagnes) avec messages explicatifs
- Messages d'erreur formulaires (signin, signup, import CSV)

---

### ⚠️ `npm run build` — Test manuel requis

Le build doit être lancé manuellement pour vérifier l'absence d'erreurs TypeScript et de warnings Next.js :
```bash
npm run build
```

---

## 4 — Déploiement

### ⚠️ Variables Vercel — Vérification manuelle requise

Vérifier dans le Dashboard Vercel > Settings > Environment Variables que ces variables sont présentes :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL=https://baobab-loyalty.com`
- `SUPABASE_SERVICE_ROLE_KEY` (pour `/offre` API)
- `NEXT_PUBLIC_DEMO_MODE=false`

---

### ⚠️ Domaine Resend — Vérification manuelle requise

Vérifier dans le Dashboard Resend que :
- Le domaine `baobab-loyalty.com` est vérifié (DNS TXT/DKIM configurés)
- Un test d'envoi depuis `noreply@baobab-loyalty.com` fonctionne
- L'email de bienvenue à l'inscription arrive bien en boîte de réception (pas spam)

---

### ⚠️ Domaine final — Vérification manuelle requise

- Vérifier que `https://baobab-loyalty.com` est accessible
- HTTP → HTTPS redirige automatiquement
- Certificat SSL valide

---

## Plan de corrections par priorité

### Priorité 1 — Bloquant (à faire MAINTENANT, ~30 min)

| # | Action | Commande |
|---|--------|----------|
| 1 | Appliquer les 17 migrations SQL | `supabase db push` ou SQL Editor |
| 2 | Désactiver verify_jwt sur billing-webhook | `supabase functions deploy billing-webhook --no-verify-jwt` |
| 3 | Désactiver verify_jwt sur config-get | `supabase functions deploy config-get --no-verify-jwt` |

### Priorité 2 — Important (à faire avant le premier utilisateur, ~15 min)

| # | Action |
|---|--------|
| 4 | Activer "Leaked Password Protection" dans Supabase Auth |
| 5 | Vérifier les templates emails Supabase (URLs, langue, branding) |
| 6 | Vérifier les redirect URLs d'authentification (pas localhost) |
| 7 | Confirmer que `SITE_URL` est dans le Vault Supabase (fix CORS fallback) |

### Priorité 3 — Vérifications manuelles (~20 min)

| # | Action |
|---|--------|
| 8 | Lancer `npm run build` et corriger les erreurs éventuelles |
| 9 | Vérifier variables d'environnement sur Vercel |
| 10 | Vérifier domaine Resend vérifié et test d'envoi réel |
| 11 | Tester le flux complet : inscription → dashboard → campagne |
| 12 | Vérifier responsive sur mobile |

---

## Ce qui est bon

| Domaine | Statut |
|---------|--------|
| 15 Edge Functions déployées | ✅ Toutes ACTIVE |
| Aucun secret en dur dans le code | ✅ |
| .env.local dans .gitignore | ✅ |
| SERVICE_ROLE_KEY non exposée au client | ✅ |
| Aucun console.log côté client | ✅ |
| SEO title, description, og:image | ✅ Configuré |
| Pages légales (privacy, CGU) | ✅ Présentes |
| Pages 404 et 500 personnalisées | ✅ Présentes |
| Favicon personnalisé (logo "B" doré) | ✅ |
| Mode DEMO désactivé | ✅ (NEXT_PUBLIC_DEMO_MODE=false) |
| Pricing en FCFA | ✅ Correct |
| CORS sans wildcard * | ✅ Restrictif |
| SDK Pattern respecté | ✅ Aucun fetch direct |
| Images via next/image | ✅ |
| Middleware auth | ✅ Toutes les routes protégées |

---

*Rapport généré le 25 mars 2026 par audit automatisé (code source + MCP Supabase)*
