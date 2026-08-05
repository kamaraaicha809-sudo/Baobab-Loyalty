---
name: seo-audit
description: Audit SEO technique d'une page web ou d'un site Next.js. À utiliser dès que l'utilisateur demande un audit SEO, un check SEO, une analyse SEO, ou parle de Core Web Vitals, Lighthouse, balises meta manquantes, problèmes d'indexation, structure de headings, robots.txt, canonical, ou veut "vérifier le SEO" d'une page. Déclenche aussi sur "pourquoi ma page ne ressort pas sur Google", "améliorer mon référencement", "diagnostiquer mon SEO". Particulièrement adapté à baobabloyalty.com et autres apps Next.js. Produit un rapport markdown structuré avec score, problèmes critiques, et actions correctives priorisées.
---

# SEO Audit

Audit SEO technique complet d'une page ou d'un site. Couvre les fondamentaux on-page, l'indexabilité, la performance et les données structurées.

## Quand utiliser cette skill

- L'utilisateur fournit une URL et demande un audit
- L'utilisateur fournit un fichier HTML local (export Next.js, page statique)
- L'utilisateur veut prioriser des correctifs SEO
- L'utilisateur prépare un lancement et veut un check pré-prod

## Workflow

1. **Récupérer la page** — soit via WebFetch (URL distante), soit via Read (fichier HTML local)
2. **Lancer le script d'analyse** — `scripts/audit_page.py <url-ou-fichier>` produit un JSON brut
3. **Croiser avec les Core Web Vitals** — si une URL est fournie, suggérer un check PageSpeed Insights (https://pagespeed.web.dev/) à l'utilisateur car ces données viennent de mesures terrain
4. **Rédiger le rapport** au format défini ci-dessous

## Checklist d'audit (les 6 axes)

### 1. Indexabilité
- `<meta name="robots">` présent et cohérent (pas de `noindex` non voulu)
- Balise `<link rel="canonical">` présente et pointant vers la bonne URL
- Pas de blocage `Disallow` dans robots.txt sur la page
- Statut HTTP 200 (pas de 3xx en chaîne, pas de 4xx/5xx)

### 2. Balises meta essentielles
- `<title>` : 50-60 caractères, mot-clé principal en début, marque en fin
- `<meta name="description">` : 140-160 caractères, incitation au clic
- `<meta property="og:title">`, `og:description`, `og:image`, `og:url`, `og:type`
- `<meta name="twitter:card">` (`summary_large_image` recommandé)
- `<html lang="fr">` correctement défini

### 3. Structure sémantique
- Un seul `<h1>` par page, contenant le mot-clé principal
- Hiérarchie h2/h3/h4 respectée (pas de saut de niveau)
- `<main>`, `<nav>`, `<article>`, `<section>` utilisés
- Tous les `<img>` ont un attribut `alt` descriptif (sauf décoratives = `alt=""`)
- Pas de texte en image pour le contenu critique

### 4. Performance (Core Web Vitals)
Cibles Google 2025 :
- **LCP** (Largest Contentful Paint) : < 2,5 s
- **INP** (Interaction to Next Paint) : < 200 ms
- **CLS** (Cumulative Layout Shift) : < 0,1
- Images en `next/image` (Next.js) avec `priority` sur l'image LCP
- Polices chargées en `display: swap`
- Pas de JS bloquant le rendu initial

### 5. Données structurées
- Au moins un schéma JSON-LD présent (Organization, WebSite, ou spécifique à la page)
- Validation via Schema.org Validator (https://validator.schema.org/)
- Pas d'erreurs sur Rich Results Test (https://search.google.com/test/rich-results)

### 6. Maillage et URLs
- URLs lisibles, en kebab-case, sans paramètres inutiles
- Profondeur de clic < 4 depuis la home
- Au moins 2-3 liens internes contextuels par page de contenu
- Pas de liens cassés (404)

## Format du rapport

Toujours suivre cette structure :

```markdown
# Audit SEO — [URL ou nom de page]
**Date :** [date]
**Score global :** [X/100]

## 🔴 Critiques (bloquants pour le référencement)
- [Problème] — [Impact] — [Correctif]

## 🟠 Importants (impact significatif)
- ...

## 🟡 Optimisations (gains marginaux)
- ...

## ✅ Points forts
- ...

## Plan d'action priorisé
1. [Action] — Effort : [S/M/L] — Impact : [⭐/⭐⭐/⭐⭐⭐]
2. ...
```

## Scoring

Calcul indicatif (à ajuster selon le contexte) :
- Indexabilité : 25 pts
- Meta + structure : 25 pts
- Performance : 25 pts
- Données structurées : 15 pts
- Maillage et URLs : 10 pts

Un manquement critique sur l'indexabilité (ex : `noindex` accidentel) = score plafonné à 40.

## Notes pour baobabloyalty.com

Programme de fidélité B2B/B2C, marché français principalement. Points d'attention spécifiques :
- Schéma `Organization` avec logo + sameAs (réseaux sociaux)
- Schéma `Product` ou `Service` selon les pages d'offre
- `LocalBusiness` si présence physique
- Hreflang `fr-FR` minimum, ajouter `en-US` si version anglaise

## Ressources

- `scripts/audit_page.py` — extraction automatisée des éléments SEO d'une page HTML
- `references/checklist.md` — checklist détaillée imprimable
- `references/core-web-vitals.md` — guide d'optimisation des CWV en Next.js
