---
name: baobabloyalty-seo-refresh
description: Met à jour une page existante de baobabloyalty.com qui est exposée aux AI Overviews de Google ou en régression de positions. À utiliser dès que l'utilisateur dit "refresh la page X", "mets à jour mon article X", "page AI High", "AI Overviews", "ma page perd des clics", "régression SEO sur X", "recover SEO", "récupérer trafic", "page qui descend dans Google", "rafraîchir le contenu". Stratégie axée sur l'extractabilité par IA (réponses courtes, données chiffrées propres) ET la défense des positions traditionnelles. Produit un diff clair entre l'ancienne et la nouvelle version.
---

# Baobab Loyalty — SEO Refresh

Rafraîchit une page existante pour deux scénarios majeurs :
1. **Pages "AI High"** — pages où Google affiche un AI Overview (résumé IA) qui pille les clics
2. **Pages en régression** — chute de positions, baisse de clics, contenu daté

## Quand utiliser

- AI Overview détecté sur la requête principale (visible directement dans la SERP)
- Régression > 15% en clics sur 28 jours (Search Console)
- Article > 12 mois sans mise à jour
- Concurrent qui passe devant
- Audit annuel

## Pourquoi cette skill existe

Depuis 2024-2025, Google AI Overviews extraient des morceaux de pages pour répondre directement dans la SERP. Conséquence pour les éditeurs :
- **CTR effondre** (-30% à -60% selon les requêtes informationnelles)
- **Pages qui répondent en 2-3 phrases** sont préférées par l'IA (et peuvent être citées)
- **Pages avec données originales chiffrées** sont moins facilement remplaçables

L'enjeu : que ton article soit **soit cité par l'IA** (pour la visibilité de marque), **soit assez différencié pour mériter le clic** (données originales, expérience unique).

## Inputs attendus

L'utilisateur doit fournir :

1. **URL de la page** à rafraîchir
2. **Texte ou export** du contenu actuel
3. **Symptôme** :
   - AI Overview présent ? sur quelle requête ?
   - Chute de trafic depuis quand ?
   - Concurrent identifié qui ranke devant ?
4. **Données fraîches disponibles** (étude récente, chiffres clients, étude maison) — c'est le levier #1

## Workflow

1. **Analyser l'état actuel** :
   - Lire le contenu via Read ou WebFetch
   - Identifier les passages "AI-extractables" (réponses courtes, listes)
   - Repérer le contenu daté (chiffres anciens, années passées dans le titre, références obsolètes)
2. **Définir la stratégie de refresh** parmi les 3 stratégies ci-dessous
3. **Réécrire les sections** concernées
4. **Mettre à jour** : `dateModified`, `wordCount`, `keywords`, lien internes
5. **Livrer un diff clair** : ce qui change, pourquoi
6. **Proposer un re-soumission** Search Console (URL Inspection → Request Indexing)

## Les 3 stratégies de refresh

### Stratégie 1 — "Defensive AI" (page AI High)

L'objectif n'est pas de battre l'IA, mais de :
- Faire que l'IA cite ta page (gain de marque)
- Donner au lecteur une raison de cliquer

Tactiques :
- **Réponse directe en début d'article** : une réponse de 2-3 phrases au mot-clé principal, citable telle quelle par l'IA. Format : "[mot-clé] est…"
- **Données originales en milieu d'article** : étude maison, chiffres clients, témoignages chiffrés. C'est ça qui fait cliquer (l'IA ne peut pas le synthétiser).
- **Cas pratique étape par étape** : exemples concrets, captures d'écran, résultats.
- **FAQ longue** : 8-12 questions/réponses, source classique de réponses pour l'IA.
- **Schéma JSON-LD enrichi** : `Article` avec `mentions`, `cites`, `author` détaillé.

Anti-pattern : ajouter "en 2026" dans le titre sans changer le contenu.

### Stratégie 2 — "Recovery" (page en régression)

Diagnostiquer d'abord la cause :
- **Contenu daté** → mise à jour des chiffres, exemples, dates
- **Concurrent passé devant** → analyse de leur angle, ajout d'éléments manquants
- **Mots-clés cibles ont changé d'intention** → repositionnement
- **Page lente** → optimisation CWV (renvoyer vers seo-audit)
- **Maillage cassé** → réinjection de liens internes

Tactiques :
- Réécrire l'introduction (les 100 premiers mots ont le plus d'impact SEO)
- Ajouter 2-3 sections sur des sous-thèmes manquants (combler le gap concurrentiel)
- Mettre à jour la date `dateModified` ET intégrer "mis à jour [mois année]" en début d'article
- Republier en mettant en avant via newsletter / social

### Stratégie 3 — "Annual refresh" (maintenance)

Pour les pages performantes mais > 12 mois :
- Mettre à jour les chiffres et études
- Vérifier les liens externes (sont-ils encore valides ?)
- Ajouter un encart "Mise à jour [année]" en début
- Étoffer la FAQ avec les nouvelles questions du marché
- Régénérer l'image OG si pertinent

## Format de livraison — diff structuré

```markdown
# Refresh — [URL de la page]

**Date :** [date]
**Stratégie appliquée :** Defensive AI / Recovery / Annual refresh
**Symptôme initial :** [description]

## Diagnostic
- [Constat 1]
- [Constat 2]

## Changements proposés

### 1. Introduction (100 premiers mots)
**Avant :**
> [extrait actuel]

**Après :**
> [nouvelle version]

**Pourquoi :** [justification]

### 2. [Section X]
**Avant / Après / Pourquoi**

### 3. Nouvelle section ajoutée : "[titre]"
[contenu complet]

### 4. FAQ enrichie
[nouvelles questions/réponses]

### 5. Métadonnées mises à jour
- `dateModified` → [nouvelle date]
- `description` → "[nouvelle meta]"
- `wordCount` → [X → Y]
- Tags ajoutés : ...

### 6. Liens internes ajoutés
- → /blog/article-X
- → /tarifs

## Données originales injectées
- [Donnée 1] (source : [étude maison / interview / chiffre client])
- [Donnée 2]

## Checklist post-publication
- [ ] Republier sur la même URL (ne PAS changer le slug)
- [ ] Soumettre à Search Console (URL Inspection → Request Indexing)
- [ ] Mettre à jour la date dans le sitemap (`lastModified`)
- [ ] Pousser sur newsletter et réseaux sociaux
- [ ] Tracker les positions sur les 7-14 jours suivants
```

## Pièges courants

- **Changer l'URL** : casse les backlinks et perd l'historique. Toujours garder la même URL.
- **Trop changer** : un refresh agressif peut perturber le ranking (effet "fresh content" qui se retourne). Mieux vaut un refresh ciblé sur les sections faibles.
- **Oublier `dateModified`** : Google se fie à cette date pour le `freshness boost`.
- **Refresh sans diagnostic** : refondre une page qui marche très bien peut la pénaliser. Ne refresh que ce qui en a besoin.
- **Bourrer de mots-clés** : le refresh est l'occasion de **simplifier** le langage pour l'extractabilité IA, pas l'inverse.

## Quand NE PAS refresh

- Page qui performe bien (laisse-la tranquille)
- Page < 6 mois (laisse-lui le temps de mûrir)
- Page sur sujet daté qui n'est plus pertinent → préférer la dépublication propre (301 vers la page pilier)

## Skills compagnons

- **baobabloyalty-seo-ops** — pour identifier les pages à refresh
- **seo-content** — pour les règles éditoriales
- **seo-schema** — pour enrichir le JSON-LD
- **seo-audit** — si la régression vient d'un problème technique
