# CHECKLIST PRE-DEPLOIEMENT SUPABASE - Baobab Loyalty

**Date :** 2026-03-19
**Environnement :** Supabase (PostgreSQL + Edge Functions Deno)

---

## LEGENDE

| Icone | Signification |
|-------|---------------|
| ✅ | OK - Passe |
| ❌ | Echec - A corriger |
| ⚠️ | Attention - A verifier |

---

## 1. ROW LEVEL SECURITY (RLS)

| Table | RLS Active | Policies | Statut |
|-------|-----------|----------|--------|
| `profiles` | ✅ | ✅ Lecture/ecriture owner | ✅ |
| `clients` | ✅ | ✅ Lecture/ecriture owner | ✅ |
| `reservations` | ✅ | ✅ Lecture/ecriture owner | ✅ |
| `room_types` | ✅ (mig 015) | ✅ Owner + service role | ✅ |
| `offers` | ✅ (mig 015) | ✅ Owner + service role | ✅ |
| `segment_offers` | ✅ (mig 015) | ✅ Via offer + service role | ✅ |
| `campaigns` | ✅ (mig 015) | ✅ Owner + service role | ✅ |
| `sent_messages` | ✅ (mig 015) | ✅ Owner + service role | ✅ |
| `redemptions` | ✅ (mig 015) | ✅ Owner + service role | ✅ |
| `segments` | ✅ (mig 006) | ✅ Lecture publique + service role | ✅ |
| `message_templates` | ✅ (mig 016) | ✅ Owner + demo + service role | ✅ |

**Resultat : ✅ 11/11 tables proteges par RLS**

---

## 2. EDGE FUNCTIONS - AUTHENTIFICATION

| Fonction | Auth | Admin | CORS | Demo Mode | Statut |
|----------|------|-------|------|-----------|--------|
| `config-get` | Non (public) | — | ✅ | Non applicable | ✅ |
| `config-update` | ✅ requireAdmin | ✅ | ✅ | ❌ Manquant | ⚠️ |
| `prompts-create` | ✅ requireAdmin | ✅ | ✅ | ❌ Manquant | ⚠️ |
| `prompts-delete` | ✅ requireAdmin | ✅ | ✅ | ❌ Manquant | ⚠️ |
| `prompts-update` | ✅ requireAdmin | ✅ | ✅ | ❌ Manquant | ⚠️ |
| `prompts-list` | ✅ requireAdmin | ✅ | ✅ | ✅ Bypass demo | ✅ |
| `storage-delete` | ✅ requireAuth | — | ✅ | ❌ Manquant | ⚠️ |
| `storage-upload` | ✅ requireAuth | — | ✅ | ❌ Manquant | ⚠️ |
| `user-get-profile` | ✅ requireAuth | — | ✅ | ❌ Manquant | ⚠️ |
| `billing-create-portal` | ✅ requireAuth | — | ✅ | ❌ Manquant | ⚠️ |
| `billing-create-checkout` | ✅ requireAuth | — | ✅ | ❌ CRITIQUE | ❌ |
| `billing-webhook` | ✅ Signature Moneroo | — | ✅ | Non applicable | ✅ |
| `ai-generate` | ✅ requireAuth | — | ✅ | ✅ Bypass demo | ✅ |
| `email-send` | ✅ Service role key | — | ✅ | Non applicable | ✅ |
| `linkedin-to-template` | ✅ requireAuth | — | ✅ | ✅ Bypass demo | ✅ |

**Resultat : ✅ 15/15 avec authentification — ❌ 1 critique (billing-checkout) — ⚠️ 8 sans protection demo**

---

## 3. CORS

| Verification | Statut | Detail |
|--------------|--------|--------|
| Header `Access-Control-Allow-Origin` | ✅ | `*` (acceptable pour API publique) |
| Header `Access-Control-Allow-Headers` | ❌ | Manque `x-http-method` |
| Header `Access-Control-Allow-Methods` | ✅ | GET, POST, PUT, DELETE, OPTIONS |
| Preflight OPTIONS traite | ✅ | Toutes les fonctions |

---

## 4. VARIABLES D'ENVIRONNEMENT

### `.env.local` (Frontend)

| Variable | Valeur | Statut |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://qrvaobppumaovovdcjkv.supabase.co | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... | ✅ |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | ❌ Doit etre `false` en prod |
| `SITE_URL` | `https://example.com` | ❌ Placeholder - a remplacer |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... | ✅ (cote serveur uniquement) |

### Supabase Vault (Edge Functions)

| Variable | Statut |
|----------|--------|
| `STRIPE_SECRET_KEY` | A verifier dans le Vault |
| `STRIPE_WEBHOOK_SECRET` | A verifier dans le Vault |
| `RESEND_API_KEY` | A verifier dans le Vault |
| `OPENROUTER_API_KEY` | A verifier dans le Vault |
| `DEMO_MODE` | ⚠️ A mettre `false` en prod |

---

## 5. MODE DEMO - ETAT GLOBAL

| Verification | Statut | Detail |
|--------------|--------|--------|
| `NEXT_PUBLIC_DEMO_MODE=false` en prod | ❌ | Actuellement `true` dans .env.local |
| Fichier `src/lib/demo.ts` present | ⚠️ | 260 lignes - ok si non charge en prod |
| Traces demo dans le code | ⚠️ | 52 fichiers references demo mode |
| Page `/app/demo` | ⚠️ | A verifier si accessible en prod |
| Edge Functions : bypass demo | ❌ | 8 fonctions sans protection |

---

## 6. SECURITE GENERALE

| Verification | Statut | Detail |
|--------------|--------|--------|
| Pas de secrets hardcodes | ✅ | Toujours via env vars |
| SERVICE_ROLE_KEY cote serveur | ✅ | `libs/supabase/admin.ts` uniquement |
| email-send : comparaison exacte | ✅ | Corrige (=== vs .includes) |
| billing-webhook : protection replay | ✅ | Corrige (verification timestamp 5min) |
| Storage : whitelist types fichiers | ✅ | Impl dans storage-upload |
| Storage : limite taille 10MB | ✅ | Impl dans storage-upload |
| `.env.local` non commite | ✅ | Dans .gitignore |

---

## 7. MIGRATIONS SQL

| Verification | Statut | Detail |
|--------------|--------|--------|
| Numerotation sequentielle | ✅ | 001 → 016 |
| RLS dans les migrations | ✅ | Toutes les tables via mig 015 |
| Indexes sur FK | ✅ | Presents dans chaque migration |
| Triggers `updated_at` | ✅ | Presents dans les tables avec updates |
| Fonction `moddatetime()` | ✅ | Corrige dans mig 016 |
| `get_segment_counts()` SECURITY DEFINER | ✅ | Avec search_path securise |
| `get_reservations_chart()` SECURITY DEFINER | ✅ | Avec search_path securise |

---

## SYNTHESE

### ❌ BLOQUANT (corriger avant deploiement)

| # | Probleme | Fichier | Impact |
|---|---------|---------|--------|
| B1 | `billing-create-checkout` sans demo mode — paiements reels possibles | `billing-create-checkout/index.ts` | CRITIQUE |
| B2 | `NEXT_PUBLIC_DEMO_MODE=true` en production | `.env.local` | CRITIQUE |
| B3 | `SITE_URL=https://example.com` — placeholder | `.env.local` | IMPORTANT |

### ⚠️ IMPORTANT (corriger avant ou juste apres deploiement)

| # | Probleme | Fichier | Impact |
|---|---------|---------|--------|
| I1 | 8 Edge Functions sans protection demo mode | config-update, prompts-*, storage-*, user-get-profile, billing-create-portal | MOYEN |
| I2 | CORS : header `x-http-method` manquant | `_shared/cors.ts` | MOYEN |
| I3 | Verifier les secrets dans le Vault Supabase | Dashboard Supabase | MOYEN |

### RECOMMANDE (ameliorations optionnelles)

| # | Suggestion | Detail |
|---|-----------|--------|
| R1 | Supprimer la page `/app/demo` en prod | Route non necessaire en prod |
| R2 | Valider que `config-get` ne retourne pas de donnees sensibles | Verifier les donnees de la table app_config |

---

## PLAN DE CORRECTIONS PROPOSE

### Correction B1 — billing-create-checkout : protection demo mode

```typescript
// Ajouter au debut de la fonction (apres CORS preflight)
const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
if (isDemoMode) {
  return errors.forbidden("Payments are disabled in demo mode");
}
```

### Correction B2 — .env.local : desactiver demo mode

```bash
NEXT_PUBLIC_DEMO_MODE=false
```

### Correction B3 — .env.local : corriger SITE_URL

```bash
SITE_URL=https://baobab-loyalty.com
```

### Correction I1 — Edge Functions : ajouter protection demo mode

Pour les 8 fonctions de mutation (non publiques), ajouter en debut de handler :

```typescript
const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
if (isDemoMode) {
  return errors.forbidden("This action is disabled in demo mode");
}
```

### Correction I2 — CORS : ajouter x-http-method

```typescript
// Dans _shared/cors.ts
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-http-method",
```

---

*Genere automatiquement lors de l'audit pre-deploiement Supabase*
