---
name: landing
description: Optimise le copywriting de la landing page Baobab Loyalty section par section, en partant du résultat client plutôt que des fonctionnalités techniques.
---

# Skill : Optimisation copywriting landing page

## Objectif

Réécrire le copywriting de la landing page (`components/landing/*.tsx`) pour qu'il parle
toujours du RÉSULTAT obtenu par l'hôtelier, jamais des fonctionnalités techniques brutes.

## Règle clé

Toujours parler du résultat, jamais des fonctionnalités techniques.

- MAUVAIS : "Segmentation automatique des clients par IA"
- BON : "Tu sais exactement qui relancer, sans y passer ta soirée"

## Processus

1. Pose 8 questions (une à la fois ou groupées) sur :
   - Le problème principal vécu par la cible avant d'utiliser le produit
   - Qui est la cible précise (taille d'hôtel, pays, profil du décideur)
   - Le résultat concret obtenu après utilisation (chiffre, %, délai)
   - Ce qui différencie le produit de la concurrence ou du statu quo
   - Les preuves sociales disponibles (témoignages réels, chiffres vérifiés, hôtels pilotes)
   - L'objection principale des prospects (prix, complexité, confiance, technique)
   - Le ton souhaité (professionnel/sérieux vs chaleureux/proche)
   - L'action prioritaire attendue du visiteur (essai gratuit, démo, inscription directe)

2. Analyse la landing page actuelle dans le code (`components/landing/*.tsx`, `config.js` pour les prix).

3. Sur base des réponses, propose en mode plan (sans modifier le code) le copywriting complet pour :
   - Hero : titre, sous-titre, texte du CTA
   - Problème : titre de section, texte, conséquences chiffrées
   - Solution : titre de section, texte, description du résultat
   - Fonctionnalités : titre + description de chaque feature, formulées en résultat
   - Témoignages : citations formatées (vraies si disponibles, sinon clairement marquées temporaires)
   - Pricing : vérifier que les prix et noms de plans correspondent à `config.js`, mettre en évidence la formule intermédiaire (plan recommandé)
   - FAQ : 5 questions/réponses qui lèvent les objections réelles
   - CTA final : texte + bouton

4. Attends la validation explicite de l'utilisateur. Il peut ajuster chaque section une par une.

5. Une fois validé, applique le copywriting dans le code des composants `components/landing/*.tsx` correspondants.

6. Lance `npm run build` pour vérifier que rien n'est cassé.

## Points d'attention Kodefast

- Prix toujours en FCFA, cohérents avec `config.js` (`billing.plans`)
- Ne jamais inventer de témoignages présentés comme réels sans que l'utilisateur les valide comme vrais
- Respecter le mode démo (aucun changement de copy ne doit casser `config.isDemoMode`)
- Le style narratif actuel du site tutoie l'hôtelier ("tu") — rester cohérent avec ce choix sauf demande contraire
