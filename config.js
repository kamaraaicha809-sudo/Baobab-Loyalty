/**
 * ============================================
 * CONFIGURATION KODEFAST
 * ============================================
 * 
 * Ce fichier centralise toute la configuration de votre Micro SaaS.
 * Modifiez-le pour personnaliser votre application.
 * 
 * ÉTAPES DE PERSONNALISATION :
 * 1. Changez appName, appDescription, domainName
 * 2. Modifiez colors (main, dark, light) — le CSS est généré automatiquement
 * 3. Configurez les plans de facturation Moneroo (billing.plans)
 * 4. Configurez les emails dans resend
 */

// Région de déploiement : lue une seule fois ici, jamais de "if (europe)"
// disséminé ailleurs dans le code. "africa" reste le défaut implicite
// (NEXT_PUBLIC_REGION absent en production Afrique) : zéro changement de
// comportement pour l'app existante tant que cette variable n'est pas
// définie sur un déploiement.
const region = (process.env.NEXT_PUBLIC_REGION || "africa").trim().toLowerCase();

const config = {
  region,
  // → "africa" (défaut) ou "europe". Seul point de lecture de
  //   NEXT_PUBLIC_REGION dans tout le projet ; tout le reste du code lit
  //   config.region (ou config.billing.currency) plutôt que l'env var
  //   directement, pour garder un unique point de bascule.

  // ============================================
  // 1. INFORMATIONS GÉNÉRALES
  // ============================================
  // Ces valeurs apparaissent dans l'UI, le SEO et les emails

  appName: region === "europe" ? "Loyavia" : "Baobab Loyalty",
  // → Nom de votre application (header, footer, emails). Marque officielle :
  //   "Baobab Loyalty" (Afrique) / "Loyavia" (Europe), confirmée par
  //   l'utilisatrice le 2026-09-14. colors/resend restent à "Baobab Loyalty"
  //   pour l'instant tant qu'aucun email Loyavia réel (domaine vérifié
  //   Resend) n'a été communiqué — ne pas inventer de valeurs ici.

  appDescription: "Aide les propriétaires d'hôtels à remplir leurs chambres vides grâce à l'IA et leur base de données clients en automatisant l'envoi via WhatsApp en 2 minutes",
  // → Description courte pour le SEO et la homepage

  domainName: region === "europe" ? "loyavia.com" : "baobabloyalty.com",
  // → Domaine de production (sans https://). loyavia.com confirmé opérationnel
  //   en HTTPS le 2026-09-14 (DNS + certificat Vercel) : utilisé uniquement
  //   pour le SEO/canonical/JSON-LD (voir libs/seo.tsx), jamais pour l'envoi
  //   d'email (resend.* reste séparé, voir commentaire au-dessus).

  // ============================================
  // 2. COULEURS
  // ============================================
  // Modifiez uniquement ces valeurs - le CSS est généré automatiquement
  // 
  // Conseils :
  // - main : couleur principale (boutons, liens, accents)
  // - dark : version plus foncée pour hover/active
  // - light : version claire pour backgrounds
  
  colors: {
    theme: "light",
    main: "#EBC161",       // Doré/or accent (bannière, highlights)
    dark: "#c9a84d",       // Hover doré
    light: "#F5E6B8",      // Background doré clair
  },

  // ============================================
  // 3. RÉSEAUX SOCIAUX (optionnel)
  // ============================================
  // Laissez vide si vous n'avez pas de présence sociale
  
  social: {
    twitter: "",           // @username (sans le @)
    linkedin: "",          // company-name ou in/username
    facebook: "https://www.facebook.com/profile.php?id=61591703112434",
    instagram: "https://www.instagram.com/baobabloyalty",
  },

  // ============================================
  // 4. EMAILS (Resend)
  // ============================================
  // Configure l'envoi d'emails via Edge Functions
  // Remplacez par votre domaine vérifié dans Resend
  
  resend: {
    fromNoReply: region === "europe" ? `Loyavia <noreply@loyavia.com>` : `Baobab Loyalty <noreply@baobabloyalty.com>`,
    // → Emails automatiques (confirmations, etc.). loyavia.com verifie dans
    //   Resend le 2026-09-15 (SPF/DKIM, region Ireland eu-west-1).

    fromAdmin: region === "europe" ? `Support Loyavia <support@loyavia.com>` : `Support Baobab Loyalty <support@baobabloyalty.com>`,
    // → Emails de support

    supportEmail: region === "europe" ? "support@loyavia.com" : "support@baobabloyalty.com",
    // → Adresse affichée pour contacter le support. support@loyavia.com est
    //   une vraie boite (hebergement mail LWS) confirmee active le 2026-09-15.

    inboundDomain: "baobabloyalty.com",
    // → Domaine pour la réception des emails de sync clients
  },

  // ============================================
  // 5. PLANS BILLING (Moneroo = Afrique / Stripe = Europe)
  // ============================================
  // Plans disponibles pour les hôteliers.
  // billing.plans reste la liste Afrique (FCFA, Moneroo), utilisée telle
  // quelle par /tarifs, /checkout et le dashboard tant que region="africa".
  // billing.plansEurope ne contient QUE ce qui a été validé (prix HT) —
  // monthlyRelances/maxRooms/maxTeamMembers restent null ("draft") tant que
  // le découpage fonctionnalités par plan Europe n'est pas décidé. Ne pas
  // deviner ces valeurs : voir supabase/migrations-europe/012_billing_core.sql
  // (plan_prices, status='draft'), seule source de vérité còté serveur.

  billing: {
    currency: region === "europe" ? "EUR" : "FCFA",
    onboardingFee: {
      name: "Frais d'intégration",
      price: 49000,
      // → Doit rester synchronisé avec ONBOARDING_FEE_XOF
      //   (supabase/functions/_shared/plan.ts), seule source de vérité
      //   appliquée réellement — cette valeur ici n'est qu'informative pour l'UI.
      description:
        "Pour les hôtels sans base de données électronique : nous digitalisons votre cahier papier et vous donnons accès au registre numérique.",
    },
    plans: [
      {
        name: "Starter",
        description: "Pour démarrer et tester",
        price: 39000,
        monthlyRelances: 5,
        // → Nombre de campagnes WhatsApp incluses par mois.
        //   Non reportées d'un mois à l'autre. Appliqué côté serveur dans campaign-send.
        maxRooms: 30,
        // → Doit rester synchronisé avec le trigger SQL enforce_room_types_limit()
        //   (supabase/migrations/048_room_types_plan_limit.sql), seule source de vérité
        //   appliquée réellement — cette valeur ici n'est qu'informative pour l'UI.
        features: [
          { name: "5 campagnes WhatsApp / mois" },
          { name: "Jusqu'à 30 chambres" },
          { name: "Segmentation clients (3, 6, 9 mois)" },
          { name: "Support par email" },
        ],
      },
      {
        isFeatured: true,
        name: "Pro",
        description: "Le meilleur rapport qualité/prix",
        price: 69000,
        monthlyRelances: 10,
        maxRooms: 60,
        features: [
          { name: "10 campagnes WhatsApp / mois" },
          { name: "Jusqu'à 60 chambres" },
          { name: "Segmentation avancée" },
          { name: "IA génération de messages" },
          { name: "Messages d'anniversaire automatiques" },
          { name: "Support prioritaire" },
        ],
      },
      {
        name: "Premium",
        description: "Pour les grands établissements",
        price: 189000,
        monthlyRelances: 30,
        maxRooms: null,
        // → null = illimité
        maxTeamMembers: 2,
        // → Nombre de membres invités en plus du propriétaire.
        //   Doit rester synchronisé avec supabase/functions/_shared/team.ts (MAX_TEAM_MEMBERS).
        features: [
          { name: "30 campagnes WhatsApp / mois" },
          { name: "Chambres illimitées" },
          { name: "API WhatsApp dédiée" },
          { name: "Accès multi-utilisateurs" },
          { name: "Messages d'anniversaire automatiques" },
          { name: "IA personnalisée" },
          { name: "Account Manager dédié" },
          { name: "Bonus : génération de posts LinkedIn (IA)" },
        ],
      },
    ],
    // Prix HT et grille de fonctionnalités validés le 16/09/2026 — voir
    // migrations-europe/012 (prix) et migrations-europe/015 (quotas
    // appliqués réellement côté serveur/base, pas seulement affichés ici).
    // Mêmes noms de champs que `plans` (price/features/description) pour
    // que les composants de pricing puissent lire l'un ou l'autre sans
    // logique dupliquée.
    plansEurope: [
      {
        planId: "starter",
        name: "Starter",
        price: 79,
        description: "Pour démarrer",
        monthlyRelances: 8,
        // → Nombre de campagnes WhatsApp incluses par mois. Appliqué côté
        //   serveur dans campaign-send (supabase/functions/_shared/plan.ts).
        maxRooms: 30,
        // → Doit rester synchronisé avec la fonction SQL
        //   enforce_room_types_limit() (supabase/migrations-europe/015).
        trialDays: 14,
        features: [
          { name: "Génération de messages WhatsApp par IA" },
          { name: "Campagnes WhatsApp + segmentation (3, 6, 9 mois)" },
          { name: "Import CSV" },
          { name: "Registre numérique" },
          { name: "Tableau de bord réservations" },
          { name: "Support standard" },
        ],
        notIncluded: [
          { name: "Messages d'anniversaire automatiques" },
          { name: "Accès multi-utilisateurs (Équipe)" },
          { name: "IA personnalisée avec contexte hôtelier" },
          { name: "Génération de posts LinkedIn (IA)" },
        ],
      },
      {
        planId: "professional",
        isFeatured: true,
        name: "Professional",
        price: 149,
        description: "Le plus populaire",
        monthlyRelances: 16,
        maxRooms: 100,
        trialDays: 14,
        features: [
          { name: "Génération de messages WhatsApp par IA" },
          { name: "Campagnes WhatsApp + segmentation (3, 6, 9 mois)" },
          { name: "Import CSV" },
          { name: "Registre numérique" },
          { name: "Tableau de bord réservations" },
          { name: "Messages d'anniversaire automatiques" },
          { name: "Accès multi-utilisateurs (Équipe)" },
          { name: "Support prioritaire" },
        ],
        notIncluded: [
          { name: "IA personnalisée avec contexte hôtelier" },
          { name: "Génération de posts LinkedIn (IA)" },
        ],
      },
      {
        planId: "business",
        name: "Business",
        price: 349,
        description: "Pour les grands établissements",
        monthlyRelances: 32,
        maxRooms: null,
        // → null = illimité
        trialDays: 14,
        features: [
          { name: "Génération de messages WhatsApp par IA" },
          { name: "Campagnes WhatsApp + segmentation (3, 6, 9 mois)" },
          { name: "Import CSV" },
          { name: "Registre numérique" },
          { name: "Tableau de bord réservations" },
          { name: "Messages d'anniversaire automatiques" },
          { name: "Accès multi-utilisateurs (Équipe)" },
          { name: "IA personnalisée avec contexte hôtelier" },
          { name: "Génération de posts LinkedIn (IA)" },
          { name: "Support prioritaire + accompagnement personnalisé" },
        ],
        notIncluded: [],
      },
    ],
  },

  // ============================================
  // 6. WHATSAPP BUSINESS (Meta Embedded Signup)
  // ============================================
  // Permet aux hôteliers de connecter leur WhatsApp en 5 minutes
  // Obtenez ces valeurs dans developers.facebook.com après vérification Meta Business

  whatsapp: {
    metaAppId: (process.env.NEXT_PUBLIC_META_APP_ID || "").trim(),
    // → App ID Meta (ex: "1234567890123456") — vide jusqu'à validation Meta Business
  },

  // ============================================
  // 7. FEATURE FLAGS
  // ============================================
  // Activez/désactivez des fonctionnalités
  // Utile pour activer progressivement des features
  
  features: {
    payments: true,                   // Paiements Moneroo
    signupsPaused: region === "europe" ? false : true,  // Coupe-circuit /signup uniquement. Europe ouvert (2026-09-15), Afrique inchangée (comptes déjà actifs non affectés).
    betaPaused: region === "europe" ? true : false,  // Coupe-circuit /beta. Europe fermé (pas de bêta privée), Afrique ouvert (bêta-testeurs pilotes, système de code existant conservé).
    dashboardMaintenanceMode: region === "europe" ? false : true,  // Coupe-circuit /dashboard (sauf session authentifiée). Remis en place le 2026-09-17 après le "GO" de l'utilisatrice (vérifications ponctuelles terminées) — Afrique fermé au public, /beta reste le seul point d'entrée.
    oauth: {
      google: false,                  // OAuth Google (configurer dans Supabase)
      github: false,                  // OAuth GitHub (configurer dans Supabase)
    },
  },

  // ============================================
  // 7. ROUTES D'AUTHENTIFICATION
  // ============================================
  // URLs de redirection pour l'authentification
  
  auth: {
    loginUrl: "/signin",              // Page de connexion
    callbackUrl: "/dashboard",        // Redirection après connexion réussie
    setupUrl: "/dashboard/configuration",  // Page de configuration pour les nouveaux comptes
  },

};

export default config;
