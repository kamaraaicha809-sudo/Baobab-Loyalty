# Core Web Vitals — guide d'optimisation Next.js

## Les 3 métriques officielles (2025)

| Métrique | Cible "bonne" | Mesure |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2,5 s | Temps de rendu du plus grand élément visible |
| **INP** (Interaction to Next Paint) | < 200 ms | Latence de la pire interaction |
| **CLS** (Cumulative Layout Shift) | < 0,1 | Stabilité visuelle du chargement |

INP a remplacé FID en mars 2024.

## Optimiser le LCP en Next.js

L'élément LCP est le plus souvent une image hero ou un bloc de texte.

```tsx
// app/page.tsx — image LCP avec priority
import Image from "next/image";

export default function Home() {
  return (
    <Image
      src="/hero.jpg"
      alt="Programme de fidélité Baobab"
      width={1600}
      height={900}
      priority      // ← précharge cette image
      sizes="100vw"
    />
  );
}
```

Autres leviers :
- Polices via `next/font` pour éviter le FOIT/FOUT
- `loading="lazy"` sur toutes les images sous la ligne de flottaison
- Réduire la taille du HTML initial (< 50 ko gzippé idéal)
- CDN devant l'app (Vercel le fait par défaut)

## Optimiser l'INP

L'INP mesure la latence des handlers d'interaction. Coupables fréquents :
- Listeners React lourds (filtrage de longues listes à chaque keystroke)
- Hydration côté client trop lente
- Scripts tiers (analytics, tag manager) qui bloquent le main thread

Remèdes :
```tsx
// Debounce d'un input de recherche
const [query, setQuery] = useState("");
const debouncedQuery = useDeferredValue(query);
// useDeferredValue (React 18+) marque la mise à jour comme non urgente
```

- Charger les scripts tiers avec `next/script` en `strategy="lazyOnload"`
- Préférer les Server Components quand l'interactivité n'est pas nécessaire
- Code-splitting agressif (`dynamic(() => import(...))`)

## Optimiser le CLS

Le CLS, c'est ce qui fait sauter la page pendant le chargement. Causes typiques :
- Images sans `width`/`height`
- Polices web qui changent la taille du texte (FOUT)
- Bannières de cookies / pubs injectées après le rendu

Remèdes :
```tsx
// Toujours spécifier les dimensions
<Image src="/produit.jpg" width={400} height={300} alt="..." />

// Réserver l'espace d'un bloc dynamique
<div style={{ minHeight: 200 }}>
  {data ? <Component data={data} /> : <Skeleton />}
</div>
```

## Mesurer

- **En labo** : Lighthouse (Chrome DevTools) ou `npx lighthouse https://baobabloyalty.com`
- **Sur le terrain** : Google Search Console → "Signaux Web essentiels"
- **En continu** : Vercel Speed Insights, ou Web Vitals API directement
- **Outil de référence** : https://pagespeed.web.dev/

## Web Vitals API (mesure custom)

```tsx
// app/web-vitals.tsx
"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Envoie à GA4, Plausible, Datadog, etc.
    fetch("/api/vitals", {
      method: "POST",
      body: JSON.stringify(metric),
      keepalive: true,
    });
  });
  return null;
}
```
