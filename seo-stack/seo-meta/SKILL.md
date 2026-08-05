---
name: seo-meta
description: Génère des balises meta SEO optimisées (title, description, Open Graph, Twitter Cards) pour Next.js App Router. À utiliser dès que l'utilisateur demande "des meta tags", "balises meta", "Open Graph", "OG tags", "title et description SEO", "metadata Next.js", "preview LinkedIn/Facebook/Twitter", ou veut "rédiger les balises" d'une page. Déclenche aussi sur "comment ma page apparaît dans Google", "améliorer le clic depuis Google", "snippet Google". Produit du code TypeScript prêt à coller dans `app/[route]/page.tsx` via la `Metadata API` de Next.js 13+. Adapté à baobabloyalty.com.
---

# SEO Meta Tags Generator

Génère des balises meta optimisées pour le SEO et les partages sociaux, au format Next.js App Router (Metadata API).

## Quand utiliser

- Création d'une nouvelle page Next.js
- Refonte des balises meta d'une page existante
- Page produit / landing / article de blog
- Génération de snippets Google attractifs
- Préparation des previews de partage (LinkedIn, Facebook, X, WhatsApp)

## Workflow

1. **Comprendre la page** : type (home, produit, article, landing), audience, intention de recherche, mot-clé principal
2. **Rédiger les copies** en suivant les règles ci-dessous
3. **Choisir le template** approprié dans `templates/`
4. **Générer le bloc `metadata`** TypeScript et le présenter à l'utilisateur
5. **Vérifier l'image OG** (1200×630, < 5 MB)

## Règles de rédaction

### Title (50-60 caractères)
Format recommandé pour le marché FR :
```
[Mot-clé principal] : [Promesse / bénéfice] | [Marque]
```
Exemples :
- `Programme de fidélité B2B simple et efficace | Baobab Loyalty`
- `Tarifs Baobab Loyalty — Plans pour PME et grandes enseignes`
- `Comment lancer un programme de fidélité en 2026 — Guide Baobab`

À éviter : titres dupliqués entre pages, bourrage de mots-clés, marque en début (sauf home).

### Description (140-160 caractères)
Doit contenir : bénéfice clé + preuve / chiffre + appel à l'action.

Exemples :
- `Lancez votre programme de fidélité en 7 jours. +250 enseignes nous font confiance. Démo gratuite, sans carte bancaire.` (120 car.)
- `Découvrez la plateforme française de fidélité B2B la plus simple : cartes digitales, points, récompenses. Essai gratuit 14 jours.` (132 car.)

À éviter : description copiée du title, descriptions identiques sur plusieurs pages, abus de superlatifs.

### Open Graph
- `og:title` : peut être plus accrocheur que `<title>` (jusqu'à 88 car. avant troncature LinkedIn)
- `og:description` : 200 car. max (LinkedIn coupe à ~200, Facebook à ~300)
- `og:image` : 1200×630 px, < 5 MB, format JPG ou PNG
- `og:locale` : `fr_FR` pour le marché FR
- `og:type` : `website` (home, landing), `article` (blog), `product` (e-commerce)

### Twitter Card
- `twitter:card` : `summary_large_image` (recommandé) ou `summary`
- `twitter:site` : handle de la marque (`@baobabloyalty` si existant)
- `twitter:image` : peut réutiliser `og:image`

## Templates Next.js

Voir le dossier `templates/` :
- `metadata-static.ts` — page statique (home, à propos, tarifs)
- `metadata-dynamic.ts` — page dynamique avec `generateMetadata` (produit, article)
- `metadata-layout.ts` — métadonnées globales dans `app/layout.tsx`
- `opengraph-image.tsx` — génération dynamique d'image OG via Next.js

## Format de livraison

Toujours présenter à l'utilisateur :

1. **Le bloc TypeScript prêt à coller**, avec commentaires pour les valeurs à personnaliser
2. **Le rendu attendu** dans Google :
   ```
   Programme de fidélité B2B simple et efficace | Baobab Loyalty
   https://baobabloyalty.com › ...
   Lancez votre programme de fidélité en 7 jours. +250 enseignes nous...
   ```
3. **Le rendu attendu** sur les réseaux sociaux (texte du card)
4. **Les outils de validation** :
   - https://www.opengraph.xyz/ (preview multi-plateformes)
   - https://cards-dev.twitter.com/validator (Twitter)
   - https://www.linkedin.com/post-inspector/ (LinkedIn)

## Pièges courants

- **Title dupliqué** : chaque page doit avoir un title unique. Utiliser un `template` dans `app/layout.tsx` pour automatiser.
- **og:image manquante** : Next.js a un fallback intelligent via `opengraph-image.tsx`, à utiliser dès que possible.
- **Cache des plateformes** : Facebook/LinkedIn cachent les images OG. Forcer le refresh via leurs debuggers.
- **Title trop long** : Google tronque autour de 580 px (≈ 60 car.) en desktop, moins en mobile.
- **Caractères spéciaux** : éviter les emojis dans le `<title>` (ils sont parfois supprimés par Google).

## Notes pour baobabloyalty.com

Hypothèses (à valider avec l'utilisateur si besoin) :
- Marque : `Baobab Loyalty`
- Tagline : `Programme de fidélité simple et puissant`
- Domaine : `https://baobabloyalty.com`
- Image OG par défaut : `https://baobabloyalty.com/og-default.jpg`
- Locale : `fr_FR`
- Twitter handle : à confirmer

Pour la page d'accueil, conserver un title qui matche la requête de marque "baobab loyalty" + une requête générique ("programme fidélité B2B").
