# Registre des traitements — Baobab Loyalty SAS

Document interne de conformité. Non destiné à la publication sur le site. À tenir à jour à chaque évolution de fonctionnalité touchant des données personnelles.

Dernière mise à jour : 27 août 2026

Responsable du registre : Baobab Loyalty SAS — legal@baobabloyalty.com

---

## 1. Gestion des comptes hôteliers

- **Responsable du traitement** : Baobab Loyalty SAS
- **Finalité** : création et gestion du compte utilisateur hôtelier, authentification, facturation
- **Base légale** : exécution du contrat (CGU/CGV)
- **Catégories de personnes concernées** : utilisateurs hôteliers (propriétaires/gestionnaires d'hôtel) et leurs membres d'équipe invités
- **Catégories de données** : nom, prénom, email, mot de passe (haché), hôtel, rôle
- **Destinataires internes** : équipe Baobab Loyalty (accès technique restreint)
- **Sous-traitants** : Supabase (auth + DB, hébergement Irlande/UE — société éditrice États-Unis), Moneroo (paiement, Afrique), Resend (emails, États-Unis)
- **Transferts hors Côte d'Ivoire** : oui (Supabase — Irlande ; Resend — États-Unis)
- **Durée de conservation** : durée de l'abonnement + 3 ans
- **Table(s) concernée(s)** : `profiles`
- **Mesures de sécurité** : RLS Supabase, mots de passe hachés, authentification par email vérifié

## 2. Base clients de l'hôtel (fidélisation)

- **Responsable du traitement** : l'hôtel (voir [DPA](../app/legal/dpa/page.tsx))
- **Sous-traitant** : Baobab Loyalty SAS
- **Finalité** : segmentation et relance des clients de l'hôtel pour fidélisation
- **Base légale** : intérêt légitime de l'hôtel / consentement selon le canal (cf. point 4)
- **Catégories de personnes concernées** : clients ayant réservé/séjourné dans un hôtel utilisateur de Baobab Loyalty
- **Catégories de données** : nom, téléphone/WhatsApp, email, date et fréquence de séjour, historique de réservation
- **Destinataires internes** : hôtel propriétaire de la donnée uniquement (cloisonnement RLS par `profile_id`)
- **Sous-traitants** : Supabase (stockage, Irlande/UE)
- **Transferts hors Côte d'Ivoire** : oui (Supabase — Irlande)
- **Durée de conservation** : durée de l'abonnement de l'hôtel ; suppression 30 jours après résiliation sauf export demandé
- **Table(s) concernée(s)** : `clients`
- **Mesures de sécurité** : RLS par hôtel, import CSV validé côté serveur

## 3. Segmentation et offres

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : Baobab Loyalty SAS
- **Finalité** : classification des clients par ancienneté (3/6/9 mois, tous) et association à des offres
- **Base légale** : exécution du contrat avec l'hôtel
- **Catégories de données** : dérivées des données clients (aucune donnée supplémentaire collectée)
- **Table(s) concernée(s)** : `segments`, `segment_offers`, `offers`, `room_types`
- **Transferts hors Côte d'Ivoire** : oui (Supabase)
- **Durée de conservation** : durée de l'abonnement

## 4. Campagnes WhatsApp / email

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : Baobab Loyalty SAS ; sous-traitants ultérieurs : Meta (WhatsApp Business Platform), Resend (email), OpenRouter (génération IA du contenu)
- **Finalité** : envoi de messages promotionnels/fidélisation aux clients de l'hôtel
- **Base légale** : à documenter par chaque hôtel selon son mode de collecte du numéro WhatsApp/email (consentement recommandé pour la prospection ; intérêt légitime possible pour la relation client existante)
- **Catégories de données** : numéro WhatsApp/email, contenu du message envoyé, statut d'envoi
- **Table(s) concernée(s)** : `campaigns`, `sent_messages`
- **Transferts hors Côte d'Ivoire** : oui (Meta, Resend, OpenRouter — États-Unis)
- **Durée de conservation** : historique conservé pendant la durée de l'abonnement (statistiques de campagne)
- **Point de vigilance ouvert** : mécanisme de désinscription/opposition à mettre en place techniquement (voir le chantier "Consentement & désinscription WhatsApp" identifié séparément)

## 5. Tracking des offres et réservations

- **Responsable du traitement** : l'hôtel
- **Sous-traitant** : Baobab Loyalty SAS
- **Finalité** : mesure de l'efficacité des campagnes (clics, réservations générées), calcul du ROI
- **Base légale** : intérêt légitime de l'hôtel (mesure de performance) et de Baobab (facturation à la valeur)
- **Catégories de données** : identifiant client, offre consultée, statut (clicked/booked/cancelled), montant de la réservation
- **Table(s) concernée(s)** : `redemptions`, `reservations`
- **Accès public partiel** : la page `/offre` est accessible sans authentification via un lien WhatsApp (service role Supabase pour créer la réservation)
- **Transferts hors Côte d'Ivoire** : oui (Supabase)
- **Durée de conservation** : durée de l'abonnement

## 6. Facturation et paiement

- **Responsable du traitement** : Baobab Loyalty SAS
- **Finalité** : gestion des abonnements, paiement des plans FCFA
- **Base légale** : exécution du contrat + obligation légale (conservation comptable)
- **Catégories de données** : montant, statut de paiement, moyen de paiement (Mobile Money/carte) ; les données bancaires elles-mêmes sont détenues par Moneroo, non par Baobab
- **Sous-traitant** : Moneroo
- **Transferts hors Côte d'Ivoire** : à vérifier auprès de Moneroo (prestataire africain)
- **Durée de conservation** : 10 ans (obligation comptable OHADA)

## 7. Support client

- **Responsable du traitement** : Baobab Loyalty SAS
- **Finalité** : traitement des demandes d'assistance et des demandes d'exercice de droits
- **Base légale** : intérêt légitime / obligation légale (droits des personnes)
- **Canal** : legal@baobabloyalty.com
- **Durée de conservation** : 12 mois après clôture de la demande

## 8. Mesure d'audience du site public (PostHog)

- **Responsable du traitement** : Baobab Loyalty SAS
- **Finalité** : comprendre l'usage des pages marketing publiques (pages vues, clics) pour améliorer le site
- **Base légale** : consentement (bandeau cookies)
- **Catégories de personnes concernées** : visiteurs du site public ayant cliqué sur « Accepter »
- **Catégories de données** : pages vues, interactions, informations techniques (appareil, navigateur, pays approximatif) — jamais de données de comptes hôteliers ni de clients d'hôtel
- **Sous-traitant** : PostHog (États-Unis)
- **Transferts hors Côte d'Ivoire** : oui (PostHog — États-Unis)
- **Durée de conservation** : durée définie par les paramètres du compte PostHog — NON VÉRIFIÉ, à contrôler dans le tableau de bord PostHog (paramètres de rétention des données du projet)
- **Périmètre technique vérifié le 27/08/2026** : `posthog.init()` n'est jamais appelé avant un clic explicite sur « Accepter » (aucune requête réseau constatée avant consentement, ni en cas de refus) ; l'outil est architecturalement exclu de tout chemin `/dashboard` ou `/admin`, y compris lors d'une navigation interne sans rechargement complet — vérifié par test automatisé réel (voir composant `components/common/PostHogProvider.tsx`)
- **Point de vigilance restant** : `session_recording.maskAllInputs` est activé (aucune valeur de champ de saisie capturée en clair) sur les pages où PostHog tourne ; la rétention exacte des données côté PostHog et les réglages de partage du projet restent NON VÉRIFIÉS (accès au tableau de bord PostHog nécessaire, hors périmètre du code)

---

## Points ouverts à traiter en priorité

1. Régime fiscal réel de Baobab Loyalty SAS non confirmé — impacte la mention TVA dans les CGV (voir `app/legal/cgv/page.tsx`, section 2). NON VÉRIFIÉ — action humaine requise (comptable).
2. ~~Mécanisme technique de consentement/désinscription WhatsApp non encore implémenté~~ — Résolu le 27/08/2026 (lien de désinscription automatique + toggle manuel, voir mémoire `project_whatsapp_consentement_desinscription`).
3. Vérifier auprès de Moneroo si les données de paiement transitent hors Côte d'Ivoire/zone UEMOA. NON VÉRIFIÉ — action humaine requise (contacter Moneroo).
4. RCCM de Baobab Loyalty SAS toujours "en cours d'enregistrement" (voir `app/legal/mentions-legales/page.tsx`). NON VÉRIFIÉ — action humaine requise.
5. Durée de rétention des données PostHog et paramètres de confidentialité du projet PostHog. NON VÉRIFIÉ — action humaine requise (tableau de bord PostHog, hors périmètre du code).
