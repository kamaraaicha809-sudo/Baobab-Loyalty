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
 * 3. Remplacez les priceId Stripe par les vôtres
 * 4. Configurez les emails dans resend
 */

const config = {
  // ============================================
  // 1. INFORMATIONS GÉNÉRALES
  // ============================================
  // Ces valeurs apparaissent dans l'UI, le SEO et les emails
  
  appName: "Baobab Loyalty",
  // → Nom de votre application (header, footer, emails)
  
  appDescription: "Aide les propriétaires d'hôtels à remplir leurs chambres vides grâce à l'IA et leur base de données clients en automatisant l'envoi via WhatsApp en 2 minutes",
  // → Description courte pour le SEO et la homepage
  
  domainName: "baobabloyalty.com",
  // → Domaine de production (sans https://)

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
  },

  // ============================================
  // 4. EMAILS (Resend)
  // ============================================
  // Configure l'envoi d'emails via Edge Functions
  // Remplacez par votre domaine vérifié dans Resend
  
  resend: {
    fromNoReply: `Baobab Loyalty <noreply@baobabloyalty.com>`,
    // → Emails automatiques (confirmations, etc.)

    fromAdmin: `Support Baobab Loyalty <support@baobabloyalty.com>`,
    // → Emails de support

    supportEmail: "support@baobabloyalty.com",
    // → Adresse affichée pour contacter le support

    inboundDomain: "baobabloyalty.com",
    // → Domaine pour la réception des emails de sync clients
  },

  // ============================================
  // 5. PLANS BILLING (Moneroo)
  // ============================================
  // Plans disponibles pour les hôteliers
  // Prix en FCFA — marché Afrique francophone

  billing: {
    currency: "FCFA",
    plans: [
      {
        name: "Starter",
        description: "Pour démarrer et tester",
        price: 39000,
        features: [
          { name: "Jusqu'à 30 chambres" },
          { name: "Segmentation clients (3, 6, 9 mois)" },
          { name: "Campagnes WhatsApp ciblées" },
          { name: "Support par email" },
        ],
      },
      {
        isFeatured: true,
        name: "Pro",
        description: "Le meilleur rapport qualité/prix",
        price: 69000,
        features: [
          { name: "Jusqu'à 100 chambres" },
          { name: "Segmentation avancée" },
          { name: "Campagnes illimitées" },
          { name: "IA génération de messages" },
          { name: "Support prioritaire" },
        ],
      },
      {
        name: "Premium",
        description: "Pour les grands établissements",
        price: 189000,
        features: [
          { name: "Chambres illimitées" },
          { name: "API WhatsApp dédiée" },
          { name: "Accès multi-utilisateurs" },
          { name: "IA personnalisée" },
          { name: "Account Manager dédié" },
        ],
      },
    ],
  },

  // ============================================
  // 6. WHATSAPP BUSINESS (Meta Embedded Signup)
  // ============================================
  // Permet aux hôteliers de connecter leur WhatsApp en 5 minutes
  // Obtenez ces valeurs dans developers.facebook.com après vérification Meta Business

  whatsapp: {
    metaAppId: process.env.NEXT_PUBLIC_META_APP_ID || "",
    // → App ID Meta (ex: "1234567890123456") — vide jusqu'à validation Meta Business
  },

  // ============================================
  // 7. FEATURE FLAGS
  // ============================================
  // Activez/désactivez des fonctionnalités
  // Utile pour activer progressivement des features
  
  features: {
    payments: true,                   // Paiements Moneroo
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
