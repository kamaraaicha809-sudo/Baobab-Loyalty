---
name: baobabloyalty-seo-ops
description: Produit le rapport SEO tactique HEBDOMADAIRE de Baobab Loyalty. À utiliser tous les lundis matin (ou quand l'utilisateur dit "rapport SEO de la semaine", "ops SEO", "to-do SEO", "SEO ops weekly", "actions SEO de cette semaine", "que faire en SEO cette semaine", "rapport hebdo SEO", "weekly SEO"). Déclenche aussi sur "alertes Search Console", "régressions SEO", "quick wins SEO". Produit un rapport markdown structuré avec : alertes prioritaires, gagnants/perdants, top 5 actions de la semaine, suivi des actions précédentes. Idéal pour automatisation via une scheduled task hebdomadaire.
---

# Baobab Loyalty — SEO Ops (rapport hebdomadaire)

Rapport tactique hebdomadaire qui répond à une seule question : **"Que faut-il faire en SEO cette semaine ?"**.

## Quand utiliser

- Tous les lundis matin (idéalement automatisé via une scheduled task)
- À la demande : "rapport SEO de la semaine", "ops SEO"
- En revue d'équipe SEO hebdomadaire

## Inputs attendus

L'utilisateur doit fournir (ou le skill demande) :

1. **Données Search Console** (export CSV ou copie d'écran) :
   - Pages ayant gagné / perdu en clics sur les 7 derniers jours
   - Requêtes nouvelles ou émergentes
   - Erreurs d'indexation
2. **Core Web Vitals** récents (PageSpeed Insights ou Vercel Speed Insights)
3. **Statut des actions de la semaine précédente** (si dispo)
4. **Plan SEO actuel** (cluster en cours, articles prévus)

Si certaines données manquent, demander à l'utilisateur de coller les exports ou de connecter les outils nécessaires (suggérer un MCP Search Console, GA4 ou équivalent via `search_mcp_registry`).

## Workflow

1. **Collecter les inputs** (ou demander les exports)
2. **Détecter les anomalies** :
   - Page qui chute de > 20% en clics → 🔴 alerte
   - Page qui gagne en impressions sans gagner en clics → 🟠 opportunité (CTR à optimiser)
   - Requête en page 2 (positions 11-20) avec impressions → 🟢 quick win possible
3. **Vérifier les CWV** : LCP > 2,5 s, INP > 200 ms, CLS > 0,1 = signaux à corriger
4. **Croiser avec le plan** : où en est le calendrier éditorial ?
5. **Rédiger le rapport** au format ci-dessous
6. **Limiter à 5 actions concrètes** (pas plus)

## Format du rapport — toujours suivre cette structure

```markdown
# Rapport SEO hebdo — Baobab Loyalty
**Semaine du :** [lundi-dimanche]
**Période analysée :** [7 jours glissants]
**Status global :** 🟢 / 🟠 / 🔴

---

## 🚨 Alertes (critiques, à traiter cette semaine)
- [ ] [Description] — [Page concernée] — [Impact estimé]

## 📉 Pages en régression
| Page | Δ Clics | Δ Position | Cause probable | Action |
|---|---|---|---|---|
| /tarifs | -32% | -3,2 | … | … |

## 📈 Pages en croissance
| Page | Δ Clics | Δ Position | Pourquoi | À renforcer ? |
|---|---|---|---|---|

## 💡 Opportunités quick wins
Requêtes en positions 11-20 avec impressions (≈ travail léger pour gagner en clics) :
- "[requête]" — page : [url] — position [X] → optimisation suggérée

## 🛠 Core Web Vitals — pages à corriger
| Page | LCP | INP | CLS | Priorité |
|---|---|---|---|---|

## ✅ Top 5 actions de la semaine
*Pas plus de 5. Si plus de 5, prioriser ou décaler.*

1. **[Action]** — Owner : [nom] — Effort : [S/M/L] — Impact : [⭐/⭐⭐/⭐⭐⭐]
2. ...

## 📋 Suivi des actions de la semaine dernière
- ✅ [Action terminée]
- 🟡 [Action en cours]
- 🔴 [Action non démarrée — pourquoi ?]

## 📅 Plan de la semaine (extrait du calendrier éditorial)
- Article à publier : [titre] — [jour]
- Page à mettre à jour : ...
```

## Règles de priorisation

Quand il y a plus de 5 actions possibles, classer par :
1. **Bloquant** (404, noindex accidentel, baisse > 30%) → traiter immédiatement
2. **Quick win** (effort faible, impact moyen-fort) → traiter cette semaine
3. **Investissement** (effort élevé, impact fort) → planifier sur 2-4 semaines
4. **Maintenance** (effort faible, impact faible) → backlog

## Pièges à éviter

- **Surinterpréter une seule semaine** : les variations < 10% sont du bruit. Croiser avec la tendance 28 jours.
- **Ignorer la saisonnalité** : Noël, soldes, vacances scolaires impactent fort le trafic.
- **Tout marquer comme prioritaire** : si tout est urgent, rien ne l'est. Maximum 5 actions/semaine.
- **Ne pas suivre la semaine d'avant** : sans suivi, les actions s'accumulent et rien n'avance.

## Automatisation suggérée

Ce skill est un excellent candidat pour une scheduled task Cowork :
- **Fréquence** : tous les lundis 8h
- **Action** : générer le rapport, l'envoyer par email à l'équipe SEO, créer un Notion / Asana avec les 5 actions

Pour mettre en place : utiliser le skill `schedule` ou demander "planifie un rapport SEO ops hebdo tous les lundis 8h".

## Sources de données suggérées

- **Google Search Console** (gratuit, indispensable) — via MCP si dispo
- **Google Analytics 4** — via MCP si dispo
- **PageSpeed Insights API** — gratuit, données réelles
- **Ahrefs / SEMrush / Sistrix** — si abonnement
- **Notion / Linear / Asana** — pour le tracking des actions
