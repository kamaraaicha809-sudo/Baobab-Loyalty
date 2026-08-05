# REGISTRE DES ACTIVITÉS DE TRAITEMENT
## Baobab Loyalty — Document interne

**Conformément à :** Article 30 du RGPD · Article 8 de la Loi n° 2013-450 (Côte d'Ivoire) · Loi n° 2008-12 (Sénégal)

**Responsable du registre :** Équipe Baobab Loyalty  
**Dernière mise à jour :** Avril 2026  
**Classification :** Usage interne — Confidentiel

---

## PARTIE I — INFORMATIONS SUR BAOBAB LOYALTY

| Champ | Information |
|-------|-------------|
| Raison sociale | Baobab Loyalty |
| Rôle dans les traitements | Sous-traitant (pour les données clients des hôteliers) ET Responsable de traitement (pour les données de ses propres clients/abonnés) |
| Email de contact DPO | support@baobabloyalty.com |
| Site web | baobabloyalty.com |

---

## PARTIE II — TRAITEMENTS EN TANT QUE SOUS-TRAITANT

> Ces traitements sont effectués **pour le compte des hôteliers** (responsables de traitement). Les hôteliers décident de la finalité et des modalités. Baobab Loyalty exécute uniquement sur instruction.

---

### Traitement ST-01 — Gestion de la base clients hôtelière

| Champ | Détail |
|-------|--------|
| **Identifiant** | ST-01 |
| **Intitulé** | Gestion de la base de données clients pour fidélisation hôtelière |
| **Responsable de traitement** | Les hôteliers abonnés à Baobab Loyalty (chacun pour ses propres clients) |
| **Finalité** | Stocker, segmenter et gérer la base clients de l'hôtelier pour l'envoi de campagnes de fidélisation WhatsApp |
| **Base légale (côté hôtelier)** | Intérêt légitime du responsable de traitement (Article 6.1.f RGPD) |
| **Données traitées** | Nom/prénom, email, téléphone, numéro WhatsApp, date de dernière visite, notes internes |
| **Personnes concernées** | Clients (voyageurs) des hôtels abonnés |
| **Durée de conservation** | Pendant la durée du compte actif + 30 jours après résiliation |
| **Hébergement** | Supabase Inc. — AWS EU West (Irlande) |
| **Sécurité** | RLS PostgreSQL, JWT, TLS 1.3, AES-256, Supabase Vault |
| **Transfert international** | Oui — UE (Irlande) via AWS. Couvert par RGPD + CCT Commission Européenne |
| **Sous-traitants ultérieurs** | Supabase Inc. (hébergement), WhatsApp/Meta (envoi) |

---

### Traitement ST-02 — Envoi de campagnes WhatsApp

| Champ | Détail |
|-------|--------|
| **Identifiant** | ST-02 |
| **Intitulé** | Envoi de messages WhatsApp de fidélisation aux clients des hôtels |
| **Responsable de traitement** | Les hôteliers abonnés |
| **Finalité** | Transmettre des messages commerciaux personnalisés (offres, promotions) aux clients de l'hôtelier via WhatsApp |
| **Base légale (côté hôtelier)** | Intérêt légitime |
| **Données traitées** | Numéro de téléphone/WhatsApp du client, texte du message |
| **Personnes concernées** | Clients des hôtels ayant un numéro WhatsApp enregistré |
| **Durée de conservation (logs)** | 3 ans après l'envoi (traçabilité) |
| **Hébergement** | Supabase (table sent_messages) + WhatsApp Business API |
| **Sous-traitants ultérieurs** | WhatsApp Business API (Meta Platforms) |

---

### Traitement ST-03 — Tracking des réservations et offres

| Champ | Détail |
|-------|--------|
| **Identifiant** | ST-03 |
| **Intitulé** | Suivi des clics sur les offres et des réservations générées |
| **Responsable de traitement** | Les hôteliers abonnés |
| **Finalité** | Mesurer l'efficacité des campagnes (clics, réservations converties, revenus) |
| **Base légale (côté hôtelier)** | Intérêt légitime |
| **Données traitées** | Identifiant client, statut du clic (clicked/booked/cancelled), date et montant de réservation |
| **Personnes concernées** | Clients des hôtels ayant cliqué sur un lien WhatsApp |
| **Durée de conservation** | 5 ans (obligation comptable) |
| **Hébergement** | Supabase (tables redemptions, reservations) |

---

## PARTIE III — TRAITEMENTS EN TANT QUE RESPONSABLE DE TRAITEMENT

> Ces traitements concernent les **données des hôteliers eux-mêmes** (abonnés), pas leurs clients.

---

### Traitement RT-01 — Gestion des comptes hôteliers (abonnés)

| Champ | Détail |
|-------|--------|
| **Identifiant** | RT-01 |
| **Intitulé** | Gestion des comptes utilisateurs (hôteliers abonnés) |
| **Responsable de traitement** | Baobab Loyalty |
| **Finalité** | Création et gestion des comptes hôteliers, authentification, configuration de l'hôtel |
| **Base légale** | Exécution du contrat d'abonnement (Article 6.1.b RGPD) |
| **Données traitées** | Email professionnel, nom de l'hôtel, pays, adresse, numéro de téléphone, rôle (admin/utilisateur) |
| **Personnes concernées** | Hôteliers abonnés et leurs employés ayant accès à Baobab Loyalty |
| **Durée de conservation** | Durée de l'abonnement + 3 ans après clôture (obligation légale comptable) |
| **Hébergement** | Supabase (table profiles) — AWS EU West (Irlande) |
| **Sous-traitants** | Supabase Inc. (hébergement), Vercel Inc. (serveur web) |
| **Droits** | Accès : support@baobabloyalty.com — Délai de réponse : 30 jours |

---

### Traitement RT-02 — Facturation et paiements

| Champ | Détail |
|-------|--------|
| **Identifiant** | RT-02 |
| **Intitulé** | Traitement des paiements et gestion des abonnements |
| **Responsable de traitement** | Baobab Loyalty |
| **Finalité** | Facturation des abonnements SaaS (plans Essentiel, Croissance, Premium) |
| **Base légale** | Exécution du contrat + obligation légale (comptabilité, Article 6.1.b et 6.1.c RGPD) |
| **Données traitées** | Email, nom de l'hôtelier, montant de l'abonnement, historique des paiements, identifiants Stripe/Moneroo |
| **Personnes concernées** | Hôteliers abonnés |
| **Durée de conservation** | 7 ans (obligation légale comptable) |
| **Hébergement** | Stripe Inc. (Europe) et Moneroo (Afrique) |
| **Sous-traitants** | Stripe Inc. (paiements carte), Moneroo (paiements FCFA) |

---

### Traitement RT-03 — Emails transactionnels

| Champ | Détail |
|-------|--------|
| **Identifiant** | RT-03 |
| **Intitulé** | Envoi d'emails transactionnels aux hôteliers |
| **Responsable de traitement** | Baobab Loyalty |
| **Finalité** | Confirmation d'inscription, récupération de mot de passe, notifications de facturation |
| **Base légale** | Exécution du contrat (Article 6.1.b RGPD) |
| **Données traitées** | Email de l'hôtelier uniquement |
| **Personnes concernées** | Hôteliers abonnés |
| **Durée de conservation** | Logs conservés 1 an |
| **Sous-traitant** | Resend Inc. (envoi d'emails) |

---

### Traitement RT-04 — Génération de contenu par IA

| Champ | Détail |
|-------|--------|
| **Identifiant** | RT-04 |
| **Intitulé** | Génération automatique de messages marketing via IA |
| **Responsable de traitement** | Baobab Loyalty |
| **Finalité** | Aider les hôteliers à rédiger des messages de campagne WhatsApp via intelligence artificielle |
| **Base légale** | Intérêt légitime (amélioration du service) |
| **Données traitées** | Texte du message uniquement — aucune donnée nominative des clients des hôtels n'est transmise à l'IA |
| **Personnes concernées** | Aucune personne physique identifiable dans les données transmises |
| **Durée de conservation** | Non applicable (traitement en temps réel, pas de stockage) |
| **Sous-traitant** | OpenRouter Inc. (routage vers modèles IA) |

---

## PARTIE IV — SOUS-TRAITANTS ULTÉRIEURS DE BAOBAB LOYALTY

| Sous-traitant | Pays siège | Données pays stockage | Rôle | Conformité |
|---------------|------------|----------------------|------|------------|
| **Supabase Inc.** | États-Unis | AWS EU West (Irlande) | Hébergement base de données | RGPD + CCT |
| **Vercel Inc.** | États-Unis | AWS (multi-région) | Hébergement application web | RGPD + CCT |
| **Resend Inc.** | États-Unis | AWS (US-East) | Envoi d'emails transactionnels | RGPD + CCT |
| **OpenRouter Inc.** | États-Unis | États-Unis | Routage IA (pas de stockage de données clients) | Conditions d'utilisation |
| **WhatsApp Business API (Meta)** | États-Unis | Multi-région | Envoi de messages WhatsApp | CCT |
| **Stripe Inc.** | États-Unis | Irlande (EU) | Paiements carte internationale | RGPD + PCI-DSS |
| **Moneroo** | Afrique | Afrique | Paiements FCFA | Réglementations locales |

---

## PARTIE V — VIOLATIONS DE DONNÉES — REGISTRE DES INCIDENTS

> Ce registre doit être complété à chaque incident de sécurité détecté.

| N° | Date détection | Nature de l'incident | Données concernées | Hôteliers affectés | Actions prises | Notification hôteliers | Notification autorité |
|----|---------------|---------------------|-------------------|-------------------|----------------|----------------------|----------------------|
| — | — | *Aucun incident à ce jour* | — | — | — | — | — |

**Procédure en cas d'incident :**
1. Détection de l'incident → alerte interne immédiate
2. Évaluation du risque (données concernées, nombre de personnes)
3. Notification des hôteliers affectés **dans les 72 heures**
4. Si risque élevé : notification des autorités (ARTCI, CDP, CNIL selon pays)
5. Documentation dans ce registre
6. Rapport d'incident détaillé fourni aux hôteliers

---

## PARTIE VI — DROITS DES PERSONNES — REGISTRE DES DEMANDES

> Ce registre doit être complété à chaque demande d'exercice des droits.

| N° | Date réception | Type de demande | Canal | Répondu le | Délai (jours) | Résultat |
|----|---------------|----------------|-------|-----------|--------------|---------|
| — | — | *Aucune demande à ce jour* | — | — | — | — |

**Procédure :**
- Délai de réponse maximal : **30 jours**
- Contact : support@baobabloyalty.com
- En cas de demande complexe : délai extensible à 90 jours avec notification à la personne

---

## PARTIE VII — AUDITS ET RÉVISIONS

| Date | Type de révision | Modifications apportées | Responsable |
|------|-----------------|------------------------|-------------|
| Avril 2026 | Création initiale du registre | Document créé — version 1.0 | Équipe Baobab Loyalty |
| *À compléter* | *Révision annuelle recommandée* | — | — |

**Fréquence de révision recommandée :** Annuelle, ou à chaque changement significatif (nouveau sous-traitant, nouvelle fonctionnalité traitant des données personnelles, changement de prestataire d'hébergement).

---

## PARTIE VIII — MESURES ORGANISATIONNELLES

### 8.1 Accès aux données

| Rôle | Accès aux données clients des hôtels | Niveau d'accès |
|------|-------------------------------------|----------------|
| Hôtelier (abonné) | Oui | Ses clients uniquement (RLS) |
| Employés hôtelier | Oui | Idem (même compte hôtelier) |
| Équipe technique Baobab Loyalty | Oui, limité | Via Supabase Dashboard, maintenance uniquement |
| Support client Baobab Loyalty | Non | Pas d'accès direct aux données clients |

### 8.2 Engagements du personnel Baobab Loyalty

Tout membre de l'équipe Baobab Loyalty ayant accès aux données s'engage à :
- Respecter la confidentialité des données traitées
- Ne pas partager ses identifiants d'accès Supabase
- Signaler immédiatement tout accès suspect ou incident de sécurité
- Ne pas utiliser les données clients des hôteliers à d'autres fins que la maintenance technique

### 8.3 Politique de suppression des données

Conformément au DPA signé avec chaque hôtelier :
- Résiliation du compte → export disponible pendant **30 jours**
- Après 30 jours → suppression définitive et irréversible
- Sur demande → **certificat de suppression** fourni dans les 15 jours

---

*Document établi par Baobab Loyalty — Avril 2026*
*Ce registre est un document vivant, à mettre à jour à chaque changement significatif.*
*Conservé de manière confidentielle et transmissible aux autorités de contrôle sur demande.*
