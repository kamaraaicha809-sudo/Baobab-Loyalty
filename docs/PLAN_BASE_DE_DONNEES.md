# Plan de structure de la base de données — Baobab Loyalty

## Vue d'ensemble

Ce plan étend le schéma existant du template pour supporter le workflow complet : segmentation, offres personnalisables, campagnes, envoi WhatsApp, redemptions et réservations détaillées.

**Périmètre** : Structure uniquement (pas d'auth, RLS ou Edge Functions pour l'instant).

---

## Schéma existant (inchangé)

| Table | Description |
|-------|-------------|
| **profiles** | Utilisateurs (propriétaires d'hôtels) — id, email, full_name, hotel_name, config_complete, role |
| **app_config** | Configuration dynamique (clé/valeur JSONB) |
| **ai_prompts** | Prompts IA système |
| **reservations** | Données de performance (volume, CA) — profile_id, reservation_date, type_reservation, montant_fcfa, hotel_name, source |
| **clients** | Base clients des hôtels — profile_id, nom, email, telephone, derniere_visite, notes |

---

## Nouveau schéma — Tables à créer

### 1. `segments` (référentiel)

Segments prédéfinis pour la segmentation (3, 6, 9 mois, tous).

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| code | TEXT | UNIQUE NOT NULL ('3mois', '6mois', '9mois', 'tous') |
| name | TEXT | NOT NULL |
| description | TEXT | |
| months | INTEGER | NULL (null = segment "tous") |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Index** : `idx_segments_code` sur `code`

---

### 2. `room_types` (types de chambres par hôtel)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| profile_id | UUID | FK profiles(id) ON DELETE CASCADE NOT NULL |
| name | TEXT | NOT NULL |
| description | TEXT | |
| base_price_fcfa | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Index** : `idx_room_types_profile` sur `profile_id`

---

### 3. `offers` (offres personnalisables par hôtel)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| profile_id | UUID | FK profiles(id) ON DELETE CASCADE NOT NULL |
| name | TEXT | NOT NULL |
| description | TEXT | |
| type | TEXT | CHECK IN ('remise','surclassement','cocktail','famille','evenement','autre') |
| value | JSONB | Flexible (%, montant, texte) |
| valid_from | DATE | |
| valid_until | DATE | |
| status | TEXT | DEFAULT 'active', CHECK IN ('active','inactive') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Index** : `idx_offers_profile`, `idx_offers_profile_status`, `idx_offers_validity`

---

### 4. `segment_offers` (liaison segment ↔ offre)

Quelles offres peuvent être envoyées à quels segments.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| segment_code | TEXT | FK segments(code) NOT NULL |
| offer_id | UUID | FK offers(id) ON DELETE CASCADE NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**PK** : (segment_code, offer_id)

**Index** : `idx_segment_offers_offer` sur `offer_id`

---

### 5. `campaigns` (historique des campagnes)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| profile_id | UUID | FK profiles(id) ON DELETE CASCADE NOT NULL |
| name | TEXT | |
| segment_code | TEXT | FK segments(code) NOT NULL |
| offer_id | UUID | FK offers(id) ON DELETE SET NULL |
| started_at | TIMESTAMPTZ | DEFAULT NOW() |
| ended_at | TIMESTAMPTZ | |
| status | TEXT | DEFAULT 'draft', CHECK IN ('draft','sending','completed','failed') |
| recipient_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Index** : `idx_campaigns_profile`, `idx_campaigns_started_at`

---

### 6. `sent_messages` (journal des messages envoyés)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| campaign_id | UUID | FK campaigns(id) ON DELETE SET NULL |
| client_id | UUID | FK clients(id) ON DELETE CASCADE NOT NULL |
| offer_id | UUID | FK offers(id) ON DELETE SET NULL |
| profile_id | UUID | FK profiles(id) ON DELETE CASCADE NOT NULL |
| sent_at | TIMESTAMPTZ | DEFAULT NOW() |
| channel | TEXT | DEFAULT 'whatsapp', CHECK IN ('whatsapp','email') |
| message_content | TEXT | |
| template_id | TEXT | |
| status | TEXT | DEFAULT 'sent', CHECK IN ('sent','delivered','read','failed') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Index** : `idx_sent_messages_campaign`, `idx_sent_messages_client`, `idx_sent_messages_profile`, `idx_sent_messages_sent_at`

---

### 7. `redemptions` (clics sur le bouton Réserver)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| client_id | UUID | FK clients(id) ON DELETE CASCADE NOT NULL |
| offer_id | UUID | FK offers(id) ON DELETE SET NULL |
| sent_message_id | UUID | FK sent_messages(id) ON DELETE SET NULL |
| profile_id | UUID | FK profiles(id) ON DELETE CASCADE NOT NULL |
| redemption_date | TIMESTAMPTZ | DEFAULT NOW() |
| status | TEXT | DEFAULT 'clicked', CHECK IN ('clicked','pending_booking','booked','cancelled') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Index** : `idx_redemptions_client`, `idx_redemptions_offer`, `idx_redemptions_profile`

---

## Modifications des tables existantes

### `clients` — ajout colonne

| Colonne | Type | Description |
|---------|------|-------------|
| whatsapp | TEXT | Numéro WhatsApp dédié (format +221...) |

---

### `reservations` — ajout colonnes

Les réservations existantes restent des données de performance (client_id, offer_id, etc. = NULL). Les nouvelles réservations issues du bouton WhatsApp rempliront ces champs.

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| client_id | UUID | OUI | FK clients(id) — client qui a réservé |
| offer_id | UUID | OUI | FK offers(id) — offre ayant généré la réservation |
| redemption_id | UUID | OUI | FK redemptions(id) — traçabilité du clic |
| room_type_id | UUID | OUI | FK room_types(id) |
| check_in_date | DATE | OUI | Date d'arrivée |
| check_out_date | DATE | OUI | Date de départ |
| number_of_rooms | INTEGER | OUI | Nombre de chambres (DEFAULT 1) |

---

## Diagramme des relations

```
profiles ──┬── clients (profile_id)
           ├── room_types (profile_id)
           ├── offers (profile_id)
           ├── campaigns (profile_id)
           ├── sent_messages (profile_id)
           └── reservations (profile_id)

segments ──┬── segment_offers (segment_code)
           └── campaigns (segment_code)

offers ────┬── segment_offers (offer_id)
           ├── campaigns (offer_id)
           ├── sent_messages (offer_id)
           ├── redemptions (offer_id)
           └── reservations (offer_id)

clients ───┬── sent_messages (client_id)
           ├── redemptions (client_id)
           └── reservations (client_id)

campaigns ─── sent_messages (campaign_id)

sent_messages ─── redemptions (sent_message_id)

redemptions ─── reservations (redemption_id)

room_types ─── reservations (room_type_id)
```

---

## Ordre d'exécution des migrations

| # | Fichier | Description |
|---|---------|-------------|
| 1 | `006_segments.sql` | Table segments + données de référence |
| 2 | `007_room_types.sql` | Table room_types |
| 3 | `008_offers.sql` | Table offers |
| 4 | `009_segment_offers.sql` | Table segment_offers |
| 5 | `010_campaigns.sql` | Table campaigns |
| 6 | `011_sent_messages.sql` | Table sent_messages |
| 7 | `012_redemptions.sql` | Table redemptions |
| 8 | `013_clients_whatsapp.sql` | Ajout colonne whatsapp à clients |
| 9 | `014_reservations_extend.sql` | Extension de la table reservations |

> **Note** : La migration `013_clients_whatsapp.sql` a été appliquée manuellement via `execute_sql` en raison d’un conflit de version dans le système de migrations. La colonne `whatsapp` est bien présente sur la table `clients`.

---

## Compatibilité

- **Rétrocompatibilité** : Les tables existantes ne sont pas modifiées dans leur structure actuelle, uniquement étendues (ALTER TABLE ADD COLUMN).
- **Données existantes** : Les réservations actuelles conservent client_id, offer_id, redemption_id, etc. à NULL (données de performance).
- **Code existant** : Les requêtes actuelles sur clients, reservations, profiles restent valides.

---

## Optimisations (migration 015)

| Optimisation | Bénéfice |
|--------------|----------|
| **get_segment_counts()** | Fonction SQL — 1 requête au lieu de charger tous les clients + calcul JS |
| **get_reservations_chart()** | Agrégation côté DB — pas de transfert de données brutes |
| **Index** | profiles.email, clients(whatsapp), sent_messages(profile,sent_at), campaigns(profile,status), offers(active) |
| **RLS** | Sécurité sur room_types, offers, segment_offers, campaigns, sent_messages, redemptions |
| **Contrainte** | offers : valid_until >= valid_from |
| **Import clients** | Bulk insert par lots de 100 (SDK) |
