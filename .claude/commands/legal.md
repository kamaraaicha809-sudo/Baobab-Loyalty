# Commande /legal

Génère les pages légales complètes pour Baobab Loyalty.

## Workflow

1. **Lire le skill** : Charger `.claude/skills/legal.md` pour suivre le processus
2. **Poser les 7 questions** : Ne pas générer le contenu avant d'avoir toutes les réponses
3. **Proposer le contenu** en mode plan (résumé de chaque page) avant de créer les fichiers
4. **Attendre validation** de l'utilisateur sur le plan
5. **Créer les pages** dans `app/legal/` (layout + 5 pages)
6. **Mettre à jour le footer** pour inclure les liens légaux
7. **Créer la bannière cookies** dans `components/common/CookieBanner.tsx`

## Règle absolue

Ne jamais sauter les 7 questions. Un contenu légal sans les vraies informations de l'entreprise est inutilisable.
