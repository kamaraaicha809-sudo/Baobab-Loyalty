---
name: baobabloyalty-seo-legal
description: Génère et révise les pages légales (mentions légales, CGU, CGV, politique de confidentialité, politique cookies) en alignant conformité ET impact SEO pour baobabloyalty.com. À utiliser dès que l'utilisateur dit "mentions légales", "CGU", "CGV", "RGPD", "politique de confidentialité", "politique cookies", "cookie banner", "consentement", "compliance SEO", "page légale", "footer légal", "rédige les mentions". Couvre aussi l'impact SEO du consent management (Consent Mode v2 Google), le cookie banner sur les Core Web Vitals, et l'indexabilité des pages légales. NE remplace PAS un avocat — produit des bases à faire valider juridiquement.
---

# Baobab Loyalty — SEO Legal

Génère les pages légales nécessaires à un SaaS B2B opérant en France et conformes au RGPD, en optimisant l'impact SEO de ces pages (souvent négligées mais qui peuvent peser).

⚠️ **Disclaimer important** : ce skill produit des **bases rédactionnelles**, pas un avis juridique. Toute publication doit être validée par un avocat ou DPO. Particulièrement pour les CGV, qui engagent contractuellement.

## Quand utiliser

- Lancement / refonte du site Baobab
- Mise en conformité RGPD / DSA / DMA
- Ajout d'un cookie banner (et son impact SEO)
- Mise à jour annuelle des mentions
- Audit conformité avant levée de fonds / certification

## Pages couvertes

| Page | URL suggérée | Obligatoire ? | Indexable ? |
|---|---|---|---|
| Mentions légales | `/mentions-legales` | ✅ FR : oui | Oui (faible priorité) |
| Politique de confidentialité | `/politique-confidentialite` | ✅ RGPD : oui | Oui |
| Politique cookies | `/cookies` | ⚪ recommandé | Oui |
| CGU (B2B & B2C) | `/cgu` | ⚪ très recommandé | Oui |
| CGV | `/cgv` | ✅ si vente en ligne | Oui |
| DPA | `/dpa` (PDF + page) | ⚪ recommandé B2B | Oui |
| Sécurité | `/securite` | ⚪ B2B | Oui (différenciant !) |

## Workflow

1. **Identifier la page à produire** ou réviser
2. **Collecter les infos Baobab** :
   - SIREN, adresse siège, capital, dirigeants
   - Hébergeur (OVH / Vercel / autre)
   - DPO / contact RGPD
   - Sous-traitants (Stripe, Sentry, GA4, etc.)
   - Pays d'opération
3. **Générer le contenu de base** depuis les templates
4. **Adapter pour Baobab** (B2B SaaS de fidélisation, marché FR)
5. **Conseiller sur l'impact SEO** (voir section dédiée)
6. **Produire la page** au format prêt à intégrer
7. **Renvoyer à validation juridique**

## Templates de structure

### Mentions légales
```
# Mentions légales

## Éditeur du site
Baobab Loyalty SAS
Capital social : X €
Siège : 10 rue de la Paix, 75002 Paris
RCS Paris : [SIREN]
TVA intracommunautaire : FR[…]
Directeur de la publication : [Nom]
Contact : contact@baobabloyalty.com

## Hébergeur
[Nom hébergeur, ex: OVHcloud SAS]
[Adresse complète]
[Téléphone]

## Propriété intellectuelle
Le contenu du site (textes, images, code, logos) est la propriété
exclusive de Baobab Loyalty SAS, sauf mention contraire.

## Crédits
[Polices utilisées, photos sous licence, etc.]
```

### Politique de confidentialité (RGPD-compliant)
```
# Politique de confidentialité

Dernière mise à jour : [date]

## 1. Responsable de traitement
[Coordonnées Baobab + DPO si désigné]

## 2. Données collectées
- Données de compte : email, nom, mot de passe (haché)
- Données de paiement : traitées par Stripe (PCI-DSS), pas stockées par Baobab
- Données d'usage : logs, événements produits
- Cookies : voir politique cookies

## 3. Finalités
- Fournir le service Baobab Loyalty
- Facturation et obligations comptables (10 ans)
- Communication produit (avec consentement)
- Sécurité et anti-fraude

## 4. Bases légales (RGPD art. 6)
- Exécution du contrat (art. 6.1.b) : pour la fourniture du service
- Obligation légale (art. 6.1.c) : facturation, comptabilité
- Intérêt légitime (art. 6.1.f) : sécurité, amélioration du produit
- Consentement (art. 6.1.a) : marketing, cookies non-essentiels

## 5. Sous-traitants (art. 28)
| Sous-traitant | Finalité | Pays |
|---|---|---|
| Stripe | Paiements | UE / US (DPF) |
| Sentry | Monitoring | UE |
| Resend | Emails transactionnels | UE |
| GA4 | Analytics (avec consentement) | US (DPF, Consent Mode v2) |
| Vercel | Hébergement frontend | UE |
| OVH | Hébergement données | FR |

## 6. Durées de conservation
- Compte actif : durée de la relation
- Compte inactif > 24 mois : suppression ou anonymisation
- Données de facturation : 10 ans
- Logs techniques : 13 mois

## 7. Vos droits (RGPD art. 15-22)
- Accès, rectification, effacement
- Limitation, opposition
- Portabilité
- Retrait du consentement
- Réclamation auprès de la CNIL

Pour exercer vos droits : [email DPO]

## 8. Transferts hors UE
[Détailler chaque transfert + base légale : DPF, Clauses contractuelles types…]

## 9. Sécurité
[Mesures techniques et organisationnelles]
```

### Politique cookies
```
# Politique cookies

## Cookies utilisés

### Cookies strictement nécessaires (sans consentement)
- `bbl_session` : session utilisateur authentifié — Baobab — durée session
- `bbl_csrf` : protection CSRF — Baobab — durée session
- `bbl_consent` : mémorisation du choix de consentement — 6 mois

### Cookies analytiques (avec consentement)
- `_ga`, `_ga_*` : Google Analytics 4 — 13 mois
- `_clck`, `_clsk` : Microsoft Clarity (si utilisé) — 1 an

### Cookies marketing (avec consentement)
- `_fbp` : Meta Pixel (si utilisé) — 90 jours
- `lidc`, `bcookie` : LinkedIn Ads (si utilisé) — variable

## Comment gérer vos cookies
[Lien vers le re-trigger du cookie banner]
```

### CGU (B2B SaaS)
[Voir templates avocat — structure type :]
- Objet
- Définitions
- Acceptation
- Compte
- Services fournis
- Tarifs et facturation
- Niveau de service (SLA)
- Disponibilité
- Maintenance
- Données client (propriété, sécurité, suppression)
- Confidentialité
- Propriété intellectuelle (Baobab + client)
- Sous-traitance
- Responsabilité
- Force majeure
- Durée et résiliation
- Loi applicable et juridiction

## Impact SEO des pages légales

### 1. Indexabilité

**Indexer ou pas ?**
- ✅ Indexer la politique de confidentialité, mentions légales, CGU/CGV : c'est un signal de confiance pour Google (E-E-A-T → Trust)
- ❌ Pas de `noindex` — c'est une erreur fréquente

**Sitemap** : inclure ces pages avec `priority: 0.2` (faible mais présent).

### 2. Cookie banner & Core Web Vitals

Un cookie banner mal codé peut massacrer le **CLS** (Cumulative Layout Shift) et le **LCP** (Largest Contentful Paint).

Bonnes pratiques :
- Bannière en `position: fixed` au bottom (pas de push de contenu = pas de CLS)
- Charger les scripts analytics **après** consentement (pas en `<head>` initial)
- Utiliser **Google Consent Mode v2** : permet de tracker avec ou sans consentement (mode "ping" anonyme), boost SEO indirect via meilleure attribution
- Pas de bannière qui bloque le contenu (Google sanctionne les "intrusive interstitials" sur mobile depuis 2017)
- Re-trigger du banner accessible via un lien `/cookies` ou bouton footer (obligation CNIL)

### 3. Lien interne depuis le footer

Footer Baobab idéal :
```
Légal :
- Mentions légales
- Politique de confidentialité
- Cookies
- CGU
- CGV
- Sécurité

Liens internes additionnels (pas légaux mais SEO-friendly) :
- Plan du site (sitemap HTML)
- Accessibilité
- DPA (data processing agreement)
```

Tous ces liens dans le footer = présents sur toutes les pages = signaux d'autorité distribués.

### 4. Page "Sécurité" — opportunité SEO B2B

La page `/securite` (ou `/security` en EN) est **sous-exploitée** par la plupart des SaaS FR. Or :
- Mots-clés "sécurité [outil]", "[outil] RGPD", "[outil] hébergement France" ont du volume B2B
- C'est un facteur de conversion majeur pour grands comptes
- Permet d'éviter beaucoup de questions en avant-vente

Structure recommandée :
```
H1 : Sécurité chez Baobab Loyalty
H2 : Hébergement et infrastructure
H2 : Chiffrement (TLS, AES, etc.)
H2 : Authentification (SSO, 2FA)
H2 : Conformité (RGPD, ISO 27001 si applicable, SOC 2 si applicable)
H2 : Gestion des incidents
H2 : Sauvegarde et continuité
H2 : Anti-DDoS
H2 : Audit et tests d'intrusion
H2 : Vulnerability disclosure (lien vers responsible disclosure)
H2 : DPA et sous-traitants
```

## Pièges courants

- **Copier-coller depuis un autre site** : juridiquement dangereux ET pénalisé en SEO (contenu dupliqué).
- **Politique de confidentialité incomplète** : la CNIL contrôle, et un défaut peut entraîner une amende.
- **Cookie banner qui force le consentement** : illégal (RGPD art. 7) et pénalisé par les autorités.
- **Pages légales en `noindex`** : perd un signal de confiance.
- **Date de mise à jour absente** : obligation de tracer les mises à jour de politique de confidentialité.
- **Pas de DPA** : pour B2B, beaucoup d'entreprises l'exigent en signature de contrat.

## Mises à jour à programmer

- **Annuellement** : revue complète des mentions, CGU, politique de confidentialité
- **À chaque ajout de sous-traitant** : mettre à jour la politique
- **À chaque modification du produit majeure** : revoir les CGU
- **À chaque évolution réglementaire** (DSA, DMA, AI Act…) : revue ciblée

## Contenu différenciant pour Baobab

Hypothèses spécifiques (à valider) :
- Hébergement FR (OVH Roubaix) → argument fort
- Conformité RGPD native (pas un add-on)
- DPA en français disponible
- Pas de transfert hors UE pour les données personnelles clients
- Possibilité d'audit annuel

Mettre ces points en avant sur `/securite` — ils convertissent.

## Skills compagnons

- **seo-content** — pour le ton et la structure éditoriale
- **seo-meta** — chaque page légale a ses balises meta
- **seo-schema** — schéma `WebPage` pour les pages légales
