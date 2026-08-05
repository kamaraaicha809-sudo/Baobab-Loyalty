# Stack SEO complète pour baobabloyalty.com — 12 skills

12 skills Cowork organisés en 2 packs complémentaires :

- **6 skills techniques génériques** — réutilisables sur n'importe quel projet Next.js
- **6 skills opérationnels Baobab Loyalty** — workflow récurrent (hebdo, mensuel, à la demande)

---

## Pack 1 — Stack technique générique

| Skill | À quoi ça sert | Quand l'invoquer |
|---|---|---|
| **seo-audit** | Audit SEO technique (CWV, meta, structure, indexabilité) | "Audite cette page", "vérifie le SEO de X" |
| **seo-meta** | Balises meta (title, description, OG, Twitter) Next.js | "Génère les meta tags de la page tarifs" |
| **seo-sitemap** | `sitemap.xml` et `robots.txt` natifs Next.js | "Génère mon sitemap", "fais le robots.txt" |
| **seo-schema** | JSON-LD : Organization, SoftwareApplication, Product, Article, FAQ, BreadcrumbList… | "Ajoute les données structurées" |
| **seo-keywords** | Stratégie de mots-clés FR : piliers, longue traîne, intentions | "Trouve-moi des mots-clés sur X" |
| **seo-content** | Optimisation rédactionnelle : structure Hn, lisibilité, brief, E-E-A-T | "Optimise mon article" |

---

## Pack 2 — Stack opérationnelle Baobab Loyalty

| Skill | Fréquence | À quoi ça sert |
|---|---|---|
| **baobabloyalty-seo-ops** | Hebdo (lundi) | Rapport tactique : alertes, régressions, top 5 actions de la semaine |
| **baobabloyalty-seo-writer** | À la demande | Rédige un article complet selon le Plan SEO (MDX prêt à publier) |
| **baobabloyalty-seo-refresh** | À la demande | Refresh des pages AI High / régressions (stratégie defensive AI) |
| **baobabloyalty-seo-brief** | À la demande | Brief rédactionnel pour opportunités hors-plan (actu, gap concurrent…) |
| **baobabloyalty-seo-tracker** | 1er du mois | Rapport stratégique mensuel vs objectifs trimestriels |
| **baobabloyalty-seo-legal** | À la demande | Pages légales (mentions, RGPD, CGU, cookies) — alignées SEO |

Chaque skill contient un `SKILL.md` (instructions complètes pour Claude) plus, pour les skills techniques génériques, des templates / scripts / références prêts à utiliser.

---

## Installation

### Étape 1 — Packager les skills

Sur Windows, double-clique sur `package-all.ps1` (depuis le dossier `seo-stack`).
Si Windows bloque le script, ouvre PowerShell et lance :

```powershell
cd "C:\Users\HP\Desktop\Micro-SaaS Baobab Loyalty\Baobab Loyalty Kodefast\seo-stack"
powershell -ExecutionPolicy Bypass -File .\package-all.ps1
```

Ça crée 12 fichiers `.skill` (un par skill).

### Étape 2 — Installer dans Cowork

1. Ouvre Cowork
2. Glisse-dépose chaque fichier `.skill` dans la conversation
3. Clique sur **"Save skill"** sur la carte du fichier qui apparaît

C'est tout. Les skills sont disponibles immédiatement dans toutes tes futures conversations.

---

## Workflow d'utilisation suggéré

### Setup (semaines 1-2)
1. **seo-audit** sur la home et les 5 pages principales → liste des correctifs techniques
2. **seo-keywords** → cluster sémantique sur 3 piliers (programme fidélité, carte digitale, fidélisation client)
3. **seo-sitemap** → sitemap.xml + robots.txt
4. **seo-meta** → balises meta sur toutes les pages clés
5. **seo-schema** → Organization + WebSite + SoftwareApplication sur la home, BreadcrumbList partout
6. **baobabloyalty-seo-legal** → mentions légales, RGPD, cookies, CGU/CGV à jour

### Fonctionnement quotidien
- **Tous les lundis** → `baobabloyalty-seo-ops` (rapport tactique → 5 actions de la semaine)
- **Au fil du calendrier éditorial** → `baobabloyalty-seo-writer` pour rédiger les articles du Plan SEO
- **Quand alerte AI Overview ou régression** → `baobabloyalty-seo-refresh`
- **Quand opportunité d'actualité** → `baobabloyalty-seo-brief` puis `baobabloyalty-seo-writer`
- **Le 1er du mois** → `baobabloyalty-seo-tracker` (rapport stratégique mensuel)

### Trimestriel
- Re-audit complet via **seo-audit**
- Mise à jour de la stratégie via **seo-keywords**
- Revue du contenu via **baobabloyalty-seo-refresh**

---

## Automatisation suggérée (scheduled tasks)

Deux skills sont des candidats parfaits pour des tâches planifiées :

| Skill | Fréquence | Trigger |
|---|---|---|
| `baobabloyalty-seo-ops` | Hebdo (lundi 8h) | "Génère le rapport SEO ops de la semaine" |
| `baobabloyalty-seo-tracker` | 1er du mois 9h | "Génère le rapport SEO mensuel" |

Pour les mettre en place, demande à Claude : *"Planifie un rapport SEO ops tous les lundis à 8h"* — il utilisera le skill `schedule`.

---

## Outils complémentaires (à connecter à part)

Aucun de ces skills ne se connecte tout seul à un outil externe. Pour aller au bout :

| Outil | Usage | Gratuit ? |
|---|---|---|
| Google Search Console | suivi positions, indexation, erreurs | ✅ |
| Google Analytics 4 | trafic, conversions | ✅ |
| Google PageSpeed Insights | Core Web Vitals terrain | ✅ |
| Schema.org Validator | validation JSON-LD | ✅ |
| Google Rich Results Test | preview rich snippets | ✅ |
| Ahrefs Webmaster Tools | backlinks, mots-clés | ✅ (limité) |
| Sistrix ou Haloscan | suivi de visibilité FR | 💰 |
| Ahrefs ou SEMrush | recherche mots-clés avancée | 💰 |

Si tu connectes un MCP Search Console à Cowork, les skills `baobabloyalty-seo-ops` et `baobabloyalty-seo-tracker` pourront récupérer les données automatiquement.

---

## Maintenance des skills

- Les skills sont versionnés via leur description. Pour les mettre à jour, modifie le contenu des dossiers, relance `package-all.ps1`, et réinstalle dans Cowork.
- Les exemples Baobab Loyalty (URLs, prix, plans) sont à ajuster dans les templates au fur et à mesure que ton site évolue.
- Tu peux dupliquer / renommer un skill `baobabloyalty-*` pour un autre projet (ex: `<autre-marque>-seo-ops`).

Bon SEO 🚀
