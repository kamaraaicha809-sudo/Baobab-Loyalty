---
name: seo-schema
description: Génère des données structurées JSON-LD (schema.org) pour le SEO. À utiliser dès que l'utilisateur dit "JSON-LD", "données structurées", "rich snippets", "rich results", "schema.org", "balisage Google", "FAQ Google", "étoiles Google", "fil d'ariane Google", "extraits enrichis", "structured data". Déclenche aussi sur "comment apparaître avec des étoiles dans Google", "afficher mon FAQ dans Google", "schéma Organization". Produit du JSON-LD valide ainsi que des composants React/Next.js prêts à coller. Couvre Organization, WebSite, Product, Article, FAQPage, BreadcrumbList, LocalBusiness, Review, HowTo, SoftwareApplication. Adapté à baobabloyalty.com.
---

# SEO Structured Data (JSON-LD)

Génère des balises JSON-LD conformes à schema.org pour activer les rich results de Google.

## Quand utiliser

- Page produit / service → `Product` ou `Service`
- Page d'accueil → `Organization` + `WebSite` (avec `SearchAction`)
- Article de blog → `Article` ou `BlogPosting`
- Page FAQ → `FAQPage`
- Toutes pages avec breadcrumb → `BreadcrumbList`
- Entreprise locale → `LocalBusiness`
- Avis clients → `Review` / `AggregateRating` (attention aux règles Google !)
- Tutoriel / guide → `HowTo`
- App SaaS → `SoftwareApplication`

## Workflow

1. **Identifier le type de page** et donc le(s) schéma(s) pertinent(s)
2. **Récupérer les données** (titre, prix, images, dates, auteur…)
3. **Choisir le template** dans `templates/`
4. **Générer le JSON-LD** et le composant React qui l'injecte
5. **Valider** sur https://validator.schema.org/ et https://search.google.com/test/rich-results

## Bonnes pratiques

- **Un seul `<script type="application/ld+json">` par schéma** (Google les lit tous)
- Toujours utiliser `@context: "https://schema.org"`
- URLs absolues partout (`https://...`)
- Inclure `@id` pour relier les schémas entre eux
- Ne PAS dupliquer les schémas (un seul `Organization` sur le site, dans `app/layout.tsx`)
- Ne jamais inventer de fausses notes / faux avis (Google sanctionne)

## Composant Next.js standard

Pattern recommandé pour injecter du JSON-LD dans une page (App Router) :

```tsx
// components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

Puis dans une page :
```tsx
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema } from "@/lib/schemas";

export default function Page() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <main>{/* … */}</main>
    </>
  );
}
```

## Templates disponibles

Dans `templates/` :
- `organization.json` — schéma `Organization` pour la home
- `website.json` — schéma `WebSite` avec `SearchAction` (sitelinks searchbox)
- `product.json` — schéma `Product` avec `Offer`
- `service.json` — schéma `Service` (pour SaaS, prestations)
- `software-application.json` — `SoftwareApplication` (idéal pour SaaS B2B)
- `article.json` — `Article` / `BlogPosting`
- `faq.json` — `FAQPage` (rich result FAQ)
- `breadcrumb.json` — `BreadcrumbList`
- `local-business.json` — `LocalBusiness` avec horaires
- `review.json` — `Review` (avis individuel)
- `aggregate-rating.json` — `AggregateRating` (notation moyenne)
- `howto.json` — `HowTo` (tuto étape par étape)
- `helpers.ts` — helpers TypeScript pour générer les schémas

## Rich results disponibles (2025)

| Schéma | Rich result obtenu |
|---|---|
| `Article` | Carousel d'articles, image grand format |
| `Product` | Étoiles, prix, disponibilité dans Google Shopping |
| `FAQPage` | FAQ déroulante directement dans la SERP |
| `Recipe` | Carrousel recettes (hors sujet ici) |
| `HowTo` | Étapes numérotées dans la SERP |
| `Event` | Calendrier d'événements |
| `LocalBusiness` | Carte locale, horaires |
| `BreadcrumbList` | Fil d'ariane sous le titre dans la SERP |
| `WebSite` + `SearchAction` | Barre de recherche dans la SERP de marque |

⚠️ Depuis août 2023, le rich result FAQ n'est affiché que pour les sites "well-known authoritative" (gov, edu, gros sites de santé). Pour la plupart des sites, le balisage reste utile mais l'affichage n'est plus garanti.

## Pièges courants

- **Données invisibles à l'utilisateur** : Google exige que tout ce qui est balisé soit aussi visible dans la page (sinon c'est du spam).
- **`AggregateRating` sans avis publics** : Google le rejette.
- **Schémas multiples qui se contredisent** : utiliser `@id` pour relier proprement.
- **Date au mauvais format** : utiliser ISO 8601 (`2026-05-03T10:00:00+02:00`).
- **Locale absente** : pour le marché FR, `inLanguage: "fr-FR"`.

## Hypothèses pour baobabloyalty.com

- Type principal : `SoftwareApplication` (SaaS B2B de fidélisation)
- `Organization` sur la home avec logo, sameAs (LinkedIn, Twitter, Instagram)
- `BreadcrumbList` sur toutes les pages internes
- `FAQPage` sur la page tarifs / FAQ
- `Article` sur les pages de blog
- Pas de `LocalBusiness` (sauf si tu as une adresse physique)
