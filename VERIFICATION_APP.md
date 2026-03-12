# ✅ Vérification de l'application Baobab Loyalty

Suivez ces étapes pour vérifier que tout fonctionne.

---

## 📍 Où trouver le bouton Dashboard ?

- **Sur ordinateur** : le lien **Dashboard** est dans la barre de navigation à gauche de l'écran.
- **Sur mobile** : appuyez sur l’icône **☰** (en haut à gauche) pour ouvrir le menu, puis cliquez sur **Dashboard**.

---

## 🧪 Checklist de vérification

### 1. Page d'accueil (Landing)
- [ ] Ouvrir http://localhost:3000
- [ ] La page d'accueil s'affiche avec le header et le hero
- [ ] Les boutons "Connexion" et "Commencer" sont visibles

### 2. Authentification
- [ ] Cliquer sur **Connexion**
- [ ] Vous êtes redirigé vers la page de connexion
- [ ] En mode démo : vous pouvez vous connecter avec les données fictives

### 3. Dashboard
- [ ] Après connexion, vous arrivez sur le **Dashboard**
- [ ] La section **"Mon compte"** affiche l'email (demo@kodefast.dev en mode démo)
- [ ] Le **Plan actuel** affiche "Actif"
- [ ] Le bouton **"Gérer mon abonnement"** est visible (en mode démo, une alerte s'affiche au clic)

### 4. Navigation dans le menu
- [ ] Dans la sidebar (ou le menu mobile), cliquer sur **Dashboard** → vous restez sur le Dashboard
- [ ] Si vous êtes admin : la section **Administration** est visible
- [ ] Cliquer sur **Vue d'ensemble** → page Admin
- [ ] Cliquer sur **Configuration IA** → page Admin IA
- [ ] Cliquer sur **Déconnexion** → retour à la page d'accueil

### 5. Résumé
Si toutes les cases sont cochées, votre application fonctionne correctement.

---

## ⚠️ En cas de problème

| Problème | Solution |
|----------|----------|
| La sidebar ne s'affiche pas | Vérifier que vous êtes connecté et sur /dashboard ou /admin |
| Le menu ne s'ouvre pas sur mobile | Toucher l'icône ☰ en haut à gauche |
| "Gérer mon abonnement" affiche une alerte | Normal en mode démo — Stripe n'est pas configuré |
| Erreur de chargement | Vérifier que `npm run dev` tourne et que .env.local est correct |
