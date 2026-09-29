# Registre des traitements — Baobab Loyalty (First Digital Prod SARL)

Document interne de conformité. Non destiné à la publication sur le site. À tenir à jour à chaque évolution de fonctionnalité touchant des données personnelles. Sert de base aux formalités auprès de l'ARTCI (loi n° 2013-450 du 19 juin 2013).

Dernière mise à jour : 29 septembre 2026

Responsable du registre : First Digital Prod SARL (nom commercial : Baobab Loyalty) — RCCM CI-BAS-01-2026-B12-00604 — siège : Grand-Bassam, CAFOP 1, 10 BP 605 ABJ 10 — legal@baobabloyalty.com

Hébergement de la base de données : Supabase, région eu-west-1 (Irlande, infrastructure AWS) — vérifié le 29/09/2026. Tous les prestataires listés ci-dessous sont situés hors CEDEAO : transferts soumis à l'autorisation préalable de l'ARTCI (loi n° 2013-450, art. 7 et 26).

---

## 1. Gestion des comptes hôteliers

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : création et gestion du compte utilisateur hôtelier, authentification, facturation
- **Base légale** : exécution du contrat (CGU/CGV)
- **Catégories de personnes concernées** : utilisateurs hôteliers (propriétaires/gestionnaires d'hôtel) et leurs membres d'équipe invités
- **Catégories de données** : nom, prénom, email, mot de passe (haché), hôtel, rôle
- **Destinataires internes** : équipe Baobab Loyalty (accès technique restreint)
- **Sous-traitants** : Supabase (auth + DB, Irlande — société éditrice États-Unis), Vercel (hébergement de l'application, États-Unis), Moneroo (paiement), Resend (emails, États-Unis)
- **Transferts hors CEDEAO** : oui (Irlande, États-Unis)
- **Durée de conservation** : durée de l'abonnement + 3 ans
- **Table(s) concernée(s)** : `profiles`
- **Mesures de sécurité** : RLS Supabase, mots de passe hachés, authentification par email vérifié

## 2. Preuve d'acceptation des CGU / CGV / DPA

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : prouver l'acceptation expresse des conditions contractuelles par chaque compte
- **Base légale** : exécution du contrat / intérêt légitime (preuve)
- **Catégories de données** : identifiant du compte, version des documents acceptés, date d'acceptation (posée par le serveur)
- **Table(s) concernée(s)** : `legal_acceptances` (ajout seul), `profiles.terms_version`, `profiles.terms_accepted_at` (migration 059)
- **Durée de conservation** : durée de vie du compte
- **Mesures de sécurité** : écriture uniquement via la fonction `accept_legal_terms` (SECURITY DEFINER), lecture limitée au compte concerné (RLS)

## 3. Base clients de l'hôtel (fidélisation)

- **Responsable du traitement** : l'hôtel (voir [DPA](../app/legal/dpa/page.tsx))
- **Sous-traitant** : First Digital Prod SARL
- **Finalité** : segmentation et relance des clients de l'hôtel pour fidélisation
- **Base légale** : consentement préalable du client pour toute prospection par WhatsApp/SMS (loi n° 2013-546, art. 14) ; exécution du contrat hôtel ↔ Baobab pour le stockage
- **Catégories de personnes concernées** : clients ayant réservé/séjourné dans un hôtel utilisateur de Baobab Loyalty
- **Catégories de données** : nom, téléphone/WhatsApp, email, date et fréquence de séjour, historique de réservation, date de naissance (optionnelle), accord WhatsApp (`marketing_consent`, `marketing_consent_at`, `marketing_consent_source`, `opted_out_at`)
- **Sources de collecte** : import CSV (historique), registre numérique (saisie à la réception, `/dashboard/registre`). Le registre numérique ne remplace pas la fiche de police de l'hôtel ; les données de la fiche de police ne peuvent pas servir à la prospection sans accord du client.
- **Destinataires internes** : hôtel propriétaire de la donnée uniquement (cloisonnement RLS par `profile_id`)
- **Sous-traitants** : Supabase (stockage, Irlande)
- **Transferts hors CEDEAO** : oui (Irlande)
- **Durée de conservation** : durée de l'abonnement de l'hôtel ; suppression 30 jours après résiliation sauf export demandé
- **Table(s) concernée(s)** : `clients`
- **Mesures de sécurité** : RLS par hôtel, import CSV validé côté serveur, horodatage serveur de chaque accord (trigger `stamp_marketing_consent`, migration 058)

## 4. Segmentation et offres

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : First Digital Prod SARL
- **Finalité** : classification des clients par ancienneté (3/6/9 mois, tous) et association à des offres
- **Base légale** : exécution du contrat avec l'hôtel
- **Catégories de données** : dérivées des données clients (aucune donnée supplémentaire collectée)
- **Table(s) concernée(s)** : `segments`, `segment_offers`, `offers`, `room_types`
- **Transferts hors CEDEAO** : oui (Supabase, Irlande)
- **Durée de conservation** : durée de l'abonnement

## 5. Campagnes WhatsApp / email

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : First Digital Prod SARL ; sous-traitants ultérieurs : Meta (WhatsApp Business Platform), Resend (email)
- **Finalité** : envoi de messages promotionnels/fidélisation aux clients de l'hôtel
- **Base légale** : consentement préalable (loi n° 2013-546, art. 14). Depuis la migration 058 (29/09/2026), un client est « sans accord » par défaut ; `campaign-send` n'envoie qu'aux clients avec `marketing_consent = true`, revérifié au moment exact de l'envoi.
- **Catégories de données** : numéro WhatsApp/email, contenu du message envoyé, statut d'envoi
- **Table(s) concernée(s)** : `campaigns`, `sent_messages`
- **Transferts hors CEDEAO** : oui (Meta, Resend — États-Unis)
- **Durée de conservation** : historique conservé pendant la durée de l'abonnement (statistiques de campagne)
- **Opposition** : lien de désinscription personnalisé dans chaque message (`/desinscription`) et mot-clé STOP (webhook WhatsApp) — loi n° 2013-546, art. 15

## 6. Messages d'anniversaire automatiques

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : First Digital Prod SARL ; sous-traitant ultérieur : Meta (WhatsApp)
- **Finalité** : envoi automatique d'un message le jour de l'anniversaire du client (plans Pro et Premium)
- **Base légale** : consentement préalable (même accord WhatsApp que les campagnes : `birthday-worker` filtre sur `marketing_consent`)
- **Catégories de données** : nom, numéro WhatsApp, date de naissance, année du dernier envoi
- **Table(s) concernée(s)** : `clients.date_naissance`, `clients.last_birthday_sent_year`, `campaigns` (type `birthday`)
- **Transferts hors CEDEAO** : oui (Supabase, Meta)
- **Durée de conservation** : durée de l'abonnement

## 7. Génération de messages par IA

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : rédaction assistée des messages de campagne et recommandations
- **Catégories de données** : type d'offre, avantage, segment ciblé, nom de l'hôtel, chiffres agrégés (nombre de clients par segment, taux de conversion). **Aucune donnée personnelle de client n'est envoyée** (vérifié dans `src/sdk/ai.ts` le 29/09/2026).
- **Sous-traitant** : OpenRouter (États-Unis)
- **Transferts hors CEDEAO** : oui (États-Unis), sans donnée personnelle de client

## 8. Tracking des offres et réservations

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : First Digital Prod SARL
- **Finalité** : mesure de l'efficacité des campagnes (clics, réservations générées), calcul du ROI
- **Base légale** : intérêt légitime de l'hôtel (mesure de performance)
- **Catégories de données** : identifiant client, offre consultée, statut (clicked/booked/cancelled), montant de la réservation
- **Table(s) concernée(s)** : `redemptions`, `reservations`
- **Accès public partiel** : la page `/offre` est accessible sans authentification via un lien WhatsApp (service role Supabase pour créer la réservation)
- **Transferts hors CEDEAO** : oui (Supabase)
- **Durée de conservation** : durée de l'abonnement

## 9. Facturation et paiement

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : gestion des abonnements et du frais d'intégration (FCFA)
- **Base légale** : exécution du contrat + obligation légale (conservation comptable)
- **Catégories de données** : montant, statut de paiement, moyen de paiement (Mobile Money/carte) ; les données bancaires elles-mêmes sont détenues par Moneroo, non par Baobab
- **Sous-traitant** : Moneroo (Axa Zara LLC, Delaware, États-Unis)
- **Transferts hors CEDEAO** : à confirmer auprès de Moneroo (lieu de traitement réel)
- **Durée de conservation** : 10 ans (obligation comptable OHADA)
- **Facture électronique** : la FNE (DGI) est obligatoire pour toutes les entreprises depuis le 1er décembre 2025 ; module `fne-worker` présent mais désactivé tant que le NCC n'est pas confirmé

## 10. Support client et exercice des droits

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : traitement des demandes d'assistance et des demandes d'exercice de droits
- **Base légale** : intérêt légitime / obligation légale (droits des personnes)
- **Canal** : legal@baobabloyalty.com
- **Durée de conservation** : 12 mois après clôture de la demande

## 11. Mesure d'audience du site public (PostHog)

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : comprendre l'usage des pages marketing publiques (pages vues, clics) pour améliorer le site
- **Base légale** : consentement (bandeau cookies)
- **Catégories de personnes concernées** : visiteurs du site public ayant cliqué sur « Accepter »
- **Catégories de données** : pages vues, interactions, informations techniques (appareil, navigateur, pays approximatif) — jamais de données de comptes hôteliers ni de clients d'hôtel
- **Sous-traitant** : PostHog (États-Unis)
- **Transferts hors CEDEAO** : oui (États-Unis)
- **Durée de conservation** : NON VÉRIFIÉ — à contrôler dans le tableau de bord PostHog (paramètres de rétention du projet)
- **Périmètre technique vérifié le 27/08/2026** : `posthog.init()` n'est jamais appelé avant un clic explicite sur « Accepter » ; l'outil est exclu de tout chemin `/dashboard` ou `/admin` (voir `components/common/PostHogProvider.tsx`)

## 12. Newsletter de Baobab Loyalty

- **Responsable du traitement** : First Digital Prod SARL
- **Finalité** : envoi de la newsletter mensuelle aux hôteliers inscrits
- **Base légale** : consentement (inscription volontaire via le formulaire du site)
- **Catégories de données** : email, date d'inscription
- **Sous-traitant** : Resend (États-Unis)
- **Transferts hors CEDEAO** : oui (États-Unis)

---

## Points ouverts à traiter en priorité

1. **Formalités ARTCI** : déclaration des traitements dont First Digital Prod SARL est responsable (1, 2, 7, 9, 10, 11, 12) et demande d'autorisation de transfert hors CEDEAO pour tous les prestataires. Formulaires : autoritedeprotection.ci (rubrique Formulaires) ; frais fixés par la décision ARTCI n° 2016-0201. NON FAIT — action humaine requise (avec un juriste).
2. Régime fiscal réel de First Digital Prod SARL non confirmé — impacte la mention TVA dans les CGV (`app/legal/cgv/page.tsx`, section 2) et l'activation de la FNE. NON VÉRIFIÉ — action humaine requise (comptable).
3. Lieu de traitement des données de paiement chez Moneroo. NON VÉRIFIÉ — action humaine requise (contacter Moneroo).
4. Durée de rétention des données PostHog. NON VÉRIFIÉ — action humaine requise (tableau de bord PostHog).
5. ~~Mécanisme de consentement/désinscription WhatsApp~~ — Désinscription résolue le 27/08/2026 ; accord préalable (opt-in) en place depuis le 29/09/2026 (migration 058).
6. ~~RCCM en cours d'enregistrement~~ — Résolu : RCCM CI-BAS-01-2026-B12-00604.
