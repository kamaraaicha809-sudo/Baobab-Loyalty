# Registre des activités de traitement — Loyavia (Europe)

Document interne (RGPD, art. 30). Non destiné à la publication. Dernière mise à jour : 29 septembre 2026.

**Projet** : l'entité juridique, son adresse, son représentant et son DPO éventuel ne sont pas encore fixés (champs entre crochets). À compléter et à faire relire par un juriste RGPD avant le premier hôtel payant. Le registre doit être tenu à jour à chaque évolution touchant des données personnelles.

- **Responsable / sous-traitant** : [Entité juridique Loyavia] — [adresse] — support@loyavia.com
- **DPO** : [à déterminer — désignation obligatoire ou non à apprécier avec le juriste, art. 37]
- **Hébergement de la base** : Supabase, projet Europe, région eu-central-1 (Francfort, UE)

Loyavia tient **deux registres** (art. 30.1 et 30.2), présentés ci-dessous en deux parties.

---

## Partie A — Loyavia responsable du traitement (art. 30.1)

### A1. Comptes hôteliers et utilisateurs du dashboard
- **Finalité** : créer et gérer le compte, authentifier, donner accès au service, gérer l'équipe (invitations).
- **Base légale** : exécution du contrat (art. 6.1.b).
- **Personnes** : gérants et employés des hôtels clients.
- **Données** : nom, e-mail, téléphone du responsable, nom et informations de l'hôtel, rôle dans l'équipe, journaux de connexion.
- **Destinataires** : Supabase (hébergement, authentification), Vercel (site), Resend (e-mails de service).
- **Transferts hors UE** : Vercel, Resend (États-Unis) — voir tableau des transferts.
- **Conservation** : durée de l'abonnement, puis [durée à fixer, par exemple 3 ans après la fin de la relation pour la gestion d'éventuels litiges].
- **Sécurité** : authentification Supabase, RLS sur toutes les tables, droits de colonne restreints sur `profiles`.

### A2. Preuve d'acceptation des CGU / CGV / DPA
- **Finalité** : prouver quelle version des documents contractuels chaque hôtel a acceptée et quand (art. 28.3 et 28.9 pour le DPA).
- **Base légale** : exécution du contrat ; obligation de pouvoir démontrer le contrat de sous-traitance.
- **Données** : identifiant de l'utilisateur et du compte hôtel, version acceptée, documents, date et heure posées par le serveur.
- **Stockage** : `legal_acceptances` et `legal_document_versions` (migration Europe 016), journal en ajout seul.
- **Statut** : préparé, **non activé** (aucune version publiée, fenêtre d'acceptation désactivée tant que l'entité, la TVA et le droit applicable ne sont pas fixés).
- **Conservation** : durée de la relation contractuelle + [délai de prescription applicable, à fixer].

### A3. Facturation et paiement
- **Finalité** : abonnements, factures, TVA.
- **Base légale** : exécution du contrat ; obligation légale (conservation comptable).
- **Données** : identité de facturation de l'hôtel, plan, historique de paiement (les données de carte restent chez Stripe).
- **Destinataires** : Stripe Payments Europe (Irlande) — **prévu, non activé**.
- **Conservation** : [10 ans pour les pièces comptables en France — à confirmer selon le pays de l'entité].

### A4. Newsletter et prospection B2B
- **Finalité** : envoyer la newsletter mensuelle aux hôteliers inscrits.
- **Base légale** : consentement (inscription volontaire, désabonnement en un clic).
- **Données** : e-mail, date d'inscription.
- **Destinataires** : Supabase (fonction `newsletter-subscribe`, table `newsletter_subscribers`), Resend (e-mail de bienvenue et envois).
- **Conservation** : jusqu'au désabonnement.

### A5. Support et exercice des droits (hôteliers et visiteurs)
- **Finalité** : répondre aux demandes, traiter les demandes d'accès, rectification, effacement, opposition, limitation et portabilité.
- **Base légale** : obligation légale (art. 12 à 22) ; intérêt légitime pour le support.
- **Stockage** : `data_subject_requests` (migrations Europe 001 et 006) et e-mails de support.
- **Conservation** : [durée de preuve à fixer, par exemple 3 ans après la clôture de la demande].

### A6. Mesure d'audience du site public
- **Statut** : **non active sur loyavia.com** (aucune clé PostHog configurée sur le projet Vercel Europe au 29/09/2026). Le code ne charge PostHog qu'après consentement explicite, et jamais sur le dashboard.
- Si elle est activée : base légale consentement (art. 6.1.a et règles ePrivacy), instance **PostHog EU (Francfort)** à privilégier, conservation limitée.

### A7. Registre des violations
- **Finalité** : documenter tout incident (art. 33.5), voir `docs/PROCEDURE_VIOLATION_DONNEES_EUROPE.md`.
- **Stockage** : `data_breaches` (migration Europe 009).

---

## Partie B — Loyavia sous-traitant des hôtels (art. 30.2)

Pour chaque hôtel client (responsable du traitement, identifié par son compte), Loyavia effectue les catégories de traitement suivantes, sur instruction de l'hôtel et selon le DPA :

### B1. Base clients de l'hôtel (fidélisation)
- **Traitements** : stockage, import CSV, saisie au registre numérique, segmentation par inactivité (3, 6, 9 mois), export.
- **Personnes** : clients finaux de l'hôtel.
- **Données** : nom, téléphone, WhatsApp, e-mail, dates de séjour, nombre de réservations, montant dépensé, type de chambre préféré, date de naissance (facultative), notes libres.
- **Minimisation** : le registre numérique rappelle de ne pas y saisir de données d'identité (pièce d'identité, nationalité). La fiche individuelle de police (clients étrangers, CESEDA art. R. 814-1 et suivants) reste tenue par l'hôtel hors de Loyavia.

### B2. Accords marketing par canal
- **Traitement** : enregistrer l'accord ou le retrait de chaque client, canal par canal (WhatsApp, e-mail, SMS), avec la date (posée par le serveur), l'origine (registre, import, bascule manuelle, lien de désinscription, STOP WhatsApp) et, pour un import, la date d'accord d'origine.
- **Stockage** : `communication_preferences` (état courant), `consent_records` (preuves), `consent_log` (historique).
- **Règles** : aucun accord par défaut ; un import ne réabonne jamais un client désinscrit ou ayant refusé un canal ; seul un accord explicite (registre, bascule manuelle confirmée) le peut.

### B3. Campagnes WhatsApp et messages d'anniversaire
- **Traitement** : envoi des messages aux seuls clients ayant un accord actif sur le canal, revérifié au moment de l'envoi ; journal des envois (`sent_messages`).
- **Sous-traitant ultérieur** : Meta (WhatsApp Business Platform).

### B4. Suivi des offres et réservations
- **Traitement** : lien de suivi unique par message, clics, réservations issues d'une campagne, revenus attribués.

### B5. Génération de messages par IA
- **Données envoyées au fournisseur d'IA (OpenRouter)** : nom de l'hôtel, type d'offre et avantage, libellé du segment, préférences de marque saisies par l'hôtel (plan Business). **Aucune donnée de client final** (ni nom, ni téléphone, ni e-mail, ni historique). La recommandation de campagne n'envoie que des chiffres agrégés (nombre de clients par segment, taux).
- **AI Gateway (préparé, non activé)** : le contrat de données (`_shared/ai-gateway/types.ts`) n'accepte que des agrégats, sans champ nominatif ; chaque appel est journalisé dans `ai_gateway_log`.
- **Risque résiduel** : les champs libres (avantage, sujet LinkedIn) sont saisis par l'hôtelier ; une consigne dans l'interface devrait lui rappeler de ne jamais y écrire de données de clients.

### B6. Droits des personnes et fin de contrat
- Recherche, export, rectification, opposition, limitation, effacement et anonymisation par client (8 Edge Functions `gdpr-*`, migrations Europe 006, 007, 011).
- À la fin du contrat : suppression ou restitution selon le DPA.

---

## Sous-traitants ultérieurs et transferts hors UE

Vérifié le 29/09/2026 sur les pages officielles des prestataires.

| Prestataire | Rôle | Localisation | Garantie de transfert | Statut |
|---|---|---|---|---|
| Supabase Inc. | Base de données, authentification, fonctions serveur | Données à Francfort (UE) ; société et support aux États-Unis | **Clauses contractuelles types** (modules 2 et 3) intégrées au DPA Supabase ; Supabase n'est pas certifié DPF ; analyse d'impact des transferts (TIA) fournie par Supabase | Actif — DPA à accepter formellement |
| Vercel Inc. | Hébergement du site | États-Unis (réseau mondial) | **Certifié EU-US DPF** + clauses contractuelles types (DPA Vercel) | Actif |
| Meta / WhatsApp (WhatsApp Ireland Ltd, WhatsApp LLC) | Envoi des messages WhatsApp | Irlande → États-Unis | **Certifié EU-US DPF** ; clauses contractuelles types en repli | Prévu (compte Meta Europe en attente) |
| Resend (Plus Five Five, Inc.) | E-mails de service et newsletter | États-Unis | **Certifié EU-US DPF** + clauses contractuelles types dans le DPA | Actif (domaine loyavia.com) |
| OpenRouter, Inc. | Passerelle vers les modèles d'IA | États-Unis + fournisseurs de modèles | Adéquation / clauses contractuelles types selon sa politique ; **DPA signé réservé aux comptes Enterprise** : aucun DPA signé à ce jour (compte pay-as-you-go) ; chaque fournisseur de modèle appelé est un sous-traitant de fait | Clé absente du Vault Europe : IA inactive en Europe |
| PostHog Inc. | Mesure d'audience | États-Unis ou UE (Francfort) selon l'instance | **Certifié EU-US DPF** ; instance EU disponible | Non actif sur loyavia.com |
| Stripe Payments Europe Ltd | Paiement | Irlande → États-Unis | **Certifié EU-US DPF** + addendum de transfert | Prévu, non activé |
| Mistral AI | IA (AI Gateway) | UE | Pas de transfert | Prévu, non activé |

---

## Points ouverts

Le suivi détaillé (corrigé / en attente technique / à valider juridiquement) est tenu dans [SUIVI_CONFORMITE_LOYAVIA.md](SUIVI_CONFORMITE_LOYAVIA.md). En résumé, restent à valider juridiquement, sans décision prise à ce jour :

1. Entité juridique, autorité chef de file, droit applicable, TVA ; désignation éventuelle d'un DPO.
2. Acceptation formelle des DPA Supabase (et conservation de sa TIA), Vercel et Resend.
3. OpenRouter : usage sans DPA signé, ou offre Enterprise / routage UE / fournisseur UE via l'AI Gateway, avant d'activer l'IA en Europe.
4. Durées de conservation (comptes, preuves d'acceptation, demandes RGPD, registre des violations, facturation).
5. Personne habilitée à accepter le DPA au nom de l'hôtel (clause d'acceptation électronique rédigée, masquée).
6. Soft opt-in pour les clients existants des hôtels.

Fait depuis la création du registre : rappel « n'écrivez jamais de données de vos clients » sous les champs envoyés à l'IA (page Templates) ; pages légales Europe alignées sur la réalité (PostHog non activé, situation de Supabase, traçabilité des accords par canal). Le tableau `subprocessors_registry` en base doit être mis à jour à chaque changement de prestataire (dernière mise à jour : migration Europe 017).
