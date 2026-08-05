# CONTRAT DE SOUS-TRAITANCE DE DONNÉES PERSONNELLES
## Data Processing Agreement (DPA)

**Conforme à :** Article 28 du RGPD · Loi n° 2013-450 (Côte d'Ivoire) · Loi n° 2008-12 (Sénégal) · Loi n° 09-08 (Maroc)

---

**ENTRE :**

**Le Responsable de Traitement** (ci-après « l'Hôtelier ») :

- Raison sociale : _______________________________________________
- Forme juridique : _______________________________________________
- Adresse du siège : _______________________________________________
- Pays : _______________________________________________
- Représenté par : _______________________________________________, en qualité de _______________________________________________
- Email : _______________________________________________

**ET :**

**Le Sous-traitant** :

- Raison sociale : **Baobab Loyalty**
- Adresse : _______________________________________________
- Représenté par : _______________________________________________, en qualité de _______________________________________________
- Email : support@baobabloyalty.com

Ci-après dénommés ensemble « les Parties ».

---

## PRÉAMBULE

Dans le cadre de la fourniture du service Baobab Loyalty (logiciel SaaS de fidélisation client pour hôtels), Baobab Loyalty est amenée à traiter des données à caractère personnel pour le compte de l'Hôtelier.

Le présent contrat a pour objet de définir les conditions dans lesquelles Baobab Loyalty s'engage à effectuer pour le compte de l'Hôtelier les opérations de traitement de données à caractère personnel définies ci-après.

---

## ARTICLE 1 — OBJET ET DURÉE

### 1.1 Objet
Le présent contrat définit les droits et obligations des Parties au titre des opérations de traitement de données à caractère personnel effectuées par Baobab Loyalty pour le compte de l'Hôtelier dans le cadre du service Baobab Loyalty.

### 1.2 Durée
Le présent contrat entre en vigueur à la date de son acceptation (signature ou acceptation des CGU incluant ce DPA) et reste en vigueur pendant toute la durée de la relation contractuelle entre les Parties.

---

## ARTICLE 2 — DESCRIPTION DU TRAITEMENT

### 2.1 Nature du traitement
- Import et stockage de données clients de l'hôtelier
- Segmentation automatique des clients selon leur date de dernière visite
- Envoi de messages WhatsApp aux clients via campagnes
- Suivi des réservations et des interactions clients
- Génération de tableaux de bord analytiques

### 2.2 Finalité du traitement
Fidélisation de la clientèle hôtelière par l'envoi de communications personnalisées via WhatsApp.

### 2.3 Catégories de données traitées

| Catégorie | Données | Sensibilité |
|-----------|---------|-------------|
| Identité | Nom, prénom | Standard |
| Contact | Email, téléphone, WhatsApp | Standard |
| Comportement | Date de dernière visite, notes internes | Standard |
| Interaction | Statut de lecture des messages, clics sur offres | Standard |

> Aucune donnée sensible au sens de l'article 9 du RGPD (santé, origine ethnique, religion, etc.) n'est traitée.

### 2.4 Catégories de personnes concernées
Les clients (voyageurs) ayant séjourné dans l'établissement hôtelier de l'Hôtelier.

### 2.5 Destinataires des données
- L'Hôtelier (responsable de traitement, accès direct via interface)
- Baobab Loyalty (sous-traitant, accès technique limité à la maintenance)
- Supabase Inc. (hébergeur, sous-traitant ultérieur — voir Article 5)
- WhatsApp Business API (pour l'envoi des messages uniquement)

---

## ARTICLE 3 — OBLIGATIONS DE BAOBAB LOYALTY (SOUS-TRAITANT)

Baobab Loyalty s'engage à :

### 3.1 Traitement sur instruction
Traiter les données à caractère personnel uniquement sur instruction documentée de l'Hôtelier, y compris en ce qui concerne les transferts de données vers des pays tiers, sauf obligation légale contraire.

### 3.2 Confidentialité
Veiller à ce que les personnes autorisées à traiter les données s'engagent à respecter la confidentialité ou soient soumises à une obligation légale appropriée de confidentialité.

### 3.3 Sécurité technique
Mettre en œuvre les mesures techniques et organisationnelles suivantes :
- Chiffrement des données en transit (HTTPS/TLS 1.3)
- Chiffrement des données au repos (AES-256, infrastructure AWS)
- Authentification par jeton JWT à durée limitée
- Isolation des données par Row Level Security (RLS) PostgreSQL
- Contrôle d'accès strict par rôle (admin / utilisateur)
- Journalisation des accès et actions
- Sauvegardes automatiques quotidiennes

### 3.4 Sous-traitants ultérieurs
Ne pas recruter un autre sous-traitant sans l'accord préalable écrit de l'Hôtelier (voir Article 5 pour les sous-traitants déjà autorisés).

### 3.5 Droits des personnes concernées
Aider l'Hôtelier à s'acquitter de son obligation de donner suite aux demandes d'exercice des droits des personnes concernées (accès, rectification, suppression, portabilité, opposition).

### 3.6 Notification des violations
Notifier l'Hôtelier de toute violation de données à caractère personnel dans un délai de **72 heures** après en avoir pris connaissance, par email à l'adresse enregistrée.

### 3.7 Assistance à l'Hôtelier
Aider l'Hôtelier à garantir le respect des obligations découlant des articles 32 à 36 du RGPD (sécurité, notification de violations, analyse d'impact).

### 3.8 Suppression ou restitution des données
À l'issue de la prestation, supprimer toutes les données à caractère personnel ou les restituer à l'Hôtelier dans un délai de **30 jours**, et détruire les copies existantes, sauf obligation légale de conservation.

### 3.9 Audit
Mettre à la disposition de l'Hôtelier toutes les informations nécessaires pour démontrer le respect du présent contrat, et permettre la réalisation d'audits dans un délai de préavis raisonnable (30 jours).

---

## ARTICLE 4 — OBLIGATIONS DE L'HÔTELIER (RESPONSABLE DE TRAITEMENT)

L'Hôtelier s'engage à :

### 4.1 Licéité du traitement
S'assurer qu'il dispose d'une base légale valable pour traiter les données de ses clients (intérêt légitime, consentement, exécution du contrat de séjour).

### 4.2 Information des personnes concernées
Informer ses clients (voyageurs) du traitement de leurs données et de leur transmission à Baobab Loyalty, conformément à la Notice d'Information jointe en Annexe 1.

### 4.3 Déclarations réglementaires
Effectuer, le cas échéant, les déclarations ou demandes d'autorisation requises auprès de l'autorité de protection des données compétente dans son pays (ARTCI en Côte d'Ivoire, CDP au Sénégal, CNDP au Maroc).

### 4.4 Qualité des données
S'assurer de l'exactitude et de la mise à jour des données transmises à Baobab Loyalty.

### 4.5 Instructions licites
Ne transmettre à Baobab Loyalty que des instructions licites au regard de la réglementation applicable.

---

## ARTICLE 5 — SOUS-TRAITANTS ULTÉRIEURS AUTORISÉS

L'Hôtelier autorise expressément Baobab Loyalty à faire appel aux sous-traitants ultérieurs suivants :

| Sous-traitant | Pays | Rôle | Données transmises |
|---------------|------|------|--------------------|
| Supabase Inc. | États-Unis (données sur AWS EU West) | Hébergement base de données | Toutes les données |
| Vercel Inc. | États-Unis | Hébergement application web | Aucune donnée client |
| Resend Inc. | États-Unis | Envoi d'emails transactionnels | Email de l'hôtelier uniquement |
| OpenRouter | États-Unis | Génération de texte IA | Texte du message (sans données nominatives) |
| WhatsApp (Meta) | États-Unis | Envoi de messages | Numéro de téléphone / WhatsApp |
| Moneroo | Afrique | Traitement des paiements | Données de facturation hôtelier |

Baobab Loyalty s'assure que ces sous-traitants ultérieurs présentent des garanties suffisantes (conformité RGPD, clauses contractuelles types) et s'engage à les informer de tout changement.

---

## ARTICLE 6 — TRANSFERTS INTERNATIONAUX DE DONNÉES

Les données sont hébergées sur des serveurs AWS situés en **EU West (Irlande / Europe de l'Ouest)**, soumis au RGPD européen.

Ce transfert est encadré par :
- Les clauses contractuelles types (SCCs) de la Commission Européenne intégrées aux conditions d'utilisation de Supabase
- Le niveau de protection adéquat offert par le RGPD, supérieur aux exigences minimales de la Loi n° 2013-450

L'Hôtelier est informé de ce transfert international et l'accepte en signant le présent contrat.

---

## ARTICLE 7 — DURÉE DE CONSERVATION DES DONNÉES

| Type de donnée | Durée de conservation | Motif |
|----------------|----------------------|-------|
| Données clients (nom, contact, visite) | Pendant la durée du compte actif | Nécessité fonctionnelle |
| Journaux de messages envoyés | 3 ans après l'envoi | Traçabilité légale |
| Données de réservation | 5 ans | Obligation comptable |
| Données après clôture du compte | Suppression sous 30 jours | Article 3.8 du présent contrat |

---

## ARTICLE 8 — SORT DES DONNÉES EN FIN DE CONTRAT

À la résiliation ou à l'expiration du contrat :

1. L'Hôtelier peut exporter ses données via l'interface Baobab Loyalty pendant **30 jours**
2. Passé ce délai, toutes les données sont **définitivement supprimées** des serveurs
3. Baobab Loyalty fournit sur demande un **certificat de suppression**

---

## ARTICLE 9 — RESPONSABILITÉ

- Baobab Loyalty n'est responsable que des dommages directement causés par sa propre faute dans l'exécution du présent contrat
- L'Hôtelier reste seul responsable de la licéité du traitement initial et de l'information des personnes concernées
- La responsabilité de Baobab Loyalty est limitée au montant des sommes versées par l'Hôtelier au cours des 12 derniers mois

---

## ARTICLE 10 — LOI APPLICABLE ET JURIDICTION

Le présent contrat est régi par le droit applicable dans le pays de l'Hôtelier, complété par les principes généraux du RGPD. Tout litige sera soumis aux tribunaux compétents du lieu du siège de Baobab Loyalty, sauf disposition impérative contraire.

---

## SIGNATURES

**Pour l'Hôtelier (Responsable de traitement) :**

Nom : _____________________________________________

Qualité : _____________________________________________

Date : _____________________________________________

Signature : _____________________________________________

---

**Pour Baobab Loyalty (Sous-traitant) :**

Nom : _____________________________________________

Qualité : _____________________________________________

Date : _____________________________________________

Signature : _____________________________________________

---

## ANNEXE 1 — Notice d'information à remettre aux clients de l'hôtel

*(Voir document séparé : 03_Notice_Information_Clients.md)*

## ANNEXE 2 — Mesures de sécurité techniques de Baobab Loyalty

*(Voir document : SECURITE_DONNEES_CLIENTS.pdf)*
