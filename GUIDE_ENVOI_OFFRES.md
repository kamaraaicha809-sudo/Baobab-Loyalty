# 📧 Guide : Envoyer une offre aux clients

Pour tester et vérifier que votre application peut envoyer des offres aux clients, suivez ces étapes.

---

## ✅ Test rapide (mode démo)

1. Lancez l'application : `npm run dev`
2. Connectez-vous (mode démo)
3. Allez sur le Dashboard
4. Cliquez sur **« Envoyer une offre par email »** ou **« Envoyer une offre par WhatsApp »**
5. Remplissez le formulaire et cliquez sur **Envoyer**

→ En mode démo, un message de confirmation s'affiche. Aucun email/WhatsApp réel n'est envoyé.

---

## 📧 Pour envoyer de VRAIS emails

### Étape 1 : Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Dans **API Keys**, créez une clé (commence par `re_`)
4. Vérifiez un domaine (ou utilisez `onboarding@resend.dev` pour les tests)

### Étape 2 : Configurer Supabase

1. **Dashboard Supabase** → **Project Settings** → **Vault**
2. Ajoutez ces secrets :
   - `RESEND_API_KEY` : votre clé Resend (ex : `re_xxxx`)
   - `SUPABASE_SERVICE_ROLE_KEY` : si pas déjà fait (Settings > API > service_role)
   - `EMAIL_FROM` : l'email d'envoi (ex : `Baobab Loyalty <noreply@votre-domaine.com>`)

### Étape 3 : Déployer l'Edge Function

Exécutez dans le SQL Editor Supabase le fichier `supabase/TOUT_CONFIGURER.sql` si ce n'est pas déjà fait.

Puis déployez la fonction `email-send` :

```bash
supabase functions deploy email-send
```

Ou via Cursor : *« Déploie l'Edge Function email-send »*

### Étape 4 : Être administrateur

L'envoi d'emails nécessite le rôle **admin**. En base de données :

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'votre-email@exemple.com';
```

### Étape 5 : Désactiver le mode démo

Dans `.env.local` :

```
NEXT_PUBLIC_DEMO_MODE=false
```

### Étape 6 : Tester

1. Connectez-vous avec un compte admin
2. Dashboard → **Envoyer une offre par email**
3. Sujet : "Test offre"
4. Message : "Voici une offre spéciale !"
5. Destinataires : **votre propre email**
6. Cliquez sur **Envoyer**

→ Vérifiez votre boîte mail (et les spams).

---

## 📱 Pour envoyer par WhatsApp (à venir)

L'intégration WhatsApp nécessite :

1. **WhatsApp Business API** (via Meta / fournisseur agréé)
2. Une **Edge Function** dédiée qui appelle l'API WhatsApp
3. Une base de contacts avec numéros de téléphone

Cette fonctionnalité sera à développer selon vos besoins (Twilio, MessageBird, etc.).

---

## 📋 Checklist de vérification

| Étape | Email | WhatsApp |
|-------|-------|----------|
| Compte créé (Resend / WhatsApp Business) | ☐ | ☐ |
| Secrets configurés dans Supabase Vault | ☐ | — |
| Edge Function déployée | ☐ | — |
| Utilisateur admin | ☐ | ☐ |
| Mode démo désactivé | ☐ | ☐ |
| Test d'envoi réussi | ☐ | — |

---

## ❓ En cas de problème

- **"Email service not configured"** → Vérifiez `RESEND_API_KEY` dans le Vault Supabase
- **"Admin or service role access required"** → Votre profil n'a pas le rôle admin
- **L'email n'arrive pas** → Vérifiez les spams, le domaine Resend, et `EMAIL_FROM`
