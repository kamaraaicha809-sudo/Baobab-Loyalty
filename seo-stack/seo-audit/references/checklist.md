# Checklist SEO complète (imprimable)

## Indexabilité
- [ ] La page renvoie un statut HTTP 200
- [ ] `<meta name="robots">` ne contient pas `noindex` (sauf intention)
- [ ] `<link rel="canonical">` présent et pointant vers l'URL canonique
- [ ] La page n'est pas bloquée par `robots.txt`
- [ ] La page apparaît dans `sitemap.xml`
- [ ] Pas de chaîne de redirections (301 → 301 → 200)

## On-page (balises)
- [ ] `<title>` 50-60 caractères, mot-clé principal en début
- [ ] `<meta name="description">` 140-160 caractères, avec CTA
- [ ] `<html lang="fr">` ou langue cible
- [ ] `<meta charset="UTF-8">`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">`

## Open Graph & Twitter
- [ ] `og:title`, `og:description`, `og:url`, `og:type`, `og:image`
- [ ] `og:image` 1200×630 px, < 5 MB, format JPG/PNG
- [ ] `og:locale="fr_FR"`
- [ ] `twitter:card="summary_large_image"`
- [ ] `twitter:image`, `twitter:title`, `twitter:description`

## Structure
- [ ] Un seul `<h1>` par page
- [ ] Hiérarchie h2 → h3 → h4 respectée
- [ ] Au moins 2-3 `<h2>` sur les pages de contenu
- [ ] Utilisation de `<main>`, `<article>`, `<nav>`, `<footer>`

## Images
- [ ] Toutes les images ont un attribut `alt` descriptif
- [ ] Images décoratives : `alt=""`
- [ ] Format moderne (WebP/AVIF) via `next/image`
- [ ] `priority` sur l'image LCP
- [ ] Dimensions explicites (width/height) pour éviter le CLS

## Performance (Core Web Vitals)
- [ ] LCP < 2,5 s (au 75e percentile)
- [ ] INP < 200 ms
- [ ] CLS < 0,1
- [ ] Polices en `display: swap` ou `next/font`
- [ ] Pas de JS bloquant en `<head>` non critique
- [ ] Compression Brotli/Gzip activée
- [ ] Cache HTTP (`Cache-Control`) configuré

## Données structurées
- [ ] Au moins un schéma `Organization` ou `WebSite` sur la home
- [ ] Schémas pertinents par type de page (Product, Article, FAQ, BreadcrumbList…)
- [ ] Validation Schema.org Validator passée
- [ ] Validation Rich Results Test passée

## Maillage interne
- [ ] Profondeur de clic max 3-4 depuis la home
- [ ] Au moins 2-3 liens internes contextuels par page
- [ ] Texte des liens descriptif (pas de "cliquez ici")
- [ ] Pas de liens cassés (404)

## URLs
- [ ] URLs lisibles en kebab-case
- [ ] Pas de paramètres dynamiques sur les pages indexables (sauf canonical)
- [ ] HTTPS partout, redirection HTTP → HTTPS
- [ ] Pas de duplication www / non-www

## Multilingue (si applicable)
- [ ] `hreflang` sur chaque page localisée
- [ ] `hreflang="x-default"` configuré
- [ ] Sitemap par langue ou index de sitemaps

## Suivi & analytics
- [ ] Google Search Console configuré et vérifié
- [ ] Sitemap soumis dans GSC
- [ ] Google Analytics 4 (ou équivalent) installé
- [ ] Suivi des conversions configuré
