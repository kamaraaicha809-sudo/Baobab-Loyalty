---
name: seo-keywords
description: Recherche et organise des mots-clés SEO pour le marché français. À utiliser dès que l'utilisateur dit "mots-clés", "keywords", "recherche de mots-clés", "stratégie SEO", "intention de recherche", "mots-clés longue traîne", "cluster de mots-clés", "cocon sémantique", "topic cluster", "ranking", "positionnement Google". Déclenche aussi sur "sur quels mots-clés me positionner", "que cherchent les gens sur Google", "trouver des sujets d'articles". Produit une stratégie de mots-clés structurée par intention de recherche, avec mots-clés piliers + longue traîne, et propositions de pages cibles. Adapté au marché FR et à baobabloyalty.com.
---

# SEO Keywords Strategy

Construit une stratégie de mots-clés structurée pour le marché français : mots-clés piliers, longue traîne, intentions de recherche, et plan éditorial.

## Quand utiliser

- Lancement d'un site / refonte SEO
- Création d'une rubrique blog
- Identification des opportunités de positionnement
- Briefing rédactionnel pour un nouvel article / page
- Analyse de concurrence sur une thématique

## Limites importantes

Cette skill **ne se connecte pas** à Google, Ahrefs, SEMrush ou Search Console. Elle s'appuie sur :
- Les connaissances structurelles sur le SEO français (intentions, structure SERP, comportements de recherche)
- Le brief de l'utilisateur (sujet, audience, concurrents)
- Si possible, des recherches via WebSearch ou des données fournies par l'utilisateur (export CSV, capture d'outil)

Pour des volumes de recherche fiables, oriente l'utilisateur vers les outils :
- **Gratuits** : Google Trends, Ubersuggest (limité), AnswerThePublic, Search Console
- **Freemium** : Google Keyword Planner (compte Google Ads), Ahrefs Webmaster Tools
- **Payants** : Ahrefs, SEMrush, Sistrix (référence FR), Haloscan (référence FR récente)

## Workflow

1. **Cadrer le sujet** avec l'utilisateur :
   - Quelle audience ? (PME, grands comptes, marketers, dev…)
   - Quelle thématique principale ?
   - Quels concurrents directs ?
2. **Identifier les piliers** : 3-7 sujets larges qui structurent la stratégie
3. **Décliner par intention** : pour chaque pilier, lister mots-clés transactionnels, informationnels, navigationnels, commerciaux
4. **Élargir en longue traîne** : variations, questions, comparaisons
5. **Mapper aux pages** : quel mot-clé → quelle page (existante ou à créer)
6. **Livrer** sous forme de tableau structuré (markdown ou CSV)

## Les 4 intentions de recherche

| Intention | Description | Type de page idéal |
|---|---|---|
| **Informationnelle** | "Comment…", "Qu'est-ce que…", "Pourquoi…" | Article de blog, guide |
| **Navigationnelle** | "Baobab Loyalty connexion", "Salesforce login" | Home, page de connexion |
| **Commerciale** | "Meilleur logiciel X", "X vs Y", "Avis X" | Page comparatif, étude de cas |
| **Transactionnelle** | "Acheter X", "X pas cher", "Tarif X" | Page produit, pricing, démo |

Le matching intention ↔ type de page est la base : un site qui répond à une requête commerciale par un article généraliste se fait dépasser.

## Structure d'un cluster (cocon sémantique)

Modèle "pillar + cluster" qui marche très bien sur le marché FR :

```
PAGE PILIER (mot-clé large, fort volume)
   │
   ├─ Article cluster 1 (mot-clé moyenne traîne)
   ├─ Article cluster 2
   ├─ Article cluster 3
   └─ Article cluster N
       │
       └─ Lien vers le pilier ⇄ liens entre articles cluster
```

Exemple pour Baobab Loyalty :
```
PILIER : "programme de fidélité" (page = /programme-fidelite/)
   ├─ Article : "comment lancer un programme de fidélité"
   ├─ Article : "programme de fidélité B2B vs B2C"
   ├─ Article : "10 exemples de programmes de fidélité réussis"
   ├─ Article : "ROI d'un programme de fidélité : comment le calculer"
   └─ Article : "programme de fidélité dématérialisé : avantages"
```

## Templates de livraison

Voir `references/keyword-template.md` pour le format Markdown.
Voir `references/cluster-baobab-example.md` pour un exemple complet appliqué à Baobab Loyalty.

### Format tableau recommandé

| Mot-clé | Intention | Volume estimé* | Difficulté | Page cible | Statut |
|---|---|---|---|---|---|
| programme de fidélité | Informationnelle | Élevé (5-10k) | 70/100 | /programme-fidelite/ (à créer) | À créer |
| programme fidélité B2B | Commerciale | Moyen (500-1k) | 45/100 | /b2b/ | À créer |
| baobab loyalty | Navigationnelle | Faible (<100) | 5/100 | / | OK |

\*Estimations indicatives — confirmer avec un outil de keyword research.

## Bonnes pratiques de recherche FR

- **Variations** : Google FR comprend bien les synonymes ("logiciel" ≈ "outil" ≈ "solution")
- **Pluriel/singulier** : souvent regroupés par Google, mais pas toujours — vérifier
- **Accents** : "fidelite" et "fidélité" sont traités comme la même requête
- **Abréviations sectorielles** : "SaaS B2B", "CRM", "POS" — utiles si l'audience est tech/marketers
- **Régionalisation** : pour des requêtes locales, ajouter "à Paris", "en France", "français"
- **Modificateurs commerciaux FR** : "tarif", "prix", "avis", "comparatif", "alternative", "gratuit", "essai"

## Sources de mots-clés à explorer

1. **Suggestions Google** : taper le sujet et observer la barre de suggestion (mobile + desktop)
2. **People Also Ask (PAA)** : les questions sous le 1er résultat
3. **Recherches associées** : en bas de la SERP
4. **Reddit / forums FR** (Reddit FR, forums spécialisés) : vraies questions des utilisateurs
5. **YouTube** : suggestions de la barre de recherche YouTube
6. **Concurrents** : pages bien classées + Ahrefs Site Explorer (gratuit limité)
7. **Search Console** : rapport "Performance" → mots-clés sur lesquels tu apparais déjà

## Pièges courants

- **Cibler des mots-clés trop concurrentiels** au lancement : viser la longue traîne d'abord
- **Forcer un mot-clé** sur une page qui répond à une autre intention
- **Cannibalisation** : 2 pages qui ciblent le même mot-clé se font de l'ombre. Une page = un mot-clé principal.
- **Volumes "officiels"** trompeurs : Google Keyword Planner regroupe les variantes, surévalue souvent.
- **Oublier les requêtes de marque** : "baobab loyalty avis", "baobab loyalty tarif" doivent être couvertes.

## Hypothèses pour baobabloyalty.com

Piliers probables (à valider avec l'utilisateur) :
- programme de fidélité
- carte de fidélité digitale / dématérialisée
- fidélisation client
- logiciel CRM fidélité
- marketing relationnel

Concurrents potentiels (FR) : Loyalty Builder, Adelya, Comarch Loyalty, Heyloyalty, Zerosix.

## Ressources

- `references/keyword-template.md` — template de tableau de mots-clés
- `references/cluster-baobab-example.md` — exemple complet de cluster pour Baobab Loyalty
- `references/intent-cheatsheet.md` — modificateurs FR par intention
