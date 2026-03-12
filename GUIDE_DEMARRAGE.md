# 🚀 Guide de démarrage - Baobab Loyalty

Suivez ces étapes **dans l'ordre** pour faire fonctionner votre application.

---

## Option A : Mode démo (rapide, pas de configuration)

**Votre fichier `.env.local` a déjà `NEXT_PUBLIC_DEMO_MODE=true`** ✅

1. Ouvrez un terminal dans le projet
2. Tapez : `npm run dev`
3. Ouvrez votre navigateur sur : **http://localhost:3000**

L'application fonctionne avec des données fictives. Aucune configuration Supabase nécessaire.

---

## Option B : Avec Supabase (données réelles)

### Étape 1 : Exécuter le SQL dans Supabase

1. Allez sur **https://supabase.com** et connectez-vous
2. Ouvrez votre projet **Baobab Loyalty** (ou celui avec l'URL `qrvaobppumaovovdcjkv.supabase.co`)
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New query**
5. Ouvrez le fichier `supabase/TOUT_CONFIGURER.sql` dans votre projet
6. **Copiez tout le contenu** de ce fichier
7. **Collez-le** dans l'éditeur SQL Supabase
8. Cliquez sur **Run** (ou Ctrl+Entrée)

✅ Si tout est vert, c'est bon !

---

### Étape 2 : Mettre le mode démo à false

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Changez cette ligne :
   ```
   NEXT_PUBLIC_DEMO_MODE=false
   ```
3. Sauvegardez le fichier

---

### Étape 3 : Lancer l'application

1. Dans le terminal, tapez : `npm run dev`
2. Ouvrez **http://localhost:3000** dans votre navigateur

---

## Besoin d'aide ?

- **L'app ne s'ouvre pas ?** Vérifiez que `npm run dev` tourne sans erreur
- **Erreur Supabase ?** Vérifiez que les clés dans `.env.local` correspondent à votre projet Supabase (Dashboard > Settings > API)
- **Vous voulez revenir au mode démo ?** Remettez `NEXT_PUBLIC_DEMO_MODE=true` dans `.env.local`
