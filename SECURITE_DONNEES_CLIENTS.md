# Document Technique et Juridique — Sécurité des Données Clients
## Baobab Loyalty — Version 1.0 — Avril 2026

**Destinataires :** Équipe informatique · Équipe juridique / conformité  
**Auteur :** Équipe Baobab Loyalty  
**Classification :** Usage interne

---

## 1. Présentation de l'application

Baobab Loyalty est un logiciel SaaS (Software as a Service) destiné aux propriétaires d'hôtels en Afrique francophone. Il leur permet de :

- **Importer** leur base de clients depuis un fichier CSV
- **Segmenter** automatiquement ces clients selon leur date de dernière visite (3 mois, 6 mois, 9 mois d'inactivité)
- **Envoyer** des campagnes de fidélisation par WhatsApp avec des offres personnalisées
- **Suivre** les réservations générées et les revenus en FCFA depuis un tableau de bord

Chaque hôtelier (appelé "profil") possède un espace totalement isolé. Il ne voit et ne peut interagir qu'avec ses propres données.

---

## 2. Données collectées sur les clients des hôtels

Les données suivantes concernant les clients finaux des hôtels (les voyageurs) sont stockées dans l'application :

| Champ | Nature | Obligatoire | Exemple |
|-------|--------|-------------|---------|
| `nom` | Nom du client | Oui | "Aminata Diallo" |
| `email` | Adresse email | Non | "aminata@gmail.com" |
| `telephone` | Numéro de téléphone | Non | "+221 77 000 00 00" |
| `whatsapp` | Numéro WhatsApp | Non | "+221 77 000 00 00" |
| `derniere_visite` | Date du dernier séjour | Oui | "2025-10-15" |
| `notes` | Notes internes de l'hôtelier | Non | "Client VIP, chambre 204" |

Ces données sont **fournies par l'hôtelier lui-même** (via import CSV depuis son registre interne) et concernent ses propres clients. Baobab Loyalty n'est pas à l'origine de la collecte initiale de ces données — c'est l'hôtelier qui les a recueillies lors du séjour de ses clients.

---

## 3. Où sont hébergées les données

### 3.1 Infrastructure

Les données sont hébergées sur **Supabase**, une plateforme de base de données cloud fondée sur PostgreSQL. Le serveur utilisé est situé dans la région **EU West (Europe de l'Ouest)** par défaut, ou dans la région choisie lors de la création du projet (ex. : `us-east-1` pour les États-Unis).

> **Point juridique important :** L'hôtelier doit vérifier avec l'équipe Baobab Loyalty la région de stockage afin de s'assurer de la conformité avec les lois locales sur la protection des données (ex. : RGPD en Europe, loi 09-08 au Maroc, PPDP au Sénégal, **Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel** en Côte d'Ivoire).

### 3.2 Structure de la base de données

Voici les tables directement liées aux données clients, avec leur rôle :

```
clients          → Les voyageurs (nom, email, téléphone, date de visite)
campaigns        → Historique des campagnes WhatsApp envoyées
sent_messages    → Journal des messages envoyés (quel message, à quel client, quand)
redemptions      → Suivi des clics sur les offres reçues par WhatsApp
reservations     → Réservations générées suite aux campagnes
profiles         → Compte de l'hôtelier (nom de l'hôtel, email, abonnement)
```

Chaque ligne dans la table `clients` est liée à un `profile_id` unique — c'est-à-dire l'identifiant de l'hôtelier propriétaire de ces données.

---

## 4. Comment les données sont sécurisées

La sécurité repose sur **quatre niveaux de protection** indépendants et complémentaires.

---

### Niveau 1 — Authentification par jeton JWT

Chaque hôtelier se connecte avec un email et un mot de passe. Supabase génère un **jeton JWT** (JSON Web Token) signé cryptographiquement, valide pour une durée limitée.

Aucune opération sur les données n'est possible sans ce jeton valide. Toutes les requêtes API et les fonctions backend vérifient systématiquement ce jeton avant d'agir.

**Code de vérification du jeton** (`supabase/functions/_shared/auth.ts`) :

```typescript
export async function requireAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");

  // Rejet immédiat si pas de jeton
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, userClient: null, error: "En-tête Authorization manquant ou invalide" };
  }

  const token = authHeader.replace("Bearer ", "");

  // Vérification cryptographique du jeton auprès de Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, userClient: null, error: "Jeton invalide" };
  }

  return { user, userClient, error: null };
}
```

---

### Niveau 2 — Isolation totale des données par RLS (Row Level Security)

C'est **le mécanisme de sécurité le plus important** de l'application. Le RLS (Sécurité au Niveau des Lignes) est une fonctionnalité de PostgreSQL qui garantit qu'un hôtelier ne peut **jamais** accéder aux clients d'un autre hôtelier.

**Principe :** Même si deux hôteliers utilisent la même base de données PostgreSQL, chaque requête est automatiquement filtrée par une règle qui vérifie `auth.uid() = profile_id`. En clair : l'identifiant de l'utilisateur connecté doit correspondre exactement au propriétaire de la donnée.

#### Exemple concret — Politiques RLS sur la table `clients`

```sql
-- Activation de la sécurité sur la table clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Règle 1 : Un hôtelier ne peut LIRE que ses propres clients
CREATE POLICY "Users can view own clients"
  ON public.clients
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Règle 2 : Un hôtelier ne peut AJOUTER un client que dans son propre compte
CREATE POLICY "Users can insert own clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Règle 3 : Un hôtelier ne peut MODIFIER que ses propres clients
CREATE POLICY "Users can update own clients"
  ON public.clients
  FOR UPDATE
  USING (auth.uid() = profile_id);

-- Règle 4 : Un hôtelier ne peut SUPPRIMER que ses propres clients
CREATE POLICY "Users can delete own clients"
  ON public.clients
  FOR DELETE
  USING (auth.uid() = profile_id);
```

**Ce que cela signifie juridiquement :** Même en cas de bug dans le code de l'application, la base de données elle-même refusera toute requête qui tenterait d'accéder aux données d'un autre hôtelier. C'est une protection au niveau du moteur de base de données, indépendante de la logique applicative.

---

### Niveau 3 — Séparation des clés d'accès

L'application utilise trois niveaux de clé d'accès distincts :

| Clé | Qui l'utilise | Ce qu'elle permet |
|-----|---------------|-------------------|
| **Anon Key** (publique) | L'application web | Accès limité, soumis au RLS |
| **JWT utilisateur** | L'hôtelier connecté | Accès à ses données uniquement (RLS actif) |
| **Service Role Key** (secrète) | Fonctions backend uniquement | Accès total, JAMAIS exposée au navigateur |

La `Service Role Key` (la clé la plus puissante, qui peut contourner le RLS) n'est **jamais envoyée au navigateur de l'utilisateur**. Elle est uniquement utilisée dans des fonctions backend sécurisées côté serveur (Edge Functions Deno), pour des opérations légitimes comme le tracking des réservations publiques.

---

### Niveau 4 — Secrets et variables sensibles dans un coffre-fort

Aucun secret (clé API, mot de passe, clé Stripe) n'est écrit en dur dans le code source. Tous les secrets sont stockés dans :

- **Supabase Vault** : coffre-fort chiffré pour les clés utilisées par les fonctions backend (Stripe, OpenRouter AI, Resend, Moneroo)
- **Variables d'environnement** (`.env.local`) : pour les clés côté serveur Next.js, jamais embarquées dans le code JavaScript envoyé au navigateur

```
Secrets stockés dans Supabase Vault :
  STRIPE_SECRET_KEY          → Clé de paiement Stripe
  RESEND_API_KEY             → Clé d'envoi d'emails
  OPENROUTER_API_KEY         → Clé IA (génération de messages)
  MONEROO_API_KEY            → Clé de paiement FCFA
  MONEROO_WEBHOOK_SECRET     → Clé de vérification webhook
```

---

## 5. Flux complet d'une donnée client — De l'import à l'envoi WhatsApp

```
1. L'hôtelier importe un fichier CSV depuis son logiciel hôtelier
        ↓
2. Le fichier est traité dans le navigateur (parsing CSV côté client)
        ↓
3. Les données sont envoyées par lot (100 lignes) vers Supabase
   via l'API sécurisée (JWT + RLS vérifié)
        ↓
4. Les données sont stockées dans la table `clients`
   avec profile_id = identifiant de l'hôtelier
        ↓
5. L'hôtelier sélectionne un segment (ex : "clients inactifs 6 mois")
   → La fonction SQL get_segment_counts() filtre par profile_id
        ↓
6. L'hôtelier choisit une offre et lance la campagne
   → Un enregistrement dans `campaigns` + `sent_messages` est créé
        ↓
7. Les messages WhatsApp sont envoyés aux clients concernés
   → Chaque envoi est journalisé dans `sent_messages`
        ↓
8. Si un client clique sur le lien et réserve :
   → Un enregistrement dans `redemptions` est créé
   → Une réservation apparaît dans le tableau de bord de l'hôtelier
```

---

## 6. Qui peut accéder aux données des clients des hôtels

| Acteur | Accès | Niveau d'accès |
|--------|-------|----------------|
| L'hôtelier propriétaire | Oui | Ses clients uniquement (RLS) |
| Un autre hôtelier | Non | Bloqué par RLS au niveau base de données |
| L'équipe Baobab Loyalty (admin) | Oui, limité | Via accès direct Supabase Dashboard, pour maintenance uniquement |
| Les services tiers (Stripe, Resend) | Non | Ils ne reçoivent jamais les données clients |
| Les systèmes d'IA (OpenRouter) | Non | Seul le texte du message généré est traité, pas les données clients |

---

## 7. Données transmises à des tiers

| Service tiers | Données transmises | Finalité |
|---------------|--------------------|----------|
| **Supabase** (PostgreSQL) | Toutes les données | Hébergement et base de données |
| **Vercel** | Aucune donnée client | Hébergement de l'application web uniquement |
| **Resend** | Email de l'hôtelier uniquement | Envoi d'emails transactionnels à l'hôtelier |
| **Stripe / Moneroo** | Données de facturation de l'hôtelier | Paiement de l'abonnement |
| **OpenRouter / IA** | Texte du message (sans données nominatives) | Génération de texte marketing |
| **WhatsApp Business API** | Numéro de téléphone du client | Envoi du message de campagne |

> **Note importante :** Les données des clients des hôtels (nom, email, téléphone) ne sont **jamais transmises** à Stripe, Resend, ou OpenRouter. Seul WhatsApp Business API reçoit le numéro de téléphone pour l'envoi du message.

---

## 8. Mesures de sécurité résumées

| Mesure | Implémentée | Détail |
|--------|-------------|--------|
| Authentification JWT | Oui | Supabase Auth, sessions sécurisées |
| Isolation des données (RLS) | Oui | 4 politiques sur la table `clients` |
| Chiffrement en transit | Oui | HTTPS/TLS sur toutes les connexions |
| Secrets dans coffre-fort | Oui | Supabase Vault + variables d'environnement |
| Vérification de signature webhook | Oui | HMAC-SHA256 pour les webhooks de paiement |
| Journalisation des actions | Oui | Table `sent_messages` pour traçabilité |
| Chiffrement au repos (PII) | Partiel | PostgreSQL chiffré, pas de chiffrement colonne-par-colonne |
| Limitation du débit (rate limiting) | Partiel | Géré par Supabase et Vercel |
| Contrôle d'accès admin | Oui | Colonne `role = 'admin'` dans `profiles` |

---

## 9. Points d'attention juridique

### 9.1 Base légale du traitement
L'hôtelier est **responsable de traitement** au sens du RGPD et des lois africaines applicables. Baobab Loyalty agit en tant que **sous-traitant**. Un contrat de sous-traitance doit être signé entre l'hôtelier et Baobab Loyalty.

### 9.2 Durée de conservation
Les données clients sont conservées aussi longtemps que l'hôtelier maintient son compte actif. La suppression du compte entraîne la suppression en cascade de toutes les données liées (`ON DELETE CASCADE` sur la clé étrangère `profile_id`).

| Type de donnée | Durée de conservation | Motif |
|----------------|----------------------|-------|
| Données clients (nom, contact, visite) | Pendant la durée du compte actif | Nécessité fonctionnelle |
| Journaux de messages envoyés | 3 ans après l'envoi | Traçabilité légale |
| Données de réservation | 5 ans | Obligation comptable |
| Données après clôture du compte | Suppression sous 30 jours | Contrat de sous-traitance |

### 9.3 Droits des personnes concernées
Les clients des hôtels (voyageurs) peuvent exercer leurs droits (accès, rectification, suppression) auprès de l'hôtelier. L'hôtelier dispose des outils dans Baobab Loyalty pour supprimer un client spécifique de sa base.

### 9.4 Transferts internationaux et conformité par pays

| Pays | Loi applicable | Autorité de contrôle | Statut transfert vers AWS EU West |
|------|---------------|---------------------|-----------------------------------|
| Union Européenne | RGPD — Règlement (UE) 2016/679 | CNIL (France) | Conforme — RGPD s'applique directement |
| Sénégal | Loi n° 2008-12 du 25 janvier 2008 (PPDP) | CDP — www.cdp.sn | Conforme sous réserve de déclaration CDP |
| Maroc | Loi n° 09-08 du 18 février 2009 | CNDP — www.cndp.ma | Conforme — accord partiel UE/Maroc |
| Côte d'Ivoire | **Loi n° 2013-450 du 19 juin 2013** relative à la protection des données à caractère personnel | ARTCI — www.artci.ci | Conforme — niveau RGPD supérieur à la loi CI, mais déclaration ARTCI préalable obligatoire |
| Cameroun | Loi n° 2010/021 | — | Conforme — même logique que CI |

> **Point critique Côte d'Ivoire :** Même si le niveau de protection RGPD est supérieur à la Loi n° 2013-450, le transfert de données hors de Côte d'Ivoire vers l'UE doit faire l'objet d'une **déclaration préalable à l'ARTCI** (Articles 8 à 14 de la Loi n° 2013-450). Cette déclaration est à la charge de l'hôtelier, pas de Baobab Loyalty. Un formulaire pré-rempli est disponible (Document 04 — Formulaire Déclaration ARTCI).

---

## 10. Obligations de conformité par pays — Ce que doit faire chaque hôtelier

### 10.1 Récapitulatif des actions obligatoires

| Action | Côte d'Ivoire | Sénégal | Maroc | UE/France | Délai recommandé |
|--------|:---:|:---:|:---:|:---:|----------|
| Signer le DPA avec Baobab Loyalty | ✓ | ✓ | ✓ | ✓ | Avant toute utilisation |
| Afficher la Notice d'information clients | ✓ | ✓ | ✓ | ✓ | Avant import des données |
| Déclaration à l'ARTCI | ✓ | — | — | — | Avant utilisation |
| Déclaration à la CDP | — | ✓ | — | — | Avant utilisation |
| Déclaration/Autorisation CNDP | — | — | ✓ | — | Avant utilisation |
| Registre des traitements | Recommandé | Recommandé | Recommandé | Obligatoire | Avant import |
| Mise à jour politique de confidentialité (site web) | ✓ | ✓ | ✓ | ✓ | Sous 30 jours |
| Formation du personnel | ✓ | ✓ | ✓ | ✓ | Sous 60 jours |

### 10.2 Déclaration à l'ARTCI (Côte d'Ivoire)

**Base légale :** Articles 8 à 14 de la Loi n° 2013-450 du 19 juin 2013

Les informations clés à renseigner dans le formulaire ARTCI :

| Champ ARTCI | Ce que l'hôtelier indique |
|-------------|--------------------------|
| Finalité du traitement | "Fidélisation clientèle hôtelière par communications WhatsApp" |
| Catégories de données | Nom, email, téléphone, date de dernière visite |
| Destinataires | Baobab Loyalty (sous-traitant), WhatsApp Business API |
| Durée de conservation | Durée de l'abonnement actif Baobab Loyalty |
| Transferts hors CI | Oui — vers serveurs AWS EU West (Irlande) — protégés par RGPD |
| Mesures de sécurité | Chiffrement TLS, JWT, RLS PostgreSQL |

**Délai de réponse ARTCI :** 1 mois. Sans réponse, la déclaration est réputée acceptée.  
**Coût :** Gratuit pour une déclaration simple.  
**Adresse :** Tour Postel 2001, Avenue Marchand, Abidjan-Plateau — www.artci.ci

### 10.3 Déclaration à la CDP (Sénégal)

**Base légale :** Loi n° 2008-12 du 25 janvier 2008

1. Créer un compte sur www.cdp.sn
2. Remplir le formulaire de déclaration en ligne
3. Joindre le DPA signé avec Baobab Loyalty
4. Conserver le récépissé

**Sanction en cas de non-déclaration :** jusqu'à 5 millions de FCFA d'amende.

### 10.4 En cas de violation de données (incident de sécurité)

1. **L'hôtelier contacte Baobab Loyalty** immédiatement : support@baobabloyalty.com
2. **Baobab Loyalty notifie** l'hôtelier dans les **72 heures** avec un rapport d'incident
3. **L'hôtelier notifie** l'autorité compétente de son pays :

| Autorité | Délai légal | Contact |
|----------|------------|---------|
| ARTCI (Côte d'Ivoire) | Dès que possible | www.artci.ci |
| CDP (Sénégal) | Dès que possible | cdp@cdp.sn |
| CNDP (Maroc) | Dès que possible | www.cndp.ma |
| CNIL (France/UE) | **72 heures** | www.cnil.fr |

---

## 11. Contrat de Sous-traitance (DPA) — Résumé

Le **Data Processing Agreement (DPA)** est le contrat légal signé entre Baobab Loyalty (sous-traitant) et chaque hôtelier (responsable de traitement). Il est **obligatoire dans tous les pays**.

### 11.1 Engagements clés de Baobab Loyalty (sous-traitant)

| Obligation | Détail |
|-----------|--------|
| Traitement sur instruction | Baobab Loyalty ne traite les données que sur instruction documentée de l'hôtelier |
| Confidentialité | Tout accès aux données est couvert par une obligation de confidentialité |
| Sécurité technique | Chiffrement TLS 1.3, AES-256, JWT, RLS PostgreSQL, Supabase Vault |
| Notification violations | Notification de l'hôtelier dans les **72 heures** après détection d'une violation |
| Suppression en fin de contrat | Toutes les données supprimées dans les **30 jours** après résiliation |
| Droits des personnes | Assistance à l'hôtelier pour répondre aux exercices de droits (accès, rectification, suppression) |
| Audit | Fourniture de toutes les informations nécessaires à l'audit, avec préavis de 30 jours |

### 11.2 Engagements clés de l'hôtelier (responsable de traitement)

| Obligation | Détail |
|-----------|--------|
| Licéité du traitement | S'assurer d'avoir une base légale valable (intérêt légitime, consentement) |
| Information des clients | Informer les voyageurs du traitement et de leur transmission à Baobab Loyalty |
| Déclarations réglementaires | Effectuer les déclarations ARTCI/CDP/CNDP selon son pays |
| Qualité des données | S'assurer de l'exactitude des données importées |

### 11.3 Sous-traitants ultérieurs autorisés

| Sous-traitant | Pays | Rôle | Données transmises |
|---------------|------|------|--------------------|
| Supabase Inc. | USA (AWS EU West) | Hébergement base de données | Toutes les données |
| Vercel Inc. | USA | Hébergement application web | Aucune donnée client |
| Resend Inc. | USA | Envoi d'emails transactionnels | Email de l'hôtelier uniquement |
| OpenRouter | USA | Génération de texte IA | Texte du message (sans données nominatives) |
| WhatsApp (Meta) | USA | Envoi de messages | Numéro de téléphone / WhatsApp |
| Moneroo | Afrique | Traitement des paiements | Données de facturation hôtelier |

### 11.4 Fin de contrat et sort des données

1. L'hôtelier peut **exporter ses données** via l'interface pendant **30 jours** après résiliation
2. Passé ce délai : **suppression définitive et irréversible** de tous les serveurs
3. Un **certificat de suppression** est fourni sur demande

---

## 12. Notice d'information clients — Template

L'hôtelier est légalement tenu d'informer ses clients (voyageurs) que leurs données sont utilisées dans Baobab Loyalty. Voici le contenu minimal à afficher (à personnaliser avec les informations de l'hôtel) :

### Version Côte d'Ivoire — Conformément à la Loi n° 2013-450

> **Responsable du traitement :** [Nom de l'hôtel], [adresse]
>
> **Finalité :** Fidélisation de la clientèle par l'envoi de communications personnalisées via WhatsApp
>
> **Données traitées :** Nom, téléphone/WhatsApp, email, date de dernière visite
>
> **Sous-traitant :** Baobab Loyalty (prestataire technique — contrat de sous-traitance signé)
>
> **Transfert hors Côte d'Ivoire :** Oui — serveurs AWS EU West (Irlande), protégés par le RGPD. Déclaration ARTCI n° [à compléter]
>
> **Vos droits** (Articles 22 à 29 Loi n° 2013-450) : accès, rectification, opposition — Contact : [email de l'hôtel]
>
> **Réclamations :** ARTCI — Tour Postel 2001, Avenue Marchand, Abidjan-Plateau — www.artci.ci

### Moyens de diffusion recommandés (choisir au moins 2)

- Affichage à la réception (format A4 encadré)
- Inclus dans le formulaire de check-in signé par le client
- Envoi par email à la confirmation de réservation
- Publication sur le site web de l'hôtel (page "Confidentialité")

---

## 13. Registre des activités de traitement — Synthèse

Le registre des traitements documente toutes les activités de traitement de données personnelles effectuées par Baobab Loyalty. Il est obligatoire au titre du RGPD (Article 30) et recommandé dans les pays africains.

### Traitements en tant que sous-traitant (pour les hôteliers)

| Réf. | Traitement | Données | Hébergement |
|------|-----------|---------|-------------|
| ST-01 | Gestion base clients hôtelière | Nom, email, téléphone, WhatsApp, date visite | AWS EU West (Irlande) |
| ST-02 | Envoi campagnes WhatsApp | Numéro de téléphone, texte du message | WhatsApp Business API |
| ST-03 | Tracking réservations et offres | ID client, statut clic, montant réservation | AWS EU West (Irlande) |

### Traitements en tant que responsable de traitement (données des hôteliers abonnés)

| Réf. | Traitement | Base légale |
|------|-----------|------------|
| RT-01 | Gestion des comptes hôteliers | Exécution du contrat |
| RT-02 | Facturation et paiements | Exécution du contrat + obligation légale (7 ans) |
| RT-03 | Emails transactionnels | Exécution du contrat |
| RT-04 | Génération de contenu IA | Intérêt légitime (aucune PII transmise à l'IA) |

---

## 14. Checklist de conformité complète

### Pour l'hôtelier — Actions à effectuer

- [ ] **Signer le DPA** avec Baobab Loyalty (envoyer à support@baobabloyalty.com)
- [ ] **Afficher la Notice d'information** clients à la réception (ou 1 autre canal au moins)
- [ ] Si **Côte d'Ivoire** : déposer le formulaire de déclaration à l'ARTCI (utiliser le Document 04 pré-rempli)
- [ ] Si **Sénégal** : déclarer le traitement sur www.cdp.sn
- [ ] Si **Maroc** : déclarer ou demander autorisation à la CNDP
- [ ] Si **site web** : ajouter un paragraphe "Baobab Loyalty" dans votre politique de confidentialité
- [ ] **Former le personnel** qui accède à Baobab Loyalty (ne jamais partager ses identifiants)
- [ ] Mettre en place un **processus de réponse aux droits** des clients (délai 30 jours)

### Pour Baobab Loyalty — Engagements en place

- [x] DPA disponible et signable (Document 01)
- [x] Hébergement EU West (Irlande) conforme RGPD
- [x] RLS PostgreSQL — isolation totale des données par hôtelier
- [x] JWT authentication + chiffrement TLS 1.3
- [x] Secrets dans Supabase Vault (aucun secret en clair dans le code)
- [x] Procédure de notification violation sous 72h
- [x] Suppression des données à la résiliation sous 30 jours
- [x] Sous-traitants ultérieurs conformes RGPD avec CCT

---

## 15. Exemple de fichier de migration SQL — Sécurité de la table clients

Le fichier suivant, versionné dans le code source sous `supabase/migrations/005_clients_and_config.sql`, montre l'implémentation complète de la sécurité sur la table clients :

```sql
-- Création de la table
CREATE TABLE IF NOT EXISTS public.clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nom             TEXT NOT NULL,
  email           TEXT,
  telephone       TEXT,
  derniere_visite DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances (recherche rapide par hôtelier)
CREATE INDEX IF NOT EXISTS idx_clients_profile
  ON public.clients(profile_id);

CREATE INDEX IF NOT EXISTS idx_clients_derniere_visite
  ON public.clients(profile_id, derniere_visite);

-- ACTIVATION DE LA SÉCURITÉ AU NIVEAU DES LIGNES
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Politique : lecture uniquement de ses propres clients
CREATE POLICY "Users can view own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = profile_id);

-- Politique : insertion uniquement dans son propre compte
CREATE POLICY "Users can insert own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Politique : modification uniquement de ses propres clients
CREATE POLICY "Users can update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = profile_id);

-- Politique : suppression uniquement de ses propres clients
CREATE POLICY "Users can delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = profile_id);

-- Accès service role pour les fonctions backend sécurisées
CREATE POLICY "Service role can manage clients"
  ON public.clients FOR ALL
  USING (auth.role() = 'service_role');
```

Ce fichier est archivé dans le dépôt Git de l'application, versionné et auditable à tout moment.

---

*Document généré le 27 avril 2026 — Baobab Loyalty*
