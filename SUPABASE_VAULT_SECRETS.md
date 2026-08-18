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
| `MONEROO_API_KEY` | Moneroo | `live_...` / `test_...` | Clé secrète pour les paiements (FCFA) |
| `MONEROO_WEBHOOK_SECRET` | Moneroo | — | Signature des webhooks Moneroo |
| `RESEND_API_KEY` | Resend | `re_...` | Envoi d'emails transactionnels |
| `OPENROUTER_API_KEY` | OpenRouter | `sk-or-...` | Accès aux modèles IA |
| `UNIPILE_API_KEY` / `UNIPILE_DSN` | Unipile | — | Import de posts LinkedIn |
| `META_APP_ID` / `META_APP_SECRET` | Meta | — | Connexion WhatsApp Business directe |

Consultez **docs/DEPLOYMENT.md** pour les instructions détaillées de chaque service.
