# Déploiement

Guide complet pour déployer Kodefast en production.

---

## Checklist Rapide

Cochez chaque étape au fur et à mesure :

### Supabase
- [ ] Projet Supabase créé
- [ ] Migrations SQL appliquées
- [ ] Auth configurée (OAuth, email)
- [ ] Edge Functions déployées
- [ ] Secrets configurés dans Vault

### Stripe
- [ ] Compte Stripe configuré
- [ ] Produits et prix créés
- [ ] priceId ajoutés dans config.js
- [ ] Webhook créé et configuré

### Vercel
- [ ] Projet connecté à GitHub
- [ ] Variables d'environnement configurées
- [ ] Domaine personnalisé (optionnel)

---

## Configuration via MCP

**Cursor peut configurer Supabase automatiquement via MCP.** Demandez simplement :

```
"Configure mon projet Supabase avec les migrations et Edge Functions"
```

### Commandes MCP utiles

| Action | Commande MCP |
|--------|--------------|
| Lister projets | `mcp_supabase_list_projects` |
| Créer projet | `mcp_supabase_create_project` |
| Appliquer migration | `mcp_supabase_apply_migration` |
| Déployer fonction | `mcp_supabase_deploy_edge_function` |
| Récupérer clés | `mcp_supabase_get_publishable_keys` |
| Voir logs | `mcp_supabase_get_logs` |

---

## 1. Supabase

### Créer un projet

**Option A - Via MCP (recommandé)** :
```
Demandez à Cursor : "Crée un projet Supabase nommé [nom] dans la région [eu-west-1]"
```

**Option B - Manuellement** :
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project URL` et `anon key`

### Appliquer les migrations

**Via MCP** :
```
Demandez à Cursor : "Applique les migrations SQL du dossier supabase/migrations/"
```

Les migrations à appliquer :
1. `001_app_config.sql` - Configuration et profils
2. `002_ai_prompts.sql` - Prompts IA

**Via CLI** :
```bash
supabase db push
```

### Configurer les secrets

Dans Supabase Dashboard > Settings > Vault :

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe |
| `RESEND_API_KEY` | Clé API Resend (optionnel) |
| `OPENROUTER_API_KEY` | Clé OpenRouter pour IA (optionnel) |
| `EMAIL_FROM` | Adresse email d'envoi |

### Déployer les Edge Functions

**Via MCP** :
```
Demandez à Cursor : "Déploie toutes les Edge Functions de supabase/functions/"
```

**Via CLI** :
```bash
# Toutes les fonctions
supabase functions deploy

# Une fonction spécifique
supabase functions deploy billing-create-checkout
```

### Liste des Edge Functions

| Fonction | Description |
|----------|-------------|
| `billing-create-checkout` | Créer session Stripe Checkout |
| `billing-create-portal` | Créer session Customer Portal |
| `billing-webhook` | Gérer webhooks Stripe |
| `user-get-profile` | Récupérer profil utilisateur |
| `ai-generate` | Générer contenu IA |
| `email-send` | Envoyer email |
| `prompts-list` | Lister les prompts |
| `prompts-create` | Créer un prompt |
| `prompts-update` | Modifier un prompt |
| `prompts-delete` | Supprimer un prompt |
| `config-get` | Lire configuration |
| `config-update` | Modifier configuration |

---

## 2. Stripe

### Configuration

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Obtenez vos clés API dans Dashboard > Developers > API keys

### Créer les produits

1. Dashboard Stripe > Products
2. Créez vos produits et prix
3. Copiez les `price_id` dans `config.js`

```javascript
// config.js
stripe: {
  plans: [
    {
      priceId: "price_xxxxx", // Votre price_id Stripe
      name: "Starter",
      price: 79,
      // ...
    }
  ]
}
```

### Configurer le webhook

1. Dashboard Stripe > Developers > Webhooks
2. Créez un endpoint :
   - **URL** : `https://[votre-projet].supabase.co/functions/v1/billing-webhook`
   - **Events** :
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
3. Copiez le signing secret dans Supabase Vault (`STRIPE_WEBHOOK_SECRET`)

---

## 3. Vercel

### Déployer

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SITE_URL=https://votre-domaine.com
```

### Variables d'environnement

| Variable | Environnement | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Clé publique Supabase |
| `SITE_URL` | Production | URL de votre site |

> **Note** : Les secrets Stripe sont dans Supabase Vault, pas dans Vercel.

---

## 4. Auth (OAuth)

### Google

1. [Google Cloud Console](https://console.cloud.google.com)
2. Créez un projet
3. APIs & Services > Credentials > OAuth Client ID
4. Type : Web Application
5. Redirect URI : `https://[votre-projet].supabase.co/auth/v1/callback`
6. Copiez Client ID et Secret dans Supabase Dashboard > Auth > Providers > Google

### GitHub

1. GitHub Settings > Developer settings > OAuth Apps
2. Callback URL : `https://[votre-projet].supabase.co/auth/v1/callback`
3. Copiez Client ID et Secret dans Supabase

---

## 5. Domaine Personnalisé

### Vercel

1. Project Settings > Domains
2. Ajoutez votre domaine
3. Configurez les DNS chez votre registrar

### Supabase (optionnel)

Pour un domaine personnalisé pour l'auth :
1. Project Settings > General > Custom Domain

---

## Variables d'Environnement (Matrice)

### Next.js (Vercel)

| Variable | Requis | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé publique |
| `SITE_URL` | ⚠️ Prod | URL en production |
| `NEXT_PUBLIC_DEMO_MODE` | ❌ | Mode démo |

### Supabase Vault (Secrets)

| Secret | Requis | Utilisé par |
|--------|--------|-------------|
| `STRIPE_SECRET_KEY` | ✅ | billing-* |
| `STRIPE_WEBHOOK_SECRET` | ✅ | billing-webhook |
| `RESEND_API_KEY` | ❌ | email-send |
| `OPENROUTER_API_KEY` | ❌ | ai-generate |
| `EMAIL_FROM` | ❌ | email-send |

---

## Go-Live Checklist

### Avant le lancement

- [ ] Clés Stripe en mode live (sk_live_...)
- [ ] Webhook Stripe en mode live
- [ ] OAuth en mode production
- [ ] Emails de domaine vérifiés (Resend)
- [ ] RLS activé sur toutes les tables
- [ ] Tester le flow de paiement complet
- [ ] Tester la connexion OAuth
- [ ] Vérifier les emails transactionnels

### Après le lancement

- [ ] Monitorer les logs (Supabase, Vercel)
- [ ] Vérifier les webhooks Stripe
- [ ] Tester un achat réel
- [ ] Configurer les alertes (optionnel)

---

## Troubleshooting

### "Edge Function not found"

```bash
supabase functions deploy [nom-fonction]
```

Ou via MCP :
```
"Déploie la fonction [nom-fonction]"
```

### "Webhook signature verification failed"

Vérifiez que `STRIPE_WEBHOOK_SECRET` dans Supabase Vault correspond au signing secret du webhook Stripe.

### "Invalid Supabase URL"

Vérifiez `NEXT_PUBLIC_SUPABASE_URL` dans vos variables d'environnement Vercel.

### Problèmes OAuth

1. Vérifiez les redirect URIs
2. Vérifiez que le provider est activé dans Supabase
3. Vérifiez les clés client ID/secret

### Voir les logs

**Via MCP** :
```
Demandez : "Montre-moi les logs de [service] pour le projet [id]"
```

Services disponibles : `api`, `postgres`, `edge-function`, `auth`, `storage`
