# CLAUDE.md - Baobab Loyalty

Micro-SaaS d'engagement client pour hôtels : segmentation, campagnes WhatsApp, IA.
Marché cible : Afrique francophone (prix en FCFA).

---

## Stack

- **Next.js 16** App Router + React 19 + TypeScript
- **Supabase** (Auth + PostgreSQL + Edge Functions Deno + Realtime + Vault)
- **Moneroo** (Paiements - plans en FCFA)
- **OpenRouter** (AI - génération de messages)
- **Resend** (Emails transactionnels)
- **TailwindCSS 4**
- **WhatsApp API** (envoi de campagnes)

---

## Architecture

### SDK Pattern (OBLIGATOIRE)

```typescript
import { clients, reservations, ai, billing } from "@/src/sdk";

// Segmentation
await clients.getSegmentCounts(profileId);
await clients.importFromCSV(profileId, rows);

// Réservations
await reservations.getChart(profileId);
await reservations.getStats(profileId);

// JAMAIS: fetch("/functions/v1/...") directement
```

### Format Réponse (OBLIGATOIRE)

```typescript
{ ok: true, data: T }
{ ok: false, error: { code: string, message: string } }
```

### Structure Projet

```
app/
├── admin/                  # Admin IA prompts + configuration
├── auth/                   # signin, signup, verify, reset
├── dashboard/
│   ├── page.tsx            # Métriques temps réel
│   ├── segments/           # Segmentation clients
│   ├── campaign/           # Création + confirmation campagne
│   ├── configuration/      # Setup hôtel + import CSV + frais d'intégration
│   ├── registre/           # Saisie continue des clients (remplace le cahier papier)
│   └── templates/          # Templates messages IA
├── offre/                  # Page publique (client final WhatsApp)
└── checkout/               # Checkout Moneroo

src/sdk/
├── clients.ts              # Import CSV, segmentation, counts
├── reservations.ts         # Analytics (chart, stats)
├── ai.ts                   # Génération messages OpenRouter
├── billing.ts              # Checkout + portail Moneroo
├── prompts.ts              # Gestion prompts IA admin
├── email.ts                # Resend
└── user.ts                 # Profil utilisateur

supabase/
├── functions/              # Edge Functions Deno
│   └── _shared/            # auth.ts, cors.ts, response.ts
└── migrations/             # ~40 migrations SQL avec RLS

config.js                   # Branding, couleurs, pricing plans
```

---

## Base de Données (~40 migrations)

### Tables principales

| Table | Rôle |
|-------|------|
| `profiles` | Propriétaires d'hôtels (hotel_name, config_complete) |
| `clients` | Base clients hôtel + colonne whatsapp |
| `reservations` | Réservations + métriques de performance |
| `room_types` | Types de chambres par hôtel |
| `offers` | Offres créées (discount/upgrade/cocktail...) |
| `segments` | Référentiel segments (3mo, 6mo, 9mo, all) |
| `segment_offers` | Liaison offres ↔ segments |
| `campaigns` | Historique campagnes (draft/sending/completed/failed) |
| `sent_messages` | Log d'envoi (campaign_id, client_id, channel, status) |
| `redemptions` | Tracking clics (clicked/pending/booked/cancelled) |

### Fonctions SQL clés (migration 015, sécurisées en 038)

```sql
get_segment_counts(p_profile_id)   -- Nombre clients par segment
get_reservations_chart(p_profile_id) -- Données graphique 7 jours
```

Les deux vérifient `is_team_member(p_profile_id)` (migration 038) avant de renvoyer des données — sans ça, n'importe qui connaissant un `profile_id` pouvait lire les stats d'un autre hôtel.

### Relations critiques

```
profiles → clients, room_types, offers, campaigns, reservations
clients → redemptions, sent_messages, reservations
campaigns → sent_messages
offers → campaigns, segment_offers, redemptions
segments → campaigns, segment_offers
```

---

## Fonctionnalités

### 1. Segmentation clients
- 3 mois inactifs, 6 mois, 9 mois, tous les clients
- Import CSV avec détection auto des colonnes (nom/email/telephone/whatsapp/derniere_visite)
- Import par batch de 100
- Registre numérique (`/dashboard/registre`) : saisie manuelle continue à la réception pour les nouveaux clients, en complément de l'import CSV pour l'historique papier

### 2. Campagnes WhatsApp
- Sélection segment → choix offre → confirmation → envoi
- Statuts : draft / sending / completed / failed
- Log complet des messages envoyés

### 3. Tracking offres
- Page publique `/offre` accessible depuis le lien WhatsApp
- Création réservation via API (service role Supabase)
- Statuts redemption : clicked → booked / cancelled

### 4. Dashboard temps réel
- Réservations via Baobab Loyalty (total + aujourd'hui)
- Revenus générés en FCFA
- Graphique 7 jours (directes vs autres)
- Activité live (Supabase Realtime subscription)

### 5. IA
- Génération de messages de campagne via OpenRouter
- Prompts configurables depuis `/admin/ia`

---

## Pricing (FCFA)

Source de vérité : `config.js` (`billing.plans`).

| Plan | Prix | Chambres | Campagnes WhatsApp/mois |
|------|------|----------|--------------------------|
| Starter | 39 000 FCFA/mo | ≤ 30 | 5 |
| Pro | 69 000 FCFA/mo | ≤ 60 | 10 |
| Premium | 189 000 FCFA/mo | Illimité | 30 (+ multi-utilisateurs, IA perso, posts LinkedIn) |

**Frais d'intégration (one-time)** : 49 000 FCFA, pour les hôtels sans base de données électronique (cahier papier). Couvre la digitalisation de l'historique (import CSV, déjà existant) et l'accès au **registre numérique** (`/dashboard/registre`) — l'outil de saisie continue qui remplace le cahier pour les nouveaux clients, synchronisé en temps réel avec Baobab Loyalty. Paiement Moneroo distinct d'un abonnement (`type: "onboarding_fee"` dans `billing-create-checkout` / `billing-webhook`) : ne touche jamais `has_access`/`price_id`, marque `profiles.onboarding_fee_paid_at` (migration 054). Source de vérité du montant : `ONBOARDING_FEE_XOF` dans `supabase/functions/_shared/plan.ts`.

---

## Variables d'Environnement

### `.env.local` (frontend)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DEMO_MODE=false
SITE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=    # Pour /offre API (public)
```

### Supabase Vault (Edge Functions)
```
MONEROO_API_KEY
MONEROO_WEBHOOK_SECRET
RESEND_API_KEY
OPENROUTER_API_KEY
UNIPILE_API_KEY
UNIPILE_DSN
META_APP_ID
META_APP_SECRET
EMAIL_FROM
DEMO_MODE
```

---

## MCP Disponibles

- **Supabase MCP** : Migrations, tables, Edge Functions, RLS
- **GitHub MCP** : Repos, issues, PRs
- **Resend MCP** : Emails, templates

---

## Règles Critiques

1. Toujours utiliser le SDK (`src/sdk/`) pour appeler les Edge Functions
2. RLS obligatoire sur toutes les tables
3. Migrations dans `supabase/migrations/` (numérotées 001→ N)
4. Edge Functions avec `_shared/auth.ts` pour l'authentification
5. Jamais de secrets dans le code (utiliser `.env` ou Vault)
6. **Chaque feature doit fonctionner en mode DEMO**
7. Prix toujours en FCFA (marché Afrique francophone)
8. `get_segment_counts()` et `get_reservations_chart()` = fonctions SQL optimisées, ne pas recréer en N+1

---

## Mode DEMO (OBLIGATOIRE)

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

- Données mock dans `src/lib/demo.ts`
- `userId = "demo-user-id"`
- Bandeau "Mode Demo" affiché
- Paiements et suppressions désactivés

### Pattern Edge Function

```typescript
const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
if (isDemoMode) {
  userId = "demo-user-id";
} else {
  const { user, error } = await requireAuth(req);
  if (error) return errors.unauthorized(error);
  userId = user.id;
}
```

### Pattern Frontend

```tsx
import config from "@/config";
if (config.isDemoMode) {
  return <><DemoBanner /><FeatureContent userId="demo-user-id" /></>;
}
return <AuthenticatedFeature />;
```

---

## Commandes disponibles

- `/landing` — Optimise le copywriting de la landing page (skill : `.claude/skills/landing.md`)
  - Pose d'abord 8 questions sur le problème, la cible et les résultats
  - Propose le copywriting complet en mode plan avant de modifier le code
  - Règle clé : toujours parler du résultat, jamais des fonctionnalités techniques

- `/legal` — Génère les pages légales complètes (skill : `.claude/skills/legal.md`)
  - Pose 7 questions obligatoires (nom légal, pays, adresse, email, numéro RCCM, données collectées, services tiers)
  - Propose un plan de contenu avant de créer les fichiers
  - Génère 5 pages : Mentions légales, CGU, Confidentialité, Cookies, CGV
  - Met à jour le footer et crée la bannière cookies
  - Adapté au droit africain francophone (OHADA, FCFA)

---

## Métaphore du Restaurant (architecture)

| Dossier | Restaurant | Rôle |
|---------|------------|------|
| `app/` | Les salles | Pages vues par les clients |
| `components/` | Le mobilier | Composants réutilisables |
| `src/sdk/` | Le serveur | Fait le lien salle ↔ cuisine |
| `supabase/functions/` | La cuisine | Logique backend (invisible) |
| `supabase/migrations/` | Le frigo | Organisation des données |
| `config.js` | L'enseigne | Nom, couleurs, prix |
| `middleware.ts` | Le maître d'hôtel | Vérifie l'auth à l'entrée |
| `.env.local` | Le coffre-fort | Secrets |
