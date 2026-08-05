---
name: seo-sitemap
description: Génère sitemap.xml et robots.txt pour un site Next.js (App Router). À utiliser dès que l'utilisateur dit "sitemap", "robots.txt", "indexation Google", "soumettre mon site à Google", "comment Google trouve mes pages", "fichier robots", "plan du site". Déclenche aussi sur "ma page n'est pas indexée", "je veux que Google crawle X", "exclure X de l'indexation". Produit du code TypeScript pour `app/sitemap.ts` et `app/robots.ts` (génération native Next.js, pas de package externe). Adapté à baobabloyalty.com.
---

# SEO Sitemap & Robots

Génère les fichiers `sitemap.xml` et `robots.txt` natifs pour un projet Next.js App Router.

## Quand utiliser

- Mise en production d'un site (étape obligatoire pour Google Search Console)
- Ajout de nouvelles routes dynamiques (blog, produits, catégories)
- Refonte d'URL et changement de structure
- Exclusion de zones privées (admin, dashboard utilisateur, API)

## Pourquoi natif Next.js

Next.js 13+ (App Router) génère automatiquement `sitemap.xml` et `robots.txt` à partir de fichiers TypeScript. Pas besoin de packages externes (`next-sitemap`, `next-seo`). Avantages :
- Génération à la build (static) ou à la demande (dynamic)
- Type-safe
- Support natif des sitemaps multiples (`sitemap-0.xml`, `sitemap-1.xml`)
- Internationalisation via `alternates`

## Workflow

1. **Lister les routes du site** avec l'utilisateur :
   - Routes statiques (home, à propos, tarifs, contact…)
   - Routes dynamiques et leur source de données (DB, CMS, MDX)
2. **Décider les exclusions** :
   - `/admin`, `/dashboard`, `/api`, `/login` → exclus
   - Pages privées utilisateur → exclues
3. **Choisir le template** approprié dans `templates/`
4. **Générer le code** et indiquer où le placer
5. **Rappeler la soumission** à Google Search Console

## Templates disponibles

- `templates/sitemap-static.ts` — sitemap simple, routes en dur
- `templates/sitemap-dynamic.ts` — sitemap avec routes dynamiques (DB/CMS)
- `templates/sitemap-multilang.ts` — sitemap avec hreflang (FR + EN)
- `templates/sitemap-large.ts` — site > 50 000 URLs (sitemap index, paginé)
- `templates/robots.ts` — robots.txt natif
- `templates/robots-staging.ts` — robots.txt qui bloque tout sur preview/staging

## Champs du sitemap

| Champ | Obligatoire | Format | Note |
|---|---|---|---|
| `url` | ✅ | URL absolue | Doit matcher le canonical de la page |
| `lastModified` | ⚪ | Date | Aide Google à prioriser le re-crawl |
| `changeFrequency` | ⚪ | string | Indicatif uniquement, Google l'ignore largement |
| `priority` | ⚪ | 0.0 - 1.0 | Indicatif aussi, Google l'ignore |
| `alternates.languages` | ⚪ | object | Pour les sites multilingues |

Les champs indicatifs (`changeFrequency`, `priority`) sont peu utilisés par Google — ne pas y passer du temps.

## Robots.txt — règles essentielles

```
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /dashboard

Sitemap: https://baobabloyalty.com/sitemap.xml
```

Pièges :
- **Pas de `Disallow: /` en prod** (bloque tout)
- **Sitemap toujours en URL absolue**
- **Ne PAS bloquer** les CSS/JS/images : Google a besoin de les crawler pour rendre la page

## Soumission à Google

Après déploiement :
1. Vérifier `https://baobabloyalty.com/robots.txt` (200 OK)
2. Vérifier `https://baobabloyalty.com/sitemap.xml` (200 OK, XML valide)
3. Google Search Console → **Sitemaps** → Ajouter `sitemap.xml`
4. (Optionnel) Bing Webmaster Tools — même démarche

## Pièges courants

- **Sitemap avec URLs noindex** : incohérent. Si une page est `noindex`, elle ne devrait pas être dans le sitemap.
- **Sitemap qui dépasse les limites** : 50 000 URLs et 50 MB max par fichier. Au-delà, Next.js gère automatiquement le découpage si tu retournes plus que ça (mais penser à l'index).
- **Sitemap statique et données dynamiques** : utiliser `revalidate` ou `dynamic = "force-dynamic"`.
- **URLs en `localhost` dans le sitemap déployé** : utiliser `process.env.NEXT_PUBLIC_SITE_URL`.

## Vérification

```bash
# Test local
curl http://localhost:3000/sitemap.xml | head -50
curl http://localhost:3000/robots.txt

# Validation XML
curl -s https://baobabloyalty.com/sitemap.xml | xmllint --noout -
```

Outils en ligne :
- https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Google Search Console (rapport "Sitemaps")
