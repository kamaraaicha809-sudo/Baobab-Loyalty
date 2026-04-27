# Guide WhatsApp Business API — Pour les Hôteliers Baobab Loyalty

**Temps estimé : 30 à 60 minutes**
**Niveau : Débutant — aucune connaissance technique requise**

---

## Avant de commencer

Vous aurez besoin de :

- Un compte Facebook personnel (si vous n'en avez pas, créez-en un sur facebook.com)
- Un numéro de téléphone qui ne soit PAS déjà utilisé sur WhatsApp (ce sera le numéro de votre hôtel)
- Un ordinateur (pas un téléphone) pour suivre ces étapes

---

## ETAPE 1 — Créer votre compte Meta for Developers

1. Ouvrez votre navigateur et allez sur : **developers.facebook.com**

2. Cliquez sur **"Se connecter"** en haut à droite

3. Connectez-vous avec votre compte Facebook personnel

4. Si c'est votre première fois, acceptez les conditions d'utilisation de Meta for Developers

Vous êtes maintenant sur le tableau de bord des développeurs Meta.

---

## ETAPE 2 — Créer votre application Meta

1. Cliquez sur le bouton **"Créer une application"** (ou "Create app")

2. On vous demande le type d'application. Choisissez :
   **"Autre"** puis cliquez sur **"Suivant"**

3. Remplissez le formulaire :
   - **Nom de l'application** : tapez le nom de votre hôtel (ex: "Hotel Ivoire WhatsApp")
   - **Email de contact** : votre email professionnel
   - **Compte Business** : si vous en avez un, sélectionnez-le. Sinon laissez vide pour l'instant

4. Cliquez sur **"Créer une application"**

   Meta peut vous demander votre mot de passe Facebook pour confirmer. Entrez-le.

Votre application est créée. Vous êtes maintenant dans le tableau de bord de votre application.

---

## ETAPE 3 — Ajouter WhatsApp à votre application

1. Dans le tableau de bord de votre application, vous voyez une liste de produits disponibles

2. Cherchez **"WhatsApp"** dans la liste

3. Cliquez sur **"Configurer"** (ou "Set up") à côté de WhatsApp

4. On vous demande de créer ou sélectionner un compte Business :
   - Si vous avez déjà un compte Meta Business : sélectionnez-le
   - Sinon : cliquez sur **"Créer un nouveau compte Business"**, entrez le nom de votre hôtel, et confirmez

5. Cliquez sur **"Continuer"**

WhatsApp est maintenant ajouté à votre application.

---

## ETAPE 4 — Récupérer votre numéro de test et vos clés API

Après avoir configuré WhatsApp, vous êtes redirigé vers la page **"Démarrage rapide"** de WhatsApp.

**Vous allez voir deux informations très importantes. Notez-les bien.**

### Trouver le Phone Number ID

1. Sur la page de démarrage rapide WhatsApp, cherchez la section **"Envoyer et recevoir des messages"**

2. Vous voyez un menu déroulant **"De"** avec un numéro de téléphone (c'est le numéro de test Meta)

3. Juste en dessous ou à côté, il y a un **"Phone Number ID"** — c'est un long numéro (exemple : `123456789012345`)

4. Copiez ce numéro et gardez-le. C'est votre **WHATSAPP_PHONE_NUMBER_ID**

### Trouver l'Access Token

1. Sur la même page, cherchez la section **"Access Token"**

2. Vous voyez un long code qui commence par **"EAA..."**

3. Cliquez sur **"Copier"** pour copier ce code

4. Gardez-le précieusement. C'est votre **WHATSAPP_ACCESS_TOKEN**

   **Attention** : Ce token temporaire expire au bout de 24 heures. Pour un usage permanent, voir l'Étape 6.

---

## ETAPE 5 — Entrer vos clés dans Baobab Loyalty

1. Connectez-vous à votre compte Baobab Loyalty

2. Allez dans **Configuration** (dans le menu à gauche)

3. Faites défiler jusqu'à la section **"WhatsApp Business API"**

4. Collez votre **Phone Number ID** dans le premier champ

5. Collez votre **Access Token** dans le deuxième champ

6. Cliquez sur **"Enregistrer"**

Vos messages WhatsApp partiront maintenant depuis le numéro de votre hôtel.

---

## ETAPE 6 — Obtenir un Access Token permanent (recommandé)

Le token récupéré à l'Étape 4 expire après 24 heures. Pour ne pas avoir à le renouveler chaque jour :

1. Dans le menu gauche de votre application Meta, cliquez sur **"Paramètres système"** → **"Utilisateurs système"**

2. Cliquez sur **"Ajouter"** → créez un utilisateur système de type **"Admin"**

3. Donnez-lui un nom (ex: "Baobab Loyalty Bot")

4. Cliquez sur **"Générer un nouveau token"**

5. Sélectionnez votre application dans la liste

6. Dans les permissions, cochez **"whatsapp_business_messaging"**

7. Cliquez sur **"Générer le token"**

8. Copiez ce nouveau token et remplacez l'ancien dans Baobab Loyalty (Étape 5)

Ce token n'expire jamais (sauf si vous le révoquez manuellement).

---

## ETAPE 7 — Ajouter votre vrai numéro de téléphone (pour la production)

Le numéro de test Meta vous permet d'envoyer seulement à 5 contacts pré-enregistrés. Pour envoyer à tous vos clients :

1. Dans votre application Meta, allez dans **WhatsApp → Configuration du numéro de téléphone**

2. Cliquez sur **"Ajouter un numéro de téléphone"**

3. Entrez le numéro de téléphone de votre hôtel (format international, ex: +225 07 00 00 00 00)

4. Meta vous envoie un code par SMS ou appel téléphonique pour vérifier le numéro

5. Entrez le code de vérification

6. Votre nouveau **Phone Number ID** apparaît — mettez-le à jour dans Baobab Loyalty

   **Note importante** : WhatsApp exige que ce numéro ne soit PAS actif sur l'application WhatsApp normale. Si votre numéro est déjà sur WhatsApp, il faudra le désactiver d'abord (Paramètres WhatsApp → Compte → Supprimer le compte).

---

## Résumé — Ce que vous devez avoir à la fin

| Information | Exemple | Où la trouver |
|-------------|---------|---------------|
| Phone Number ID | `123456789012345` | Meta for Developers → WhatsApp → Démarrage rapide |
| Access Token | `EAABcd...` | Meta for Developers → WhatsApp → Démarrage rapide (ou Utilisateurs système) |

Ces deux informations sont à saisir dans **Baobab Loyalty → Configuration → WhatsApp Business API**.

---

## En cas de problème

**Le message n'arrive pas au client :**
- Vérifiez que le numéro du client est au format international (+225 07 00 00 00)
- Avec le numéro de test, le numéro du client doit être pré-enregistré dans Meta (section "Ajouter des numéros de téléphone de destinataires")

**Le token est refusé :**
- Le token temporaire a peut-être expiré — générez un nouveau token permanent (Étape 6)

**Besoin d'aide :**
- Contactez le support Baobab Loyalty — nous vous accompagnons dans la configuration

---

*Guide préparé par Baobab Loyalty — Votre solution de fidélisation client pour hôtels en Afrique*
