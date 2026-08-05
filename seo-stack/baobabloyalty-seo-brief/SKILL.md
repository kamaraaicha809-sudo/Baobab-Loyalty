---
name: baobabloyalty-seo-brief
description: Produit un brief rédactionnel pour une OPPORTUNITÉ SEO HORS-PLAN éditorial. À utiliser dès que l'utilisateur dit "brief sur X", "opportunité SEO", "écris un brief", "il y a un sujet d'actu sur X", "concurrent fait du bruit sur X", "tendance Google", "trending keyword", "on devrait écrire sur X", "topic émergent", "fais un brief express". Différent de seo-writer (qui rédige) et de seo-content (générique) — ici on prépare un dossier prêt à être confié à un rédacteur (interne ou freelance) pour saisir une fenêtre de tir sur un sujet hors calendrier prévu.
---

# Baobab Loyalty — SEO Brief (opportunités hors-plan)

Construit un brief rédactionnel complet pour saisir une **opportunité SEO non prévue** : actualité du marché, tendance Google émergente, gap concurrentiel, lancement Baobab à supporter, requête en croissance dans Search Console.

## Quand utiliser

- "Trending : tout le monde parle de X — écris un brief"
- "Concurrent vient de publier sur Y, on doit répondre"
- "Notre lancement de [feature] mérite un article SEO de support"
- "Search Console montre des impressions sur 'Z' — saisir l'opportunité"

## Différence avec les autres skills

| Skill | Quand | Sortie |
|---|---|---|
| `seo-writer` | Rédiger un article du calendrier | Article publiable |
| `seo-brief` (celui-ci) | Cadrer un sujet hors-plan | Document de cadrage |
| `seo-content` (générique) | Règles de rédaction | Reference |
| `seo-keywords` | Stratégie globale | Cluster |

Ce skill produit un **brief**, pas un article. L'article peut ensuite être rédigé via `baobabloyalty-seo-writer` ou par un freelance sur la base du brief.

## Workflow

1. **Identifier la nature de l'opportunité** :
   - Tendance Google (Google Trends, X / LinkedIn)
   - Actualité sectorielle (changement réglementaire, étude qui sort, événement)
   - Gap concurrentiel (concurrent qui ranke sur quelque chose qu'on devrait avoir)
   - Lancement Baobab (nouvelle feature, partenariat)
   - Requête émergente Search Console
2. **Estimer la fenêtre de tir** :
   - 24h (réaction à chaud) → format court / réactif
   - 7 jours (réponse argumentée) → article de fond
   - 30 jours (analyse à froid) → guide complet
3. **Cadrer l'angle** : pourquoi Baobab a quelque chose d'unique à dire sur ce sujet ?
4. **Rédiger le brief** au format ci-dessous
5. **Identifier le rédacteur** : interne ? freelance ? IA assistée via `seo-writer` ?

## Format du brief

```markdown
# BRIEF SEO — [Titre provisoire]

## Contexte de l'opportunité
**Type :** Tendance / Actualité / Gap concurrentiel / Lancement / Requête émergente
**Source :** [URL ou description du déclencheur]
**Fenêtre de tir :** 24h / 7 jours / 30 jours
**Date de capture :** [aujourd'hui]
**Date de publication cible :** [date]

## Pourquoi ça vaut le coup pour Baobab
[2-3 phrases — mettre en lien avec notre positionnement, audience, expertise]

## Angle différenciant
[Qu'est-ce que Baobab peut dire que personne d'autre ne dit ?
Données internes ? Vision contraire ? Expérience terrain ?]

## Recherche de mots-clés

| Mot-clé | Volume estimé | Intention | Difficulté |
|---|---|---|---|
| [principal] | | | |
| [secondaire 1] | | | |
| [secondaire 2] | | | |

**Requêtes "People Also Ask" à couvrir :**
- ?
- ?

## Audience cible
[Qui doit lire cet article ? Persona en 2-3 phrases]

## Plan détaillé

**H1 :** [titre — 50-70 car., contient le mot-clé principal]

**Hook (3-5 phrases) :** [accroche, idéalement avec un chiffre ou une stat fraîche]

**TL;DR :** [résumé en 2-3 phrases pour les pressés et l'AI Overview]

**H2 — [titre]**
- [point 1]
- [point 2]

**H2 — [titre]**
- ...

**H2 — [titre]**
- ...

**FAQ (4-6 questions) :**
- ?
- ?

**CTA :** [démo / essai gratuit / autre]

## Longueur cible
[X mots]

## Ton
[Tutoiement / vouvoiement, formel / casual, expertise vs accessible]

## Sources & données à intégrer obligatoirement

### Sources externes
- [Source 1 — URL — citation à intégrer]
- [Source 2]

### Données Baobab (différenciation)
- [Chiffre client / étude maison / témoignage]
- [Comparaison vs solutions concurrentes]

## Maillage interne
- Lien vers : `/programme-fidelite/` (page pilier)
- Lien vers : `/blog/[article-lié]`
- Lien vers : `/tarifs/` (CTA)

## Maillage externe
- Lien vers : [source d'autorité]
- Lien vers : [étude]

## Données structurées requises
- JSON-LD `Article`
- JSON-LD `BreadcrumbList`
- (optionnel) `FAQPage` si la FAQ est détaillée
- (optionnel) `HowTo` si format tutoriel

## Image de couverture
**Concept :** [description visuelle]
**Format :** 1200×630 (OG) + 1600×900 (cover article)
**À déléguer à :** [designer / Midjourney / Banque d'images]

## SEO checklist
- [ ] Mot-clé principal dans H1, meta, premier paragraphe, URL
- [ ] 4-7 H2
- [ ] 3-5 liens internes
- [ ] 1-3 liens externes d'autorité
- [ ] FAQ
- [ ] JSON-LD Article + Breadcrumb
- [ ] Image OG 1200×630
- [ ] Auteur identifié
- [ ] CTA cohérent
- [ ] Date publication + dateModified

## Rédaction
**Rédacteur assigné :** [nom interne / freelance / IA via baobabloyalty-seo-writer]
**Deadline rédaction :** [date]
**Deadline review :** [date]
**Deadline publication :** [date]

## Métriques de succès (à 30 jours)
- Position cible sur "[mot-clé principal]" : top 10
- Impressions/mois cible : [X]
- Clics/mois cible : [Y]
- Conversions cible : [Z]

## Notes pour le rédacteur
[Toutes les nuances importantes : à ne pas dire, à ne pas oublier,
références internes Baobab à intégrer, ton de voix particulier…]
```

## Critères pour valider une opportunité

Avant de produire un brief, vérifier :

- [ ] **Pertinent pour notre audience** : pas juste tendance, mais lié à nos enjeux
- [ ] **Réalisable dans la fenêtre** : on a les ressources rédactionnelles ?
- [ ] **Différenciant** : on a un angle unique, sinon rang à rame
- [ ] **Cohérent avec le positionnement** : on ne dilue pas la marque
- [ ] **Mesurable** : on saura si ça a marché

Si une seule case n'est pas cochée → reporter ou abandonner.

## Pièges courants

- **Réagir trop tard** : un sujet d'actu publié J+5 a souvent perdu son intérêt
- **Forcer la connexion** : si le lien avec Baobab est trop tiré par les cheveux, l'article sera mauvais
- **Imiter sans angle** : republier ce que les concurrents disent ne fait que les renforcer
- **Briefer sans intention** : un article doit toujours servir une intention business (acquisition, autorité, défense)

## Skills compagnons

- **baobabloyalty-seo-writer** — rédiger l'article à partir du brief
- **seo-keywords** — pour vérifier les mots-clés et le potentiel
- **baobabloyalty-seo-ops** — pour repérer les opportunités émergentes
