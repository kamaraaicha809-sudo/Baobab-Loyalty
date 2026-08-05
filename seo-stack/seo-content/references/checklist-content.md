# Checklist contenu SEO — avant publication

## Sujet & intention
- [ ] Mot-clé principal défini (1 seul)
- [ ] Intention de recherche identifiée (INFO / NAV / COM / TRX)
- [ ] Audience cible définie (persona)
- [ ] Concurrents SERP analysés (top 5)
- [ ] Angle différenciant identifié

## Structure
- [ ] Un seul H1, contenant le mot-clé principal
- [ ] H1 entre 50 et 70 caractères
- [ ] 4 à 8 H2 sur un article long
- [ ] Hiérarchie Hn respectée (pas de saut)
- [ ] Premier paragraphe : 100 premiers mots avec mot-clé principal
- [ ] Conclusion ou dernier paragraphe avec mot-clé principal

## Mots-clés
- [ ] Mot-clé principal dans : `<title>`, `<h1>`, meta description, URL, premier paragraphe, au moins un `<h2>`, alt d'une image
- [ ] Variations sémantiques présentes (synonymes, termes liés)
- [ ] Pas de bourrage (densité < 2%)
- [ ] Mots-clés secondaires couverts naturellement

## Lisibilité
- [ ] Phrases moyennes 15-20 mots
- [ ] Paragraphes 2-4 phrases
- [ ] Voix active majoritaire
- [ ] Listes / tableaux pour aérer le texte
- [ ] Ton cohérent (tu/vous, formel/casual)

## Multimédia
- [ ] Au moins 1 image originale
- [ ] Toutes les images ont un `alt` descriptif
- [ ] Au moins 1 image avec mot-clé dans l'alt
- [ ] Format moderne (WebP/AVIF) via `next/image`
- [ ] Image LCP avec attribut `priority`

## Maillage interne
- [ ] 3-5 liens internes contextuels
- [ ] Ancres descriptives (pas de "cliquez ici")
- [ ] Lien vers la page pilier liée
- [ ] Lien vers une page de conversion (produit, démo, tarifs)

## Liens externes
- [ ] 1-3 liens externes vers des sources d'autorité
- [ ] Liens externes en `target="_blank" rel="noopener"`
- [ ] Pas de lien vers des sites concurrents directs

## Métadonnées
- [ ] `<title>` 50-60 caractères
- [ ] Meta description 140-160 caractères avec CTA
- [ ] Open Graph configuré (image 1200×630)
- [ ] Canonical défini

## Données structurées
- [ ] JSON-LD `Article` présent (pour les articles)
- [ ] JSON-LD `BreadcrumbList`
- [ ] Auteur identifié avec schéma `Person`

## E-E-A-T
- [ ] Auteur visible avec biographie
- [ ] Date de publication affichée
- [ ] Date de mise à jour affichée
- [ ] Sources / études citées si données chiffrées
- [ ] Pas de fautes d'orthographe (passer correcteur)

## CTA & conversion
- [ ] Au moins 1 CTA dans l'article
- [ ] CTA cohérent avec l'intention (info → newsletter, com → démo, trx → essai)
- [ ] Encart "Articles liés" en bas

## Performance
- [ ] Images compressées
- [ ] Pas de scripts tiers bloquants
- [ ] Police chargée en `display: swap`

## Accessibilité (bonus SEO)
- [ ] Contraste texte/fond suffisant
- [ ] Liens identifiables sans la couleur seule
- [ ] Hiérarchie sémantique correcte
- [ ] Lang `fr` défini sur `<html>`

## Final
- [ ] URL en kebab-case avec mot-clé
- [ ] Pas indexé sur preview/staging
- [ ] Soumis dans Google Search Console (URL Inspection → Request Indexing)
