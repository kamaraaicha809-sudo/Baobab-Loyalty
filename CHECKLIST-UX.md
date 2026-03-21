# CHECKLIST UX & RESPONSIVE — Pre-Deploy V1
# Baobab Loyalty Micro-SaaS

**Date :** 2026-03-21
**Analyse :** Code source complet

---

## LEGENDE

| Icone | Signification |
|-------|---------------|
| ✅ | OK — Passe |
| ❌ | Probleme — A corriger avant deploy |
| ⚠️ | Verifier manuellement |

---

## 1. Landing page — titre, proposition de valeur, CTA

**Statut : ✅**

- Hero avec H1 clair : "Remplissez vos chambres vides grâce à vos anciens clients"
- Proposition de valeur explicite : IA + WhatsApp + segmentation clients
- Deux CTA primaires ("Essayez gratuitement", "Voir comment ça marche")
- Section CTA finale ("Prêt à booster vos réservations ?") avec deux boutons
- Responsive mobile-first sur tous les composants (sm, md, lg breakpoints)

---

## 2. Pricing — bons prix et bons plans

**Statut : ✅ avec ❌ mineur**

- Prix en FCFA affichés correctement : 29 000 / 49 000 / 69 000
- Plans : Essentiel / Croissance (featured) / Premium
- Setup fee mentionné en bas : 39 000 FCFA
- Chargement auth vérifié avant d'afficher ButtonCheckout ou lien /signup

**Problème :**

| # | Probleme | Detail |
|---|---------|--------|
| U1 | Lien CTA vers les tarifs cassé | `CTA.tsx` utilise `href="/#pricing"` mais la section Pricing a `id="tarifs"` → le scroll ne fonctionnera pas |
| U2 | "Economisez 20% sur le paiement annuel" | Mention affichee sur chaque plan mais aucune option annuelle n'existe dans l'UI — trompeur |

---

## 3. Pages legales

**Statut : ✅**

- `/privacy-policy` → `app/privacy-policy/page.tsx` — Politique de confidentialite complete
- `/tos` → `app/tos/page.tsx` — CGU completes avec mention remboursement 7 jours

**Probleme :**

| # | Probleme | Detail |
|---|---------|--------|
| U3 | Footer sans liens legaux | `Footer.tsx` n'affiche que le copyright — aucun lien vers `/tos` ou `/privacy-policy` |

---

## 4. Pages 404 et 500 personnalisees

**Statut : ✅**

- `app/not-found.tsx` : Page 404 avec message "Page introuvable", CTA Accueil + Support
- `app/error.tsx` : Page erreur avec bouton "Reessayer" et retour Accueil
- Les deux sont personnalisees avec le branding Baobab Loyalty

---

## 5. Etats de chargement (loading states)

**Statut : ✅**

- Pricing : `animate-pulse` pendant la verification auth
- ButtonCheckout : spinner pendant le paiement
- Dashboard : loading spinners sur chaque section
- Pages auth : `Suspense` avec fallback spinner
- Admin pages : spinner pendant le chargement des prompts/modele

---

## 6. Etats vides (empty states)

**Statut : ✅**

- Dashboard : affiche les donnees demo quand aucune vraie donnee
- Admin/ia : "Aucun prompt — Cliquez sur Ajouter" quand liste vide
- Segments : gestion de l'etat vide presente

---

## 7. Messages d'erreur comprehensibles

**Statut : ✅**

- Toasts Sonner pour toutes les erreurs utilisateur ("Impossible de charger les prompts", "Non authentifie", etc.)
- Page `error.tsx` affiche `error.message` ou message generique en francais
- Page 404 avec lien support par email

---

## 8. Images avec next/image (pas de balise img brute)

**Statut : ✅**

- `components/landing/WhyChoose.tsx` : utilise `next/image` avec `alt`, `sizes`, `fill`
- Aucune balise `<img>` brute trouvee dans les composants
- SVG utilises directement (inline) — correct

---

## 9. Meta title et meta description personnalisees

**Statut : ✅**

- `libs/seo.tsx` : `getSEOTags()` configure title, description, keywords pour Baobab Loyalty
- `config.js` : `appName = "Baobab Loyalty"`, `domainName = "baobab-loyalty.com"`
- Schema.org JSON-LD (SoftwareApplication) presente
- OpenGraph + Twitter Cards configures
- `lang="fr"` sur le HTML

---

## 10. og:image configuree

**Statut : ❌**

- Aucun fichier `app/opengraph-image.tsx` ou `public/og-image.png` trouve
- `libs/seo.tsx` reference `/icon.svg` comme image par defaut dans les meta OG
- Impact : LinkedIn, WhatsApp, Facebook n'afficheront pas d'image lors du partage du lien

---

## 11. Favicon personnalise

**Statut : ❌**

- Aucun fichier `public/favicon.ico` ou `app/favicon.ico` trouve
- Le dossier `public/` ne contient pas de favicon
- Impact : icone par defaut du navigateur, erreurs 404 dans les logs

---

## 12. npm run build passe sans erreur

**Statut : ⚠️ (verification manuelle)**

- Non verifiable automatiquement depuis le code source
- A lancer : `npm run build` avant le deploiement

---

## PROBLEMES SUPPLEMENTAIRES DETECTES

### Configuration emails non mise a jour

**Statut : ❌**

Dans `config.js` :
```javascript
fromNoReply: "noreply@example.com"   // Placeholder non remplace
fromAdmin: "support@example.com"      // Placeholder non remplace
supportEmail: "support@example.com"   // Affiche dans la page 404
```
Ces adresses apparaissent dans les emails envoyes aux utilisateurs et dans la page 404 (lien "Support").

### robots.txt et sitemap.xml avec placeholder

**Statut : ❌**

`public/robots.txt` :
```
Host: https://example.com       // A remplacer
Sitemap: https://example.com/sitemap.xml  // A remplacer
```

`public/sitemap.xml` :
```xml
<loc>https://example.com/sitemap-0.xml</loc>  // Placeholder
```
Impact : robots.txt incorrect nuit au SEO. Le sitemap est invalide pour Google Search Console.

---

## SYNTHESE

### ❌ A corriger avant deploiement

| # | Probleme | Fichier | Priorite |
|---|---------|---------|----------|
| U1 | Lien /#pricing ne scroll pas (id="tarifs") | `components/landing/CTA.tsx` | IMPORTANT |
| U2 | "Economisez 20%" sans option annuelle — trompeur | `components/landing/Pricing.tsx` | MOYEN |
| U3 | Footer sans liens /tos et /privacy-policy | `components/landing/Footer.tsx` | IMPORTANT |
| U4 | og:image manquante | `app/opengraph-image.tsx` a creer | IMPORTANT |
| U5 | Favicon manquant | `app/favicon.ico` a creer | IMPORTANT |
| U6 | Emails placeholder dans config.js | `config.js` | IMPORTANT |
| U7 | robots.txt et sitemap.xml avec example.com | `public/robots.txt`, `public/sitemap.xml` | IMPORTANT |

### ✅ Points conformes

- Landing page avec titre clair, proposition de valeur et CTA
- Plans et prix en FCFA corrects
- Pages legales /privacy-policy et /tos presentes
- Pages 404 et 500 personnalisees
- Loading states sur boutons et pages
- Etats vides geres
- Messages d'erreur en francais via toast
- next/image utilise (pas de balise img brute)
- Meta title/description personnalisees
- Schema.org JSON-LD configure

### ⚠️ A verifier manuellement

| # | Verification | Comment |
|---|-------------|---------|
| V1 | `npm run build` passe sans erreur | Terminal : `npm run build` |
| V2 | Lien /demo pointe vers /signin en production | Tester en mode non-demo |
| V3 | Le scroll vers #tarifs fonctionne apres correction U1 | Test navigateur |
| V4 | Favicon affiche correctement dans l'onglet | Test navigateur |
| V5 | og:image s'affiche lors du partage WhatsApp/LinkedIn | Test de partage |

---

## PLAN DE CORRECTIONS

### U1 — Lien CTA : corriger l'ancre

```typescript
// components/landing/CTA.tsx — ligne 40
// AVANT
href="/#pricing"

// APRES
href="/#tarifs"
```

### U2 — Supprimer la mention "Economisez 20%"

```typescript
// components/landing/Pricing.tsx — ligne 107
// Supprimer cette ligne (pas d'option annuelle dans l'UI)
<p className="text-center text-primary/80 text-xs mt-2">
  Economisez 20% sur le paiement annuel
</p>
```

### U3 — Ajouter les liens legaux dans le Footer

```typescript
// components/landing/Footer.tsx
// Ajouter entre le logo et le copyright :
<div className="flex gap-4 justify-center mb-4">
  <Link href="/tos">Conditions d'utilisation</Link>
  <Link href="/privacy-policy">Politique de confidentialite</Link>
</div>
```

### U4 — Creer l'og:image

```typescript
// app/opengraph-image.tsx (nouveau fichier)
// Image 1200x630px avec le nom et la couleur primaire de l'app
```

### U5 — Creer le favicon

```
// Creer app/favicon.ico ou app/icon.tsx
// Version simple : lettre "B" sur fond #2C2C2C (comme dans le Footer)
```

### U6 — Mettre a jour les emails dans config.js

```javascript
// config.js — a remplacer par les vraies adresses
fromNoReply: "noreply@baobab-loyalty.com"
fromAdmin: "support@baobab-loyalty.com"
supportEmail: "support@baobab-loyalty.com"
```

### U7 — Mettre a jour robots.txt et sitemap.xml

```
// public/robots.txt
Host: https://baobab-loyalty.com
Sitemap: https://baobab-loyalty.com/sitemap.xml

// public/sitemap.xml
<loc>https://baobab-loyalty.com/sitemap-0.xml</loc>
```

---

*Genere lors de l'audit UX pre-deploiement V1*
