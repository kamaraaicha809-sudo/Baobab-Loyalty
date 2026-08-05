---
name: seo-content
description: Optimise un contenu rédactionnel pour le SEO — structure (H1/H2/H3), densité de mots-clés, lisibilité, maillage interne, intention satisfaite. À utiliser dès que l'utilisateur dit "rédige un article SEO", "optimise mon article", "améliorer mon contenu", "brief rédactionnel SEO", "structure d'article", "titre H1", "balises Hn", "ancres de liens", "lisibilité Flesch", "contenu pour Google", "réécrire pour le SEO". Déclenche aussi sur "comment écrire un article qui ranke", "améliorer ma page tarifs", "réécriture SEO", "audit éditorial". Travaille en français pour le marché FR. Adapté à baobabloyalty.com.
---

# SEO Content Optimization

Optimise un contenu rédactionnel pour le SEO sans sacrifier la qualité de lecture. S'utilise pour rédiger un nouvel article, optimiser un existant, ou produire un brief rédactionnel détaillé.

## Quand utiliser

- Rédiger un nouvel article de blog ou page de contenu
- Optimiser un article existant qui ne ranke pas
- Produire un brief pour un rédacteur externe
- Auditer une page de contenu (structure, ton, intention)
- Réécrire une page produit / landing pour qu'elle se positionne sur ses mots-clés

## Workflow

1. **Cadrer le sujet** :
   - Mot-clé principal (1)
   - Mots-clés secondaires (3-5)
   - Intention de recherche (info / com / trx)
   - Audience cible
2. **Analyser la SERP** (si possible) : que font les 5 premiers résultats ?
3. **Construire le plan** : H1, H2, H3 avec les mots-clés intégrés naturellement
4. **Rédiger ou réviser** en suivant les règles ci-dessous
5. **Vérifier** avec la checklist (références/checklist-content.md)

## Règles de structure

### H1 — un seul, contient le mot-clé principal
- 50-70 caractères idéalement
- Contient le mot-clé principal en début ou milieu
- Doit être différent du `<title>` (qui peut être plus court / commercial)

### H2 — entre 4 et 8 sur un article long
- Chaque H2 répond à une sous-question implicite du lecteur
- Inclure des variations / synonymes du mot-clé principal
- Pas de H2 vide (au moins 2-3 paragraphes ensuite)

### H3 — utilisés si un H2 doit être subdivisé
- Pas plus de 3-4 H3 par H2 (sinon créer un nouveau H2)
- Hiérarchie strictement respectée (jamais sauter de H2 à H4)

### Paragraphes
- 2-4 phrases par paragraphe (lisibilité web)
- Phrases courtes : 15-20 mots en moyenne
- Première phrase = la plus importante (mode "lecture en F")

## Densité et présence de mots-clés

Oubliez la "densité de mots-clés" comme métrique magique. Ce qui compte :

1. **Le mot-clé principal apparaît** :
   - Dans le `<title>` (en début si possible)
   - Dans la meta description
   - Dans le `<h1>`
   - Dans le premier paragraphe (idéalement les 100 premiers mots)
   - Dans au moins un `<h2>`
   - Dans la conclusion / dernier paragraphe
   - Dans l'URL (slug)
   - Dans l'`alt` d'au moins une image

2. **Les variations sémantiques** sont présentes naturellement (synonymes, termes liés). Google comprend aujourd'hui le contexte sémantique (modèle BERT, MUM…). Forcer 8 fois "programme de fidélité" est moins efficace qu'avoir 3 fois "programme de fidélité" + "carte fidélité" + "fidélisation client" + "récompenses clients".

3. **Pas de bourrage** : si le mot-clé apparaît plus de 1-2% du texte, c'est trop.

## Lisibilité

Indicateurs cibles pour le marché FR (équivalent Flesch français) :
- **Phrases** : 15-20 mots en moyenne
- **Mots** : majorité < 3 syllabes
- **Voix active** : > 80% des phrases
- **Connecteurs logiques** : "ainsi", "en revanche", "par ailleurs", "concrètement"…
- **Tu / Vous** : choisir et garder le même ton sur tout le site

Un contenu lisible = plus de temps passé = meilleur signal pour Google.

## Longueur de contenu — pas une fin en soi

Mythe : "il faut 1500 mots pour ranker". Réalité : la longueur dépend de l'intention.

| Type de page | Longueur indicative |
|---|---|
| Page produit / pricing | 400-800 mots |
| Définition (glossaire) | 300-600 mots |
| Article informationnel | 1200-2000 mots |
| Guide complet / pilier | 2000-4000 mots |
| Comparatif | 1500-2500 mots |

L'objectif est de répondre à l'intention **mieux** que la SERP actuelle, pas d'écrire long pour écrire long.

## Maillage interne

Sur un article de 1500 mots, viser :
- **3-5 liens internes** vers des pages liées (autres articles, page pilier, page produit pertinente)
- **1-3 liens externes** vers des sources d'autorité (études, sites officiels)
- **Ancres descriptives** : "guide complet sur la fidélisation B2B", pas "cliquez ici"
- **Pas plus de 100 liens sortants** par page (limite Google)

## Page produit / landing — spécificités

Pour une page de conversion, l'équilibre SEO ↔ UX est critique :
- Texte SEO bas de page (sous le CTA principal) si pas place "above the fold"
- FAQ longue en bas = bon levier mots-clés sans nuire à l'UX
- Témoignages clients = signal E-E-A-T pour Google
- Section "Cas d'usage" / "Pour qui" = entrée pour requêtes longue traîne

## E-E-A-T (Experience, Expertise, Authoritativeness, Trust)

Critères de qualité utilisés par les Quality Raters Google. Particulièrement important pour YMYL (Your Money Your Life) — finance, santé. Les leviers en B2B SaaS :
- **Experience** : étude de cas chiffrée, retour terrain
- **Expertise** : auteur identifié avec biographie + photo
- **Authoritativeness** : citations externes, presse, partenaires
- **Trust** : mentions légales claires, RGPD, certifications, pas de fautes

Sur baobabloyalty.com, mettre en avant :
- Logos clients (preuves)
- Chiffres concrets (X% de rétention chez Y)
- Auteurs avec biographie
- Mentions presse / podcasts si possible

## Templates de structure

Voir `references/templates-structure.md` :
- Article informationnel "comment X"
- Guide pilier
- Comparatif "X vs Y"
- Page produit / landing
- Étude de cas
- Page tarifs

## Brief rédactionnel — format

Quand l'utilisateur veut un brief pour un rédacteur, livrer :

```markdown
# Brief — [Titre provisoire]

## Sujet
[Sujet en une phrase]

## Mot-clé principal
[mot-clé] — Volume estimé : X — Difficulté : Y

## Mots-clés secondaires
- ...

## Intention de recherche
[INFO / COM / TRX] — explication

## Audience cible
[Persona en 2-3 phrases]

## Angle proposé
[Pourquoi cet article et qu'apporte-t-il que la SERP n'a pas]

## Plan détaillé
- H1 : [titre]
- H2 : [titre]
  - H3 : ...
- H2 : ...
...

## Longueur cible
[X-Y mots]

## Ton et style
[Tutoiement/vouvoiement, formel/casual, exemples chiffrés ou non…]

## À inclure obligatoirement
- [ ] Données chiffrées : ...
- [ ] Témoignage / cas client
- [ ] Lien interne vers : `/programme-fidelite/`, `/blog/...`
- [ ] CTA final : démarrer essai gratuit

## À éviter
- ...

## SEO checklist
[Voir checklist-content.md]
```

## Pièges courants

- **Optimiser uniquement pour Google** : un texte qui ne plaît pas aux humains finit par perdre en SEO (taux de rebond élevé, pas de partages).
- **Cannibalisation** : 2 articles qui ciblent le même mot-clé. Choisir un et désindexer / fusionner l'autre.
- **Article sans CTA** : même un article info doit guider vers une suite (autre lecture, démo, newsletter).
- **Images sans `alt`** : opportunité ratée d'inclure le mot-clé.
- **Date de publication** : afficher et mettre à jour la "date de dernière modification" — Google adore le contenu frais.

## Ressources

- `references/checklist-content.md` — checklist complète à utiliser avant publication
- `references/templates-structure.md` — squelettes de plans par type de page
- `references/style-guide-fr.md` — guide stylistique FR (typographie, ponctuation)
