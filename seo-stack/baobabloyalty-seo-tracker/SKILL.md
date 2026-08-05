---
name: baobabloyalty-seo-tracker
description: Produit le RAPPORT STRATÉGIQUE MENSUEL SEO de Baobab Loyalty (1er du mois). À utiliser dès que l'utilisateur dit "rapport SEO mensuel", "bilan SEO du mois", "tracker SEO", "vs objectifs", "performance SEO", "synthèse mensuelle SEO", "monthly SEO", "OKR SEO", "KPIs SEO", "rapport direction SEO", "reporting comité de pilotage". Différent de seo-ops (hebdo tactique) — ici, vue stratégique mensuelle avec progression vs objectifs trimestriels, performance par cluster, ROI estimé, et plan du mois suivant. Idéal pour un comité ou la direction. Adapté à scheduled task le 1er de chaque mois.
---

# Baobab Loyalty — SEO Tracker (rapport stratégique mensuel)

Rapport stratégique mensuel destiné à la direction et au comité de pilotage. Question : **"Sommes-nous sur la trajectoire des objectifs SEO ?"**.

## Quand utiliser

- 1er ou 2 du mois (idéalement automatisé)
- Préparation comité mensuel / trimestriel
- Présentation de résultats à un investisseur ou board

## Inputs attendus

L'utilisateur doit fournir (ou la skill demande) :

1. **Objectifs SEO du trimestre / année** :
   - Trafic organique (sessions / mois)
   - Mots-clés top 10 cibles
   - Conversions / leads issus de l'organique
   - Position moyenne pilier
2. **Données du mois écoulé** :
   - Search Console : clics, impressions, position moyenne
   - GA4 : sessions organiques, conversions, revenu
   - Outil de suivi de positions (si abonné) : positions sur la liste de mots-clés cibles
   - Liste des contenus publiés ce mois-ci
3. **Comparatif M-1** : pour suivre la progression
4. **Comparatif Y-1** : pour neutraliser la saisonnalité

Si un MCP Search Console / GA4 / Ahrefs est disponible, utiliser. Sinon, demander un export CSV.

## Workflow

1. **Récupérer / demander les données**
2. **Calculer les KPIs** vs objectifs
3. **Analyser par cluster** : quels piliers performent ?
4. **Identifier 3 wins + 3 challenges**
5. **Proposer le plan du mois suivant** (3-5 priorités max)
6. **Formater au format exécutif**

## Format du rapport

```markdown
# Rapport SEO mensuel — Baobab Loyalty
**Mois :** [mois année]
**Préparé par :** [nom / IA]
**Date :** [date]

---

## 🎯 Synthèse exécutive (TL;DR)

[3-5 phrases qui répondent à : sommes-nous sur la trajectoire des objectifs ?
Quel est le mouvement clé du mois ? Quelle est la priorité du mois suivant ?]

**Verdict :** 🟢 Sur la trajectoire / 🟠 Légère dérive / 🔴 Hors trajectoire

---

## 📊 KPIs vs objectifs

### Trafic organique
| Métrique | Mois M | Objectif M | Δ vs M-1 | Δ vs Y-1 | Atteinte trimestre |
|---|---|---|---|---|---|
| Sessions organiques | X | Y | +Z% | +W% | A% (sur Q) |
| Pages indexées | | | | | |
| Pages avec ≥ 1 clic | | | | | |

### Visibilité
| Métrique | Mois M | Objectif M | Δ |
|---|---|---|---|
| Mots-clés en top 10 | | | |
| Mots-clés en top 3 | | | |
| Position moyenne (top 100) | | | |
| Score de visibilité (Sistrix/Ahrefs) | | | |

### Conversion
| Métrique | Mois M | Δ vs M-1 |
|---|---|---|
| Leads SEO | | |
| Demandes de démo (organique) | | |
| Inscriptions essai gratuit (organique) | | |
| Taux de conversion organique | | |

---

## 🏆 Top 3 wins du mois

1. **[Win 1]** — [Description, chiffres, pourquoi c'est important]
2. **[Win 2]**
3. **[Win 3]**

## ⚠️ Top 3 challenges

1. **[Challenge 1]** — [Description, plan d'action]
2. **[Challenge 2]**
3. **[Challenge 3]**

---

## 🌳 Performance par cluster

### Cluster 1 — Programme de fidélité
| Métrique | Valeur | Δ vs M-1 |
|---|---|---|
| Trafic | | |
| Pages dans le cluster | | |
| Position moyenne | | |
| Best performer | [URL] | |

### Cluster 2 — Carte fidélité digitale
[idem]

### Cluster 3 — Fidélisation client
[idem]

---

## 🚀 Pages publiées / refresh ce mois

| Page | Type | Date | Clics M+1* | Position cible | Status |
|---|---|---|---|---|---|
| /blog/... | Article | | | top 10 | 🟢 |
| /carte-fidelite-digitale/ | Refresh | | | top 5 | 🟠 |

*Clics M+1 = trop tôt pour conclure, mais signal initial.

---

## 📈 Mouvements notables

### Pages en forte croissance (>+20% clics)
- [URL] : +X% — [hypothèse]

### Pages en régression (>-15% clics)
- [URL] : -X% — [hypothèse + action prévue → renvoyer vers `baobabloyalty-seo-refresh`]

### Nouvelles requêtes émergentes
- "[requête]" — [X impressions, position Y, opportunité ?]

---

## 🤖 Impact AI Overviews

| Métrique | Valeur |
|---|---|
| Pages avec AI Overview détecté | X (sur top 100 mots-clés) |
| % CTR observé sur ces requêtes | Y% |
| Pages où Baobab est cité dans l'AI Overview | Z |

[Commentaire stratégique sur la défense AI]

---

## 💰 Estimation ROI du SEO

| Métrique | Valeur | Méthode |
|---|---|---|
| Sessions SEO du mois | X | GA4 |
| Coût équivalent SEA (CPC moyen × sessions) | Y € | Outil keyword |
| Leads SEO du mois | Z | GA4 + CRM |
| Pipeline généré | W € | CRM |
| ROI mensuel estimé | X% | (Pipeline - Coûts SEO) / Coûts SEO |

⚠️ ROI SEO se calcule sur 6-12 mois minimum (effet retardé). Cette ligne est indicative.

---

## 🗓 Plan du mois suivant — 5 priorités max

1. **[Priorité 1]** — Cluster : [X] — Owner : [Y] — KPI : [Z]
2. **[Priorité 2]**
3. **[Priorité 3]**
4. **[Priorité 4]**
5. **[Priorité 5]**

## 📝 Decisions à prendre / arbitrages demandés

- [ ] [Décision 1 attendue de la direction]
- [ ] [Investissement à valider]
- [ ] [Outils / freelances à recruter]

---

## 🔮 Trajectoire trimestrielle

```
Objectif Q : [X sessions / mois en fin de trimestre]
M-2 : [valeur]   ████████░░  60%
M-1 : [valeur]   ██████████  75%
M0 (mois actuel) : [valeur]   ███████████ 80%
Projection fin Q : [estimation]
```

🟢 Confiance haute / 🟠 Confiance moyenne / 🔴 Confiance basse sur l'atteinte

---

## Annexes
- Détail Search Console : [lien export]
- Détail GA4 : [lien export]
- Détail outil suivi positions : [lien export]
```

## Bonnes pratiques de reporting

- **Ne pas enterrer le verdict** : la conclusion doit être visible en 5 secondes
- **Comparer M vs M-1 ET vs Y-1** : neutralise la saisonnalité
- **Pas plus de 5 priorités** : sinon rien n'avance
- **Toujours expliquer le "pourquoi"** : un chiffre sans contexte est inutile
- **Visualiser la trajectoire trimestrielle** : graphique mental immédiat

## Saisonnalité Baobab Loyalty (à ajuster avec les données réelles)

Hypothèses pour un SaaS B2B FR de fidélisation :
- **Septembre** : pic d'intentionnalité (rentrée pro, projets H2)
- **Janvier** : pic d'intentionnalité (budgets nouveaux, plan annuel)
- **Avril-Juin** : creux relatif (pré-vacances)
- **Août** : creux fort (vacances FR)
- **Q4** : selon secteurs, pic e-commerce / retail

Toujours ajuster les comparaisons M-1 par la saisonnalité.

## Pièges courants

- **Tout reporter** : 30 KPIs = personne ne lit. Rester sur les 5-10 KPIs clés.
- **Cacher les mauvaises nouvelles** : la direction repèrera, mieux vaut être proactif sur les challenges.
- **Pas de plan du mois suivant** : un rapport sans suite = un rapport mort.
- **ROI overclaimé** : SEO génère sur 6-12 mois, attribuer 100% du chiffre au mois courant fausse tout.
- **Ignorer la concurrence** : un mois où Baobab gagne 10% mais où le secteur gagne 30%, on perd des parts.

## Automatisation

Excellent candidat pour scheduled task :
- **Fréquence :** 1er du mois (J+1 si week-end)
- **Trigger :** lecture des données via MCP Search Console + GA4
- **Output :** rapport markdown envoyé par email aux parties prenantes + sauvegarde dans Notion / Drive

## Skills compagnons

- **baobabloyalty-seo-ops** — vue tactique hebdo (vs vue stratégique mensuelle ici)
- **baobabloyalty-seo-refresh** — pour les pages en régression identifiées
- **seo-keywords** — pour les nouvelles opportunités émergentes
