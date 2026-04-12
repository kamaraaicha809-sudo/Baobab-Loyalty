# Skill : /legal — Génération des pages légales

## Objectif

Générer les pages légales complètes pour Baobab Loyalty en posant d'abord les bonnes questions, puis en créant les fichiers adaptés au marché africain francophone.

---

## Étape 1 : Poser ces 7 questions avant tout

1. **Nom légal de l'entreprise** : Quel est le nom officiel (ex : "Baobab Loyalty SARL") ?
2. **Pays d'enregistrement** : Dans quel pays est enregistrée l'entreprise (Sénégal, Côte d'Ivoire, Cameroun, France...) ?
3. **Adresse du siège social** : Adresse complète (rue, ville, pays) ?
4. **Email de contact légal** : Adresse email pour les demandes légales (ex: legal@baobabloyalty.com) ?
5. **Numéro RCCM ou SIRET** : Numéro d'enregistrement officiel de l'entreprise ?
6. **Données collectées** : Quelles données personnelles collectes-tu (email, téléphone, nom, données de réservation...) ?
7. **Services tiers** : Quels services tiers utilises-tu (Stripe, Supabase, Resend, WhatsApp, OpenRouter...) ?

---

## Étape 2 : Pages à générer

### 1. Mentions légales (`/legal/mentions-legales`)
- Éditeur du site (nom, adresse, email, numéro d'enregistrement)
- Hébergeur (Vercel + Supabase)
- Directeur de publication
- Propriété intellectuelle

### 2. Conditions Générales d'Utilisation — CGU (`/legal/cgu`)
- Objet du service
- Accès et inscription
- Utilisation acceptable
- Responsabilités
- Modification et résiliation
- Droit applicable (pays de l'entreprise)

### 3. Politique de Confidentialité (`/legal/confidentialite`)
- Données collectées et pourquoi
- Base légale (RGPD si France/UE, loi locale sinon)
- Durée de conservation
- Droits des utilisateurs (accès, rectification, suppression)
- Partage avec tiers (Stripe, Supabase, etc.)
- Contact DPO

### 4. Politique de Cookies (`/legal/cookies`)
- Types de cookies utilisés (essentiels, analytiques, marketing)
- Durée de vie
- Comment les désactiver
- Consentement

### 5. Conditions Générales de Vente — CGV (`/legal/cgv`)
- Description des plans tarifaires (Essentiel, Croissance, Premium en FCFA)
- Modalités de paiement (Stripe)
- Droit de rétractation (14 jours si applicable)
- Politique de remboursement
- Garantie "2 nuits ou mois offert"
- Résiliation

---

## Étape 3 : Structure des fichiers Next.js

```
app/
└── legal/
    ├── layout.tsx          # Layout commun (header simple + footer)
    ├── page.tsx            # Index des pages légales
    ├── mentions-legales/
    │   └── page.tsx
    ├── cgu/
    │   └── page.tsx
    ├── confidentialite/
    │   └── page.tsx
    ├── cookies/
    │   └── page.tsx
    └── cgv/
        └── page.tsx
```

---

## Étape 4 : Ajouter au footer

Dans `components/landing/Footer.tsx` (ou équivalent), ajouter une section :

```tsx
<div>
  <h4 className="font-semibold text-sm mb-3">Légal</h4>
  <ul className="space-y-2 text-sm text-slate-500">
    <li><Link href="/legal/mentions-legales">Mentions légales</Link></li>
    <li><Link href="/legal/cgu">CGU</Link></li>
    <li><Link href="/legal/confidentialite">Confidentialité</Link></li>
    <li><Link href="/legal/cookies">Cookies</Link></li>
    <li><Link href="/legal/cgv">CGV</Link></li>
  </ul>
</div>
```

---

## Étape 5 : Bannière cookies

Créer un composant `components/common/CookieBanner.tsx` :
- Apparaît si `localStorage.getItem("cookies_accepted")` est null
- Boutons : "Accepter" et "Refuser"
- Lien vers `/legal/cookies`
- Disparaît après choix et stocke la décision dans localStorage

---

## Règles de rédaction

- Langue : **français**
- Ton : professionnel mais accessible
- Droit applicable : préciser le pays (ex: droit sénégalais, OHADA)
- Si pays UE ou France : mentionner RGPD et CNIL
- Si pays Afrique : mentionner la loi locale sur la protection des données (ex: loi 78-17 Sénégal)
- Prix toujours en **FCFA**
- Date de mise à jour affichée en haut de chaque page

---

## Exemple de structure d'une page légale

```tsx
export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-sm text-slate-400 mb-2">Dernière mise à jour : {date}</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Mentions légales</h1>
      
      <section className="prose prose-slate max-w-none">
        {/* Contenu généré */}
      </section>
    </main>
  );
}
```
