---
name: baobabloyalty-seo-writer
description: Rédige un article SEO complet et publiable pour le blog Baobab Loyalty, en suivant le Plan SEO. À utiliser dès que l'utilisateur dit "écris l'article sur X", "rédige le prochain article SEO", "écris l'article cluster sur X", "rédige selon le plan SEO", "publie un article", "rédaction SEO Baobab", "génère l'article du calendrier éditorial". Produit un fichier markdown ou MDX prêt à publier dans Next.js, avec frontmatter complet (title, description, slug, dates, tags), structure Hn optimisée, JSON-LD Article + Breadcrumb, maillage interne intégré, et CTA cohérent. Marché FR.
---

# Baobab Loyalty — SEO Writer

Rédige un article SEO complet et publiable, aligné sur le Plan SEO Baobab Loyalty. Sortie : un fichier Markdown / MDX prêt à coller dans `app/blog/[slug]/page.mdx` (ou équivalent CMS).

## Quand utiliser

- "Écris l'article cluster sur la fidélisation B2B"
- "Rédige le prochain article du calendrier éditorial"
- "Génère un article SEO sur [sujet]"

## Pré-requis avant rédaction

L'utilisateur doit fournir (ou la skill demande) :

1. **Mot-clé principal** ciblé
2. **Mots-clés secondaires** (3-5)
3. **Intention de recherche** (info / com / trx)
4. **Cluster ou pilier** auquel l'article appartient
5. **Pages internes à lier** (au moins le pilier + 2-3 autres articles)
6. **CTA cible** (essai gratuit, démo, newsletter, autre)
7. **Longueur cible** (par défaut : 1500 mots informationnel, 2500 mots pilier)

Si ces infos manquent, **toujours demander** avant de rédiger — un article sans brief = article qui ne convertit pas.

## Workflow

1. **Recevoir le brief** (ou le construire avec l'utilisateur)
2. **Analyser la SERP** :
   - Identifier les 3-5 angles déjà couverts par le top 5
   - Identifier l'angle différenciant pour Baobab
3. **Construire le plan détaillé** (H1, H2, H3) et le faire valider à l'utilisateur si l'article est important
4. **Rédiger** en respectant les règles ci-dessous
5. **Ajouter** : frontmatter, JSON-LD Article + Breadcrumb, meta tags, liens internes
6. **Livrer** le fichier Markdown / MDX complet
7. **Proposer** la prochaine étape (publication, refresh d'un article lié, brief de l'article suivant)

## Règles de rédaction Baobab

### Ton & voix
- **Tutoiement** par défaut (à confirmer avec l'utilisateur si vouvoiement préféré)
- Concret, pragmatique, orienté résultats
- Exemples chiffrés systématiquement (ROI, %, durées)
- Pas de superlatifs creux ("révolutionnaire", "incroyable")

### Structure standard d'un article cluster (1500-2000 mots)

```
H1 : [Titre — 50-70 car., contenant le mot-clé principal]

[Hook — 2-3 phrases : statistique ou question forte]
[TL;DR — 1 paragraphe qui résume l'article + qui devrait le lire]

H2 : [Définition / contexte] — répond au "qu'est-ce que"
H2 : [Pourquoi c'est important] — répond au "pourquoi"
H2 : [Méthode / étapes] — corps de l'article (3-5 H3)
H2 : [Erreurs à éviter] — value-add clé
H2 : [Outils & ressources] — opportunité de mailler
H2 : [Cas concret Baobab] — preuve sociale + différenciation
H2 : [FAQ] — 4-6 questions (boost rich result + couverture longue traîne)

[CTA final cohérent avec l'intention]
[Encart auteur + 3 articles liés]
```

### Structure d'un pilier (2500-4000 mots)

Voir `seo-content/references/templates-structure.md` (template "page pilier").
Différences clés :
- Sommaire avec ancres en début
- 8-12 H2 (vs 5-7 pour cluster)
- Plus de FAQ (8-12 questions)
- Cite et lie tous les articles cluster du même thème

### Maillage interne — obligatoire

Sur chaque article :
- **Au moins 1 lien vers la page pilier** du cluster
- **2-3 liens vers articles cluster** liés
- **1 lien vers une page de conversion** (tarifs, démo, ou page produit)
- **1-2 liens externes** vers sources d'autorité (études, rapports officiels)

### Liens internes Baobab principaux

| Page | URL |
|---|---|
| Home | https://baobabloyalty.com/ |
| Fonctionnalités | https://baobabloyalty.com/fonctionnalites |
| Tarifs | https://baobabloyalty.com/tarifs |
| Cas clients | https://baobabloyalty.com/cas-clients |
| Démo | https://baobabloyalty.com/demo |
| Pilier "Programme de fidélité" | https://baobabloyalty.com/programme-fidelite |
| Pilier "Carte digitale" | https://baobabloyalty.com/carte-fidelite-digitale |
| Pilier "Fidélisation client" | https://baobabloyalty.com/fidelisation-client |

## Format de livraison — fichier MDX

```mdx
---
title: "[Titre H1]"
description: "[Meta description 140-160 car. avec CTA]"
slug: "[slug-en-kebab-case]"
publishedAt: "[ISO 8601]"
updatedAt: "[ISO 8601]"
author:
  name: "[Auteur]"
  url: "https://baobabloyalty.com/equipe/[slug-auteur]"
coverImage: "/blog/[slug]/cover.jpg"
ogImage: "/blog/[slug]/og.jpg"
tags: ["fidélisation", "B2B", "stratégie"]
category: "Stratégie"
keywords:
  primary: "[mot-clé principal]"
  secondary: ["mot-clé 2", "mot-clé 3"]
relatedPosts:
  - "/blog/article-lie-1"
  - "/blog/article-lie-2"
  - "/blog/article-lie-3"
cluster: "programme-fidelite"
wordCount: 1850
readingTime: 9
---

# [H1 ici]

[Hook + TL;DR]

## [H2 1]

[Contenu]

...
```

## Données structurées à inclure

Le skill génère systématiquement, à coller dans `<JsonLd>` :

```jsonc
// JSON-LD Article (à enrichir avec les valeurs réelles)
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[H1]",
  "description": "[meta description]",
  "image": ["[ogImage]"],
  "datePublished": "[publishedAt]",
  "dateModified": "[updatedAt]",
  "author": { "@type": "Person", "name": "[Auteur]", "url": "[url auteur]" },
  "publisher": {
    "@type": "Organization",
    "name": "Baobab Loyalty",
    "logo": { "@type": "ImageObject", "url": "https://baobabloyalty.com/logo.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://baobabloyalty.com/blog/[slug]" },
  "inLanguage": "fr-FR",
  "wordCount": 1850
}
```

Plus un `BreadcrumbList` (Accueil → Blog → Article) — voir skill `seo-schema`.

## Checklist avant livraison

- [ ] H1 contient le mot-clé principal, < 70 car.
- [ ] Meta description 140-160 car. avec CTA
- [ ] Mot-clé principal dans les 100 premiers mots
- [ ] Au moins 4 H2, hiérarchie respectée
- [ ] Lien interne vers la page pilier
- [ ] 2-3 autres liens internes
- [ ] 1-2 liens externes d'autorité
- [ ] CTA cohérent avec l'intention
- [ ] FAQ avec 4-6 questions
- [ ] JSON-LD Article + Breadcrumb
- [ ] Frontmatter MDX complet
- [ ] Slug en kebab-case avec mot-clé
- [ ] Pas de phrases > 25 mots
- [ ] Voix active majoritaire

Pour une checklist complète, voir aussi `seo-content/references/checklist-content.md`.

## Skills compagnons

- **seo-keywords** — pour cadrer le brief mot-clé avant rédaction
- **seo-meta** — pour fignoler les balises meta de l'article
- **seo-schema** — pour les JSON-LD avancés
- **seo-content** — pour les règles éditoriales détaillées
- **baobabloyalty-seo-refresh** — pour mettre à jour cet article plus tard
