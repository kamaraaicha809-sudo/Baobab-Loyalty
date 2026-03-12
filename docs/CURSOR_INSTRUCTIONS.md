# Instructions Cursor AI

Ce document guide Cursor AI pour comprendre et modifier le projet Kodefast.

---

## Utilisation des MCP (Model Context Protocol)

Cursor dispose de MCP (Model Context Protocol) pour interagir directement avec les services externes. **Utilisez ces outils en priorité** pour configurer et gérer le projet.

### MCP Supabase

Cursor peut gérer Supabase directement via MCP :

| Commande | Description |
|----------|-------------|
| `mcp_supabase_list_projects` | Lister tous vos projets Supabase |
| `mcp_supabase_get_project` | Détails d'un projet (ID, URL, status) |
| `mcp_supabase_create_project` | Créer un nouveau projet |
| `mcp_supabase_list_tables` | Lister les tables d'un projet |
| `mcp_supabase_apply_migration` | Appliquer une migration SQL |
| `mcp_supabase_execute_sql` | Exécuter du SQL directement |
| `mcp_supabase_list_edge_functions` | Lister les Edge Functions |
| `mcp_supabase_deploy_edge_function` | Déployer une Edge Function |
| `mcp_supabase_get_logs` | Consulter les logs (API, auth, postgres) |
| `mcp_supabase_get_project_url` | Récupérer l'URL du projet |
| `mcp_supabase_get_publishable_keys` | Récupérer les clés API |

### Workflow de configuration recommandé

1. **Lister les projets existants**
   ```
   Utilisez mcp_supabase_list_projects pour voir vos projets
   ```

2. **Créer un projet** (si nécessaire)
   ```
   Utilisez mcp_supabase_create_project avec nom et région
   ```

3. **Appliquer les migrations**
   ```
   Utilisez mcp_supabase_apply_migration pour chaque fichier dans supabase/migrations/
   ```

4. **Déployer les Edge Functions** (IMPORTANT: verify_jwt: false)
   ```
   Utilisez mcp_supabase_deploy_edge_function avec verify_jwt: false
   ```

5. **Récupérer les clés**
   ```
   Utilisez mcp_supabase_get_publishable_keys pour obtenir l'anon key
   Mettez-la dans .env.local
   ```

### MCP pour la base de données

Pour vérifier ou modifier les données :

```
# Lister les tables
mcp_supabase_list_tables avec project_id et schemas: ["public"]

# Exécuter une requête
mcp_supabase_execute_sql avec project_id et query SQL
```

---

## Mode Demo

Le template inclut un mode demo pour tester l'interface sans configurer Supabase.

### Activer le mode demo

```env
# Dans .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

### Comportement en mode demo

- L'authentification est bypassée (middleware + layouts serveur)
- Un utilisateur fictif avec rôle `admin` est créé
- Les données affichées sont des données de test
- Les appels aux Edge Functions retournent des données mock (via SDK)
- L'admin est accessible pour explorer l'interface
- Un bandeau jaune/amber indique que le mode démo est actif

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/lib/demo.ts` | Données fictives (demoUser, demoProfile, demoSession) |
| `components/dashboard/BaseLayout.tsx` | Layout partagé Dashboard/Admin avec bypass auth en demo |
| `components/dashboard/DashboardLayout.tsx` | Wrapper Dashboard utilisant BaseLayout |
| `components/admin/AdminLayout.tsx` | Wrapper Admin utilisant BaseLayout |
| `app/dashboard/layout.tsx` | Vérification auth serveur (skip en demo) |
| `app/admin/layout.tsx` | Vérification auth + rôle admin serveur (skip en demo) |
| `libs/supabase/middleware.ts` | Skip l'auth middleware si demo ou Supabase non configuré |
| `src/sdk/user.ts` | Retourne demoProfile si demo |

---

## Architecture du Projet

### Frontend (Next.js / TypeScript)

```
app/                           # Pages avec App Router (TypeScript)
├── page.tsx                   # Homepage publique (landing page)
├── layout.tsx                 # Layout racine (fonts, CSS vars, providers)
├── globals.css                # Styles globaux + Tailwind v4 @theme
├── manifest.ts                # Web App Manifest
├── error.tsx                  # Error boundary global
├── not-found.tsx              # Page 404
├── signin/                    # Page de connexion
│   ├── layout.tsx             # Redirect si déjà connecté
│   └── page.tsx
├── signup/                    # Page d'inscription
│   └── page.tsx
├── dashboard/                 # Pages protégées (utilisateur connecté)
│   ├── layout.tsx             # Auth serveur + DashboardLayout
│   └── page.tsx
├── admin/                     # Pages admin (role = 'admin')
│   ├── layout.tsx             # Auth serveur + vérification rôle admin
│   ├── page.tsx               # Vue d'ensemble admin
│   └── ia/page.tsx            # Configuration IA admin
├── auth/                      # Callbacks d'authentification
│   ├── confirm/page.tsx       # Callback confirmation email
│   ├── reset-password/page.tsx # Demande reset password
│   ├── update-password/page.tsx # Mise à jour mot de passe
│   └── verify/page.tsx        # Vérification OTP
├── privacy-policy/page.tsx    # Politique de confidentialité
└── tos/page.tsx               # Conditions d'utilisation
```

### Composants (organisés par domaine)

```
components/
├── common/                    # Composants partagés
│   ├── Icons.tsx              # Icônes SVG centralisées
│   ├── LayoutClient.tsx       # Providers client (toast, progress bar)
│   └── Logo.tsx               # Logo de l'application
├── dashboard/                 # Composants Dashboard/Admin
│   ├── BaseLayout.tsx         # Layout de base partagé (sidebar + demo banner)
│   ├── DashboardLayout.tsx    # Wrapper pour le Dashboard
│   └── Sidebar.tsx            # Navigation latérale (desktop + mobile)
├── admin/
│   └── AdminLayout.tsx        # Wrapper pour l'Admin
├── landing/                   # Composants de la landing page
│   ├── Header.tsx             # Header avec navigation
│   ├── Hero.tsx               # Section hero
│   ├── Problem.tsx            # Section problème
│   ├── Features.tsx           # Section fonctionnalités
│   ├── Pricing.tsx            # Section tarification
│   ├── FAQ.tsx                # Section FAQ
│   ├── CTA.tsx                # Call to Action
│   └── Footer.tsx             # Pied de page
└── ui/                        # Composants UI réutilisables
    ├── ButtonCheckout.tsx     # Bouton de paiement Stripe
    ├── OTPInput.tsx           # Input code OTP
    └── PasswordStrength.tsx   # Indicateur force mot de passe
```

### Backend (Supabase Edge Functions)

**Architecture avec dossier `_shared/` partagé** — Les utilitaires communs (auth, CORS, réponses, dépendances) sont centralisés dans `_shared/` et importés par chaque fonction.

```
supabase/functions/
├── _shared/                          # Utilitaires partagés
│   ├── deps.ts                       # Dépendances centralisées (supabase-js, Stripe, valibot)
│   ├── auth.ts                       # Helpers auth (requireAuth, requireAdmin, getServiceClient)
│   ├── cors.ts                       # Headers CORS + handler preflight
│   └── response.ts                   # Format de réponse standard (success, errors)
├── billing-create-checkout/index.ts  # Checkout Stripe
├── billing-create-portal/index.ts    # Portal client Stripe
├── billing-webhook/index.ts          # Webhooks Stripe
├── user-get-profile/index.ts         # Profil utilisateur
├── ai-generate/index.ts              # Génération IA (OpenRouter)
├── email-send/index.ts               # Envoi emails (Resend)
├── prompts-list/index.ts             # Liste des prompts IA
├── prompts-create/index.ts           # Créer un prompt
├── prompts-update/index.ts           # Modifier un prompt
├── prompts-delete/index.ts           # Supprimer un prompt
├── storage-upload/index.ts           # Upload fichiers
├── storage-delete/index.ts           # Supprimer fichiers
├── config-get/index.ts               # Lire config
└── config-update/index.ts            # Modifier config
```

### Dossier `_shared/` — Détail des fichiers

| Fichier | Rôle | Exports principaux |
|---------|------|--------------------|
| `deps.ts` | Dépendances centralisées (versions uniques) | `createClient`, `User`, `SupabaseClient`, `Stripe`, `v` (valibot) |
| `auth.ts` | Vérification JWT et création de clients Supabase | `requireAuth(req)`, `requireAdmin(req)`, `getServiceClient()`, `getUserClient(token)` |
| `cors.ts` | Headers CORS et handler preflight | `corsHeaders`, `handleCors()` |
| `response.ts` | Format de réponse standardisé `{ ok, data/error }` | `success(data)`, `error(status, code, message)`, `errors.unauthorized()`, `errors.forbidden()`, `errors.badRequest()`, `errors.notFound()`, `errors.internal()` |

### SDK Frontend

Le SDK utilise `supabase.functions.invoke()` pour appeler les Edge Functions. Cela gère automatiquement :
- Le refresh token
- L'Authorization header
- Les erreurs d'auth

```
src/sdk/
├── _core.ts           # Client avec callEdgeFunction() + SdkError
├── billing.ts         # Fonctions Stripe (createCheckout, createPortal)
├── user.ts            # Profil utilisateur (getProfile, avec mode demo)
├── ai.ts              # Génération IA (generate)
├── email.ts           # Envoi emails (send)
├── prompts.ts         # Gestion prompts CRUD (list, create, update, delete)
├── storage.ts         # Upload/delete/getPublicUrl fichiers
└── index.ts           # Exports publics + types
```

### Types partagés

```
types/
└── index.ts           # Types partagés (UserProfile, User, StripePlan, FAQItem)
```

---

## Conventions de Code

### Composants React

- Fichiers en PascalCase : `MyComponent.tsx`
- Un composant par fichier
- Exports par défaut
- `"use client"` si hooks React utilisés
- Types importés depuis `@/types` pour les types partagés

```typescript
"use client";  // Si useState, useEffect, etc.

import config from "@/config";
import { User } from "@/types";

const MyComponent = () => {
  return <div>...</div>;
};

export default MyComponent;
```

### Edge Functions

- Fichiers en kebab-case : `my-function/index.ts`
- **Imports depuis `_shared/`** pour les dépendances, l'auth, les CORS et les réponses
- Réponses JSON standardisées via `success()` et `errors.*`

```typescript
/**
 * my-function
 * Description de la fonction
 *
 * Auth: Required (JWT)
 * Method: POST
 * Body: { field1, field2 }
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    // Verify authentication
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    // Logique métier avec userClient (respecte RLS)...

    return success({ result: "ok" });
  } catch (err) {
    console.error("my-function error:", err);
    return errors.internal(err instanceof Error ? err.message : "Operation failed");
  }
});
```

### Fonctions disponibles dans `_shared/auth.ts`

| Fonction | Usage |
|----------|-------|
| `requireAuth(req)` | Vérifie le JWT, retourne `{ user, userClient, error }` |
| `requireAdmin(req)` | Vérifie le JWT + rôle admin dans profiles |
| `getServiceClient()` | Client avec service role (pour webhooks, opérations admin) |
| `getUserClient(token)` | Client authentifié pour requêtes RLS |

### SDK

- TypeScript strict
- Types exportés
- Fonctions async
- Pattern namespace pour l'export

```typescript
import { callEdgeFunction } from "./_core";

export interface MyParams {
  field: string;
}

export interface MyResponse {
  result: string;
}

export async function myAction(params: MyParams): Promise<MyResponse> {
  return callEdgeFunction<MyResponse>("my-function", {
    method: "POST",
    body: params,
  });
}

// Export en namespace
export const myModule = {
  myAction,
};
```

---

## Tâches Courantes

### Ajouter une page

1. Créer le fichier dans `app/` (TypeScript) :

```typescript
// app/ma-page/page.tsx
export default function MaPage() {
  return <div>Contenu</div>;
}
```

2. Si page protégée, ajouter dans `app/ma-page/layout.tsx` :

```typescript
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import config from "@/config";
import { isDemoMode } from "@/src/lib/demo";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(config.auth.loginUrl);
  }
  
  return <>{children}</>;
}
```

> **IMPORTANT** : `createClient()` côté serveur est **async** — toujours utiliser `await createClient()`.

### Ajouter une Edge Function

1. Créer le dossier et fichier :

```bash
mkdir supabase/functions/ma-fonction
```

2. Créer `index.ts` avec la structure standard utilisant `_shared/` :

```typescript
/**
 * ma-fonction
 * Description
 *
 * Auth: Required (JWT)
 * Method: POST
 * Body: { ... }
 */

import { requireAuth } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) {
      return errors.unauthorized(authError || "Authentication required");
    }

    // Logique métier...

    return success({ result: "ok" });
  } catch (err) {
    console.error("ma-fonction error:", err);
    return errors.internal(err instanceof Error ? err.message : "Failed");
  }
});
```

3. Si besoin de Stripe ou d'autres dépendances, les importer depuis `_shared/deps.ts` :

```typescript
import { Stripe } from "../_shared/deps.ts";
import { createClient } from "../_shared/deps.ts";
```

4. Ajouter au SDK dans `src/sdk/` :

```typescript
// src/sdk/mafonction.ts
import { callEdgeFunction } from "./_core";

export interface MaFonctionParams { /* ... */ }
export interface MaFonctionResponse { /* ... */ }

export async function action(params: MaFonctionParams): Promise<MaFonctionResponse> {
  return callEdgeFunction<MaFonctionResponse>("ma-fonction", {
    method: "POST",
    body: params,
  });
}

export const mafonction = { action };
```

5. Exporter dans `src/sdk/index.ts` :

```typescript
export { mafonction } from "./mafonction";
export type { MaFonctionParams, MaFonctionResponse } from "./mafonction";
```

6. Déployer via MCP avec `verify_jwt: false` :

```
Utilisez mcp_supabase_deploy_edge_function avec verify_jwt: false
```

### Modifier la configuration

Le fichier `config.js` contient toute la configuration de l'application :

- **appName, appDescription, domainName** : Infos générales
- **colors** : `main`, `dark`, `light` + `theme` ("light"/"dark")
- **social** : Liens réseaux sociaux (twitter, linkedin)
- **resend** : Configuration emails (from, support)
- **stripe.plans** : Plans de tarification (remplacer les priceId)
- **features** : Feature flags (payments, oauth google/github)
- **auth** : URLs d'authentification (loginUrl, callbackUrl)

### Changer les couleurs

Les couleurs sont définies dans `config.js` et **injectées automatiquement** en CSS variables dans `app/layout.tsx` via un `<style>` tag. Il n'est **pas nécessaire** de modifier `globals.css` manuellement.

1. Modifier dans `config.js` :

```javascript
colors: {
  theme: "light",        // "light" ou "dark"
  main: "#VOTRE_COULEUR",
  dark: "#VERSION_FONCEE",
  light: "#VERSION_CLAIRE",
}
```

2. Les classes Tailwind disponibles automatiquement :

```
bg-primary, text-primary, border-primary
bg-primary-dark, text-primary-dark
bg-primary-light, text-primary-light
```

3. Les classes utilitaires CSS disponibles :

```
.gradient-hero          → Fond dégradé subtle pour sections
.gradient-primary       → Dégradé primary → primary-dark
.text-gradient-primary  → Texte avec dégradé
.glass-effect           → Effet verre dépoli (header)
.card-hover             → Animation hover sur les cards
```

---

## Configuration

### config.js

Fichier de configuration centralisé. Modifiez pour :
- Nom, description et domaine de l'app
- Couleurs (main, dark, light, theme)
- Plans Stripe (priceId test et live)
- Emails Resend (from, support)
- Feature flags (payments, OAuth)
- Routes d'authentification

### .env.local

Variables d'environnement. Ne jamais commit.

Variables requises :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Variables optionnelles :
```env
NEXT_PUBLIC_DEMO_MODE=true          # Active le mode démo
OPENROUTER_API_KEY=sk-or-...        # Pour la génération IA
RESEND_API_KEY=re_...               # Pour l'envoi d'emails
```

---

## Supabase Client — 3 fichiers distincts

Le template utilise `@supabase/ssr` pour gérer les cookies automatiquement dans Next.js.

| Fichier | Usage | Import | Async |
|---------|-------|--------|-------|
| `libs/supabase/client.ts` | Composants client ("use client") | `createBrowserClient` | Non |
| `libs/supabase/server.ts` | Server Components, Route Handlers | `createServerClient` + cookies | **Oui** (`await`) |
| `libs/supabase/middleware.ts` | Middleware Next.js (rafraîchir sessions) | `createServerClient` + cookies | **Oui** (`await`) |

### Côté client
```typescript
import { createClient } from "@/libs/supabase/client";
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Côté serveur (IMPORTANT: async)
```typescript
import { createClient } from "@/libs/supabase/server";
const supabase = await createClient();  // ← AWAIT obligatoire
const { data: { user } } = await supabase.auth.getUser();
```

### Middleware
```typescript
// middleware.ts (racine du projet)
import { updateSession } from "@/libs/supabase/middleware";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

Le middleware rafraîchit les sessions auth pour toutes les routes sauf les fichiers statiques. Les routes publiques (`/`, `/signin`, `/signup`, `/auth`, `/privacy-policy`, `/tos`, `/api`) ne vérifient pas l'authentification.

---

## Patterns Importants

### Appeler le SDK

```typescript
import { billing, user, ai, email, storage, prompts } from "@/src/sdk";

// Avec try/catch
try {
  const result = await billing.createCheckout({
    priceId: "price_...",
    mode: "payment",
    successUrl: window.location.origin + "/dashboard",
    cancelUrl: window.location.origin,
  });
} catch (error) {
  // error est un SdkError
  console.error(error.code, error.message);
}
```

### Modules SDK disponibles

| Module | Méthodes | Description |
|--------|----------|-------------|
| `billing` | `createCheckout(params)`, `createPortal(params)` | Paiements Stripe |
| `user` | `getProfile()` | Profil utilisateur (avec demo) |
| `ai` | `generate(params)` | Génération IA via OpenRouter |
| `email` | `send(params)` | Envoi d'emails (admin) |
| `storage` | `upload(file, bucket)`, `delete(bucket, path)`, `getPublicUrl(bucket, path)` | Gestion fichiers |
| `prompts` | `list()`, `create(params)`, `update(params)`, `delete(id)` | CRUD prompts IA |

### Toast notifications

```typescript
import toast from "react-hot-toast";

toast.success("Opération réussie");
toast.error("Une erreur est survenue");
```

---

## Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `config.js` | Configuration globale (nom, couleurs, Stripe, emails, features) |
| `middleware.ts` | Middleware Next.js (rafraîchir sessions auth) |
| `app/layout.tsx` | Layout racine (fonts, CSS variables depuis config, providers) |
| `app/globals.css` | Styles globaux + Tailwind v4 `@theme` |
| `components/common/LayoutClient.tsx` | Providers client (toast, progress bar) |
| `components/dashboard/BaseLayout.tsx` | Layout partagé Dashboard/Admin (sidebar, demo banner) |
| `components/dashboard/Sidebar.tsx` | Navigation latérale (main + admin items) |
| `libs/supabase/client.ts` | Client Supabase navigateur (`createBrowserClient`) |
| `libs/supabase/server.ts` | Client Supabase serveur (`createServerClient`, async) |
| `libs/supabase/middleware.ts` | Helper middleware Supabase (`updateSession`) |
| `src/sdk/index.ts` | Point d'entrée SDK (exports) |
| `src/sdk/_core.ts` | Client `callEdgeFunction()` + `SdkError` |
| `src/lib/demo.ts` | Données fictives mode démo |
| `types/index.ts` | Types partagés (UserProfile, User, StripePlan, FAQItem) |
| `supabase/functions/_shared/` | Utilitaires partagés Edge Functions |

---

## Ne Pas Modifier

- `node_modules/`
- `.next/`
- `supabase/functions/_shared/deps.ts` (sauf pour mettre à jour les versions)

---

## Debugging

### Logs Edge Functions (via MCP)

```
Utilisez mcp_supabase_get_logs avec project_id et service: "edge-function"
```

### Erreurs SDK

```typescript
import { SdkError } from "@/src/sdk";

try {
  await sdk.action();
} catch (err) {
  if (err instanceof SdkError) {
    console.log(err.code);     // "UNAUTHORIZED", "VALIDATION_ERROR", etc.
    console.log(err.message);  // Message lisible
    console.log(err.details);  // Détails si disponibles
  }
}
```

### Mode démo

Activer dans `.env.local` pour bypasser l'auth :

```env
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Checklist Déploiement Edge Functions

Avant de déployer une Edge Function, vérifiez :

- [ ] Imports depuis `_shared/` : `auth.ts`, `cors.ts`, `response.ts` (et `deps.ts` si besoin)
- [ ] CORS : `if (req.method === "OPTIONS") return handleCors();`
- [ ] Auth : `const { user, userClient, error } = await requireAuth(req);`
- [ ] Réponses : utiliser `success(data)` et `errors.*(message)`
- [ ] Try/catch avec `errors.internal()` en fallback
- [ ] Console.error avec le nom de la fonction pour les logs
- [ ] Déployer avec `verify_jwt: false` (l'auth est gérée manuellement via `_shared/auth.ts`)

### Dépendances dans `_shared/deps.ts`

Les dépendances sont centralisées pour garantir des versions cohérentes :

| Package | Version | Import |
|---------|---------|--------|
| Supabase JS | `@2.39.0` | `createClient`, `User`, `SupabaseClient` |
| Stripe | `@14.14.0` | `Stripe` |
| Valibot | `v0.30.0` | `v` (namespace) |

Pour utiliser une dépendance dans une Edge Function :

```typescript
import { Stripe } from "../_shared/deps.ts";
import { createClient } from "../_shared/deps.ts";
import { v } from "../_shared/deps.ts";
```
