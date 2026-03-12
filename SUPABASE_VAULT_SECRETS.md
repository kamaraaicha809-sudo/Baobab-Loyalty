# Secrets Supabase Vault

Ajoutez ces secrets dans **Dashboard Supabase > Settings > Vault**.

---

## Requis

| Secret | Description | Obtention |
|--------|-------------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin pour Edge Functions | Dashboard > Settings > API → service_role |

> ⚠️ Ne jamais exposer cette clé côté client.

---

## Optionnels (à ajouter selon vos besoins)

| Secret | Service | Format | Description |
|--------|---------|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe | `sk_test_...` / `sk_live_...` | Clé secrète pour les paiements |
| `STRIPE_WEBHOOK_SECRET` | Stripe | `whsec_...` | Signature des webhooks Stripe |
| `RESEND_API_KEY` | Resend | `re_...` | Envoi d'emails transactionnels |
| `OPENROUTER_API_KEY` | OpenRouter | `sk-or-...` | Accès aux modèles IA |

Consultez **docs/DEPLOYMENT.md** pour les instructions détaillées de chaque service.
