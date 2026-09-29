# Guide de Conformité — Protection des Données Personnelles
## À destination des Hôteliers utilisant Baobab Loyalty

**Version 1.1 — Septembre 2026**

---

## Introduction

En utilisant Baobab Loyalty pour gérer la base de données de vos clients, vous traitez des données à caractère personnel. Cela vous soumet à des obligations légales selon le pays où votre hôtel est établi.

Ce guide vous explique, étape par étape, ce que vous devez faire pour être en conformité — sans jargon juridique inutile.

---

## ÉTAPE 1 — Signer le Contrat de Sous-traitance avec Baobab Loyalty

**Obligatoire dans tous les pays. À faire en premier.**

Ce contrat (Document 01 — DPA) est l'acte juridique qui formalise la relation entre vous (responsable du traitement de vos données clients) et Baobab Loyalty (qui traite ces données pour votre compte).

**Comment faire :**
1. Télécharger le document `01_DPA_Contrat_Sous_Traitance.pdf`
2. Remplir vos informations (raison sociale, adresse, représentant légal)
3. Signer et dater
4. Envoyer un exemplaire signé à : support@baobabloyalty.com
5. Conserver un exemplaire dans vos archives

**Délai recommandé :** Avant de commencer à utiliser Baobab Loyalty.

---

## ÉTAPE 2 — Informer vos clients

**Obligatoire dans tous les pays.**

Vos clients (les voyageurs) ont le droit de savoir que vous utilisez leurs données dans Baobab Loyalty. Vous devez les en informer.

**Comment faire :**
1. Télécharger le document `03_Notice_Information_Clients.pdf`
2. Personnaliser avec le nom de votre hôtel et vos coordonnées
3. Choisir **au moins deux** des moyens de diffusion suivants :
   - Afficher la notice à la réception (format A4 encadré)
   - L'inclure dans le formulaire de check-in signé par le client
   - L'envoyer par email à la confirmation de réservation
   - La publier sur le site web de votre hôtel (page "Confidentialité")

**Délai recommandé :** Avant ou au moment de l'import des données dans Baobab Loyalty.

---

## ÉTAPE 2 bis — Recueillir l'accord de vos clients avant tout message WhatsApp

**Obligatoire en Côte d'Ivoire.**

La loi n° 2013-546 du 30 juillet 2013 (transactions électroniques), article 14, interdit d'envoyer des offres par SMS, WhatsApp ou tout autre moyen électronique à une personne qui n'a pas donné son accord **avant**. L'exception « clients existants » ne vaut que pour l'email. Les sanctions sont pénales.

**Comment faire dans Baobab Loyalty :**
- À la réception, dans le **registre numérique**, cochez « Le client accepte de recevoir les offres de l'hôtel par WhatsApp » uniquement s'il vient de vous donner son accord.
- À l'import CSV, ajoutez une colonne `consentement_whatsapp` (oui / non), et si possible `date_consentement` et `source_consentement`. Vous pouvez aussi certifier que tous les clients du fichier ont donné leur accord : cette déclaration engage votre hôtel.
- Un client sans accord est bien importé, mais ne reçoit **aucune** campagne ni message d'anniversaire.
- Chaque message contient un lien de désinscription ; le mot STOP fonctionne aussi.

**Attention à la fiche de police :** les informations remplies pour la fiche de police (désormais la plateforme HORA de la Police nationale) servent à la sécurité. Vous ne pouvez pas les utiliser pour de la prospection sans l'accord du client. Le registre de Baobab Loyalty ne remplace pas la fiche de police.

---

## ÉTAPE 3 — Déclarer votre traitement à l'autorité compétente

**Obligatoire selon votre pays. Voir le tableau ci-dessous.**

---

### CÔTE D'IVOIRE — Déclaration à l'ARTCI

**Base légale :** Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel. Tout traitement de données personnelles doit être déclaré ou autorisé **avant** de commencer.

**Ce que vous devez faire :**

1. **Télécharger** les formulaires sur le site de l'Autorité de protection : www.autoritedeprotection.ci (rubrique « Formulaires ») — déclaration, demande d'autorisation et **demande de transfert de données**
2. **Remplir** les formulaires avec les informations de votre hôtel (voir Document 04 — Formulaire pré-rempli)
3. **Déposer** le dossier en ligne ou à l'ARTCI (Abidjan-Plateau), et **payer les frais de dossier** (fixés par la décision ARTCI n° 2016-0201 — demandez le montant en vigueur au moment du dépôt)
4. **Conserver** l'accusé de réception, puis la décision de l'ARTCI

**Informations clés pour remplir le formulaire :**

| Champ | Ce que vous indiquez |
|-------|---------------------|
| Finalité du traitement | "Fidélisation clientèle hôtelière par communications WhatsApp, avec accord préalable du client" |
| Catégories de données | Nom, email, téléphone/WhatsApp, date de dernière visite, date de naissance (si utilisée), accord WhatsApp |
| Destinataires | Baobab Loyalty (sous-traitant), Meta (WhatsApp Business Platform) |
| Durée de conservation | Durée de l'abonnement actif Baobab Loyalty |
| Transferts hors CEDEAO | Oui — Irlande (base de données Supabase, infrastructure AWS) et États-Unis (Meta, Vercel, Resend) |
| Mesures de sécurité | Chiffrement TLS, authentification, cloisonnement des données par hôtel (RLS PostgreSQL) |

**Transfert hors CEDEAO — autorisation obligatoire :** les données de vos clients sont stockées en Irlande et transitent par des services situés aux États-Unis. Tout transfert vers un pays hors CEDEAO est soumis à une **autorisation préalable de l'ARTCI** (articles 7 et 26 de la loi). Le traitement ne peut commencer qu'après réception de cette autorisation, notifiée par courrier.

**Délai de réponse ARTCI :** l'ARTCI statue dans un délai d'un mois, prolongeable d'un mois par décision motivée. Ne considérez pas une absence de réponse comme un accord : attendez la décision écrite.

**Sanctions en cas de manquement :** jusqu'à 10 millions de FCFA, et jusqu'à 5 % du chiffre d'affaires en cas de récidive.

---

### SÉNÉGAL — Déclaration à la CDP

**Base légale :** Loi n° 2008-12 du 25 janvier 2008 sur la Protection des Données à caractère Personnel

**Ce que vous devez faire :**

1. **Créer un compte** sur le portail CDP : www.cdp.sn
2. **Remplir** le formulaire de déclaration en ligne
3. **Joindre** une copie du contrat de sous-traitance signé avec Baobab Loyalty
4. **Conserver** le récépissé de déclaration

**Informations importantes :**
- La CDP peut effectuer des contrôles sur place
- Toute modification du traitement (nouvelles données, nouveau sous-traitant) doit faire l'objet d'une déclaration modificative
- Sanction en cas de non-déclaration : jusqu'à 5 millions de FCFA d'amende

---

### MAROC — Autorisation de la CNDP

**Base légale :** Loi n° 09-08 du 18 février 2009 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel

**Ce que vous devez faire :**

1. **Accéder** au portail CNDP : www.cndp.ma
2. **Remplir** le formulaire de déclaration (traitement standard) ou d'autorisation (si données sensibles)
3. **Joindre** le DPA signé avec Baobab Loyalty
4. **Notifier** tout transfert international de données vers l'UE (serveurs AWS)

**Point important :** Le Maroc dispose d'un accord d'adéquation partiel avec l'UE. Le transfert vers AWS EU West est généralement accepté sous réserve de notification à la CNDP.

---

### FRANCE / UNION EUROPÉENNE — Conformité RGPD

**Base légale :** Règlement (UE) 2016/679 (RGPD)

**Ce que vous devez faire :**

1. **Tenir** un registre des activités de traitement (obligatoire si > 250 salariés, ou traitement à risque)
2. **Signer** le DPA avec Baobab Loyalty (Article 28 RGPD)
3. **Informer** vos clients via la notice de confidentialité
4. **Aucune déclaration préalable** à la CNIL n'est requise (le RGPD a supprimé cette obligation)
5. **Désigner** un DPO si vous traitez à grande échelle (recommandé pour les hôtels > 100 chambres)

---

## ÉTAPE 4 — Mettre à jour votre Politique de Confidentialité

**Recommandé pour tous les pays.**

Si votre hôtel possède un site web, vous devez y publier une politique de confidentialité mentionnant l'utilisation de Baobab Loyalty.

**Paragraphe à ajouter (adapter avec vos informations) :**

> *"Dans le cadre de notre programme de fidélisation, nous utilisons le service Baobab Loyalty (sous-traitant) pour gérer notre base de données clients. Vos données (nom, contact, date de dernière visite) sont stockées sur des serveurs sécurisés hébergés en Europe (AWS EU West, Irlande) et protégées conformément au RGPD. Vous pouvez exercer vos droits (accès, rectification, suppression) en nous contactant à : [email de l'hôtel]."*

---

## ÉTAPE 5 — Former votre équipe

**Recommandé.**

Les personnes ayant accès à Baobab Loyalty (réceptionnistes, directeur) doivent connaître les règles de base :

- Ne jamais partager leurs identifiants de connexion
- Ne jamais exporter les données clients vers des systèmes non sécurisés
- Signaler immédiatement tout incident de sécurité (perte de mot de passe, accès suspect) à Baobab Loyalty : support@baobabloyalty.com
- Répondre dans les **30 jours** à toute demande d'un client souhaitant accéder à ou supprimer ses données

---

## Récapitulatif des actions par pays

| Action | Côte d'Ivoire | Sénégal | Maroc | UE/France | Délai recommandé |
|--------|:---:|:---:|:---:|:---:|----------|
| Signer le DPA | ✓ | ✓ | ✓ | ✓ | Immédiat |
| Notice d'information clients | ✓ | ✓ | ✓ | ✓ | Avant import |
| Accord préalable WhatsApp de chaque client | ✓ | — | — | — | Avant tout envoi |
| Déclaration ARTCI | ✓ | — | — | — | Avant utilisation |
| Autorisation ARTCI de transfert hors CEDEAO | ✓ | — | — | — | Avant utilisation |
| Déclaration CDP | — | ✓ | — | — | Avant utilisation |
| Déclaration/Autorisation CNDP | — | — | ✓ | — | Avant utilisation |
| Registre des traitements | Recommandé | Recommandé | Recommandé | Obligatoire | Avant import |
| Mise à jour politique de confidentialité | ✓ | ✓ | ✓ | ✓ | Sous 30 jours |
| Formation du personnel | ✓ | ✓ | ✓ | ✓ | Sous 60 jours |

---

## En cas de violation de données (incident de sécurité)

Si vous suspectez que des données de vos clients ont été compromises :

1. **Contactez immédiatement Baobab Loyalty :** support@baobabloyalty.com ou +225 05 74 85 11 23
2. **Baobab Loyalty** vous notifiera dans les 72 heures avec un rapport d'incident
3. **Vous devez notifier** l'autorité de protection des données de votre pays dans les délais légaux :
   - Côte d'Ivoire (ARTCI) : sans délai précis légalement fixé, mais le plus tôt possible
   - Sénégal (CDP) : sans délai précis légalement fixé
   - Maroc (CNDP) : sans délai précis légalement fixé
   - UE/France (CNIL) : dans les **72 heures**
4. **Si les personnes concernées risquent un préjudice grave :** les informer directement

---

## Contacts utiles

| Autorité | Pays | Site web | Email / Tél |
|----------|------|----------|------------|
| ARTCI | Côte d'Ivoire | www.artci.ci — www.autoritedeprotection.ci | — |
| CDP | Sénégal | www.cdp.sn | cdp@cdp.sn |
| CNDP | Maroc | www.cndp.ma | — |
| CNIL | France | www.cnil.fr | — |
| **Baobab Loyalty** | Support | baobabloyalty.com | support@baobabloyalty.com |

---

*Document établi par Baobab Loyalty (First Digital Prod SARL) — Septembre 2026*
*Ce guide est fourni à titre informatif et ne constitue pas un conseil juridique. Pour toute situation complexe, consultez un juriste spécialisé en protection des données.*
