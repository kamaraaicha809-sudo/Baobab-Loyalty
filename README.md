# Kodefast

> **Lancez votre Micro SaaS en quelques heures, pas en semaines.**

Template Next.js 15 complet avec Supabase, Stripe et tout ce qu'il faut pour démarrer rapidement.

---

## Démarrage en 2 étapes

### 1. Setup interactif

```bash
npm run setup
```

Le script installe les dépendances, configure votre projet (nom, couleurs, domaine, Supabase) et génère `.env.local` automatiquement.

### 2. Lancer

```bash
npm run dev
```

Ouvrez **http://localhost:3000**

> **Supabase via Cursor + MCP** : si vous avez configuré MCP Supabase dans Cursor, demandez-lui d'appliquer les migrations et de déployer les Edge Functions automatiquement.

---

## Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Styling | TailwindCSS 4 |
| Auth | Supabase Auth |
| Database | Supabase (Postgres) |
| Backend | Supabase Edge Functions |
| Paiements | Stripe |
| Emails | Resend |
| Déploiement | Vercel |

---

## Structure du Projet

```
kodefast/
├── app/                    # Pages Next.js (App Router)
├── components/             # Composants React réutilisables
├── src/sdk/               # SDK pour les Edge Functions
├── supabase/functions/    # Edge Functions (backend)
├── libs/supabase/         # Clients Supabase
├── docs/                  # Documentation détaillée
└── config.js              # Configuration centralisée
```

---

## Personnalisation

### Couleurs

Modifiez dans `config.js` :

```javascript
colors: {
  main: "#VOTRE_COULEUR",       // Couleur principale
  dark: "#VERSION_FONCEE",      // Hover/active
  light: "#VERSION_CLAIRE",     // Backgrounds
},
```

Les variables CSS sont injectees automatiquement via `layout.tsx`. Pas besoin de toucher `globals.css`.

### Configuration

Modifiez `config.js` pour :
- Nom et description de l'app
- Couleurs (main, dark, light)
- Plans Stripe (priceId)
- Feature flags

---

## Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guide de déploiement complet |
| [SUPABASE.md](docs/SUPABASE.md) | Configuration Supabase |
| [CURSOR_INSTRUCTIONS.md](docs/CURSOR_INSTRUCTIONS.md) | Instructions pour Cursor AI |

---

## Fonctionnalités

- **Auth** : Email, Magic Links, OAuth (Google, GitHub)
- **Paiements** : Stripe Checkout, Customer Portal, Webhooks
- **Backend** : Edge Functions avec SDK TypeScript
- **Admin** : Dashboard de configuration et gestion des prompts IA
- **Demo** : Mode démo pour tester sans configuration

---

## Scripts

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification du code
```

---

## Auteur

Template créé par **Pierre Evrard** ([@pierre_evrard sur Linkedin](https://www.linkedin.com/in/pierre-evrard-dashboard/))

---

<div align="center">
  <strong>Fait avec ❤️ pour les créateurs de Micro SaaS</strong>
</div>
