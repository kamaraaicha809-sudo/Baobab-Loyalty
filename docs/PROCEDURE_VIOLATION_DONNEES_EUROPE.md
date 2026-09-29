# Procédure en cas de violation de données — Loyavia (Europe)

Document interne. Dernière mise à jour : 29 septembre 2026.
**Projet** : l'entité juridique Loyavia, son autorité de contrôle chef de file et son DPO éventuel ne sont pas encore fixés. Les champs entre crochets sont à compléter avant le premier hôtel payant. Relecture par un juriste RGPD requise.

Une violation de données personnelles (RGPD, art. 4.12) est un incident de sécurité qui entraîne, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée de données personnelles, ou l'accès non autorisé à ces données. Exemples : base clients d'un hôtel consultée par un tiers, clé d'accès exposée, export envoyé à la mauvaise personne, campagne WhatsApp partie vers les mauvais destinataires, base supprimée sans sauvegarde.

## Deux rôles, deux obligations

| Données | Rôle de Loyavia | Obligation |
|---|---|---|
| Clients finaux des hôtels (noms, numéros WhatsApp, e-mails, séjours, accords) | **Sous-traitant** (art. 28) | Prévenir **chaque hôtel concerné sans délai excessif** après en avoir pris connaissance (art. 33.2). C'est l'hôtel, responsable du traitement, qui notifie l'autorité et, si besoin, ses clients. Loyavia lui fournit tout ce qu'il faut pour le faire. |
| Comptes hôteliers, utilisateurs du dashboard, facturation, prospects | **Responsable du traitement** | Notifier **l'autorité de contrôle dans les 72 heures** (art. 33.1), sauf si la violation n'est pas susceptible d'engendrer un risque. Informer les personnes si le risque est **élevé** (art. 34). |

Dans tous les cas, l'incident est consigné dans le **registre des violations** (art. 33.5), même s'il n'est notifié à personne.

---

## 1. Dans l'heure : contenir

- [ ] Noter l'heure exacte de découverte (point de départ des 72 heures), qui a découvert, ce qui a été constaté (captures d'écran).
- [ ] Créer immédiatement la ligne dans le registre des violations (voir § 5), statut `open`.
- [ ] Couper l'accès en cause : révoquer la session ou le compte, faire tourner la clé exposée (Supabase Europe, Vercel, Meta, Stripe, Resend, OpenRouter, PostHog), désactiver la fonction fautive.
- [ ] Ne rien supprimer des journaux (Supabase, Vercel, `ai_gateway_log`, `consent_log`) : ils servent à établir les faits.

## 2. Sous 24 heures : évaluer

- [ ] Quelles catégories de données ? (identité, coordonnées, séjours, accords marketing, données de paiement)
- [ ] Combien de personnes, quels hôtels ? (`profile_id` concernés)
- [ ] Violation de **confidentialité** (données sorties), d'**intégrité** (modifiées) ou de **disponibilité** (perdues) ?
- [ ] Un sous-traitant ultérieur est-il en cause (Supabase, Vercel, Meta, Resend, OpenRouter, PostHog, Stripe) ? Lui demander son rapport d'incident.
- [ ] **Niveau de risque** pour les personnes (`low` / `medium` / `high`), en suivant les lignes directrices 9/2022 du CEPD :
  - `low` : données chiffrées ou inexploitables, exposition très courte sans preuve d'accès → registre uniquement.
  - `medium` : risque réel mais limité (ex. liste de noms et numéros d'un hôtel consultée par un tiers identifié) → notification à l'autorité.
  - `high` : risque d'arnaque, d'usurpation, de préjudice financier ou de discrimination (ex. numéros WhatsApp et séjours publiés, données de paiement) → notification à l'autorité **et** information des personnes.
- [ ] Désigner qui décide de notifier ou non (`decision_maker`) : la décision reste humaine, jamais automatique.

## 3. Sous 72 heures : notifier

### 3.1 Les hôtels concernés (sous-traitance, art. 33.2)
- [ ] E-mail à l'adresse du compte de chaque hôtel touché, **dès que les premiers faits sont établis** (idéalement sous 24 heures, pour laisser à l'hôtel le temps de notifier lui-même dans ses 72 heures). Contenu :
  - nature de la violation, catégories et nombre approximatif de personnes et d'enregistrements ;
  - conséquences probables ;
  - mesures prises et mesures que l'hôtel peut prendre ;
  - contact chez Loyavia : [nom, e-mail].
- [ ] Si tout n'est pas connu, envoyer ce qui l'est et compléter ensuite (art. 33.4).

### 3.2 L'autorité de contrôle (Loyavia responsable, art. 33.1)
- [ ] Autorité chef de file : [à fixer selon l'établissement principal de l'entité — CNIL en France : notifications.cnil.fr].
- [ ] Notification en ligne dans les 72 heures après la découverte, avec les mêmes informations que ci-dessus et le contact du DPO ou du responsable.
- [ ] Au-delà de 72 heures : notifier quand même, en expliquant le retard (art. 33.1).
- [ ] Reporter la date dans `authority_notified_at`.

### 3.3 Les personnes concernées (risque élevé, art. 34)
- [ ] Message clair et simple (e-mail ou WhatsApp selon le canal disponible) : ce qui s'est passé, les risques, ce que la personne peut faire (se méfier des messages frauduleux, changer un mot de passe...), qui contacter.
- [ ] Pour les clients finaux d'un hôtel, c'est l'hôtel qui informe ; Loyavia fournit le texte et, si l'hôtel le demande, les moyens d'envoi.
- [ ] Pas d'information individuelle si les données étaient chiffrées de façon inexploitable, si le risque a été supprimé, ou si l'effort serait disproportionné (communication publique à la place) : art. 34.3, à documenter dans le registre.

## 4. Après l'incident

- [ ] Corriger la cause et tester la correction en conditions réelles (comptes jetables sur le projet Supabase Europe).
- [ ] Compléter la ligne du registre : `measures_taken`, `status` = `contained` puis `closed`.
- [ ] Mettre à jour cette procédure et le registre des traitements si une étape a manqué.

## 5. Le registre des violations (art. 33.5)

Table `public.data_breaches` du projet Supabase Europe (migration `supabase/migrations-europe/009_data_breaches.sql`), écrite uniquement avec la clé service role. Chaque hôtel voit, depuis son compte, les incidents qui le concernent.

| Champ | À renseigner |
|---|---|
| `detected_at` / `incident_at` | Heure de découverte / heure estimée de l'incident |
| `profile_id` | Hôtel concerné (vide si l'incident touche toute la plateforme) |
| `description` | Les faits, sans jugement |
| `data_categories`, `approx_affected_count` | Données et nombre de personnes |
| `risk_level` | `low` / `medium` / `high` (§ 2) |
| `subprocessor_involved` | Prestataire en cause, le cas échéant |
| `notification_required`, `decision_maker` | Décision de notifier ou non, et qui l'a prise (avec la raison dans `description` si non) |
| `authority_notified_at` | Date de notification à l'autorité |
| `measures_taken`, `related_documents` | Mesures, liens vers les preuves |
| `status` | `open` → `contained` → `closed` |

Conservation : [durée à valider avec le juriste, par exemple 5 ans après la clôture].

---

## Contacts

| Qui | Comment |
|-----|---------|
| Responsable Loyavia | [nom — e-mail — téléphone] |
| DPO (si désigné) | [à définir] |
| Autorité de contrôle | [CNIL : www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles, ou autorité du pays d'établissement] |
| Supabase (base de données, Francfort) | support via le tableau de bord Supabase |
| Vercel (hébergement du site) | support via le tableau de bord Vercel |
| Meta (WhatsApp Business) | Business Support Home |
| Resend, OpenRouter, PostHog, Stripe | support de chaque tableau de bord |
