# Tests de régression sécurité & consentement

Ces scripts appellent le **vrai projet Supabase de production** (URL et clés
lues dans `.env.local`). Ils créent des comptes et des données de test
jetables (préfixés `regression-` / `SCN`), vérifient un comportement réel,
puis suppriment tout ce qu'ils ont créé dans un bloc `finally` — y compris en
cas d'échec d'un test.

**Aucun paiement réel ni envoi WhatsApp réel n'est jamais déclenché** : la
suite `whatsapp-consent` configure volontairement une fausse clé BSP
(`FAKE_TEST_KEY_NEVER_REAL`), que 360dialog rejette à l'authentification.

## Quand les relancer

- `rls-multitenant` : avant toute modification touchant les policies RLS,
  `is_team_member`/`is_team_admin`, les Edge Functions qui dérivent
  `profile_id`, ou les RPC `get_segment_counts`/`get_reservations_chart`.
- `whatsapp-consent` : avant toute modification de `campaign-send`,
  `whatsapp-webhook`, `clients-unsubscribe`, ou de la logique d'import CSV
  (`src/sdk/clients.ts`).
- `whatsapp-webhook-security` : avant toute modification de
  `whatsapp-webhook` (vérification de signature Meta/360dialog, protection
  anti-rejeu).
- `billing-webhook-security` : avant toute modification de `billing-webhook`
  (vérification de signature Moneroo, contrôle serveur du montant/devise,
  payload falsifié, événement invalide).
- `posthog-entrypoint` : avant toute modification touchant le tracking
  analytics — garde-fou statique qui empêche un futur import de `posthog-js`
  en dehors de `PostHogProvider.tsx` (le seul endroit où l'initialisation est
  subordonnée au consentement).

## Lancer les tests

```bash
npm run test:rls
npm run test:whatsapp-consent
npm run test:whatsapp-webhook-security
npm run test:billing-webhook-security
npm run test:posthog-entrypoint
```

Chaque script affiche un JSON avec un `pass: true/false` par vérification, et
termine avec un code de sortie non nul si un test a échoué (utilisable en CI).
Un `pass: null` signifie que le test a été **sauté** (jamais fabriqué) parce
qu'un secret nécessaire pour signer un payload de test valide n'était pas
disponible en local — voir "Secrets optionnels pour tests complets" ci-dessous.

## Secrets optionnels pour tests complets

`whatsapp-webhook-security` et `billing-webhook-security` ont besoin d'une
copie locale des mêmes secrets que ceux configurés dans le Vault Supabase pour
pouvoir signer un payload de test et vérifier le chemin "signature valide →
traité". Sans eux, seuls les chemins "signature absente/invalide/falsifiée →
rejeté" sont testés (ce qui reste la vérification de sécurité la plus
importante, mais incomplète).

Ajouter dans `.env.local` (fichier gitignore, jamais commité) :

```bash
META_APP_SECRET=...            # même valeur que dans Supabase Vault
MONEROO_WEBHOOK_SECRET=...     # même valeur que dans Supabase Vault
```

`DIALOG360_WEBHOOK_SECRET` n'existe pas encore (aucun hôtel n'utilise
360dialog à ce jour) : son test "signature valide" ne pourra être ajouté que
lorsqu'un vrai secret 360dialog Partner Hub existera.

## Limites connues

- Le scénario "fusion des doublons internes à un fichier CSV" (dédoublonnage
  par téléphone au sein d'un même import) n'est pas couvert ici : c'est une
  fonction pure côté frontend (`validateAndDedupeRows` dans
  `src/sdk/clients.ts`), sans effet de bord serveur — à vérifier par lecture
  de code ou par un test unitaire frontend si un framework de test est ajouté
  au projet.
- Ces scripts nécessitent un accès réseau au projet Supabase de production et
  la clé `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` — à ne jamais exécuter
  depuis un environnement non fiable.
