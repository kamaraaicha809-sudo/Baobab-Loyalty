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
  
  domainName: "baobab-loyalty.com",
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
    fromNoReply: `Baobab Loyalty <noreply@baobab-loyalty.com>`,
    // → Emails automatiques (confirmations, etc.)

    fromAdmin: `Support Baobab Loyalty <support@baobab-loyalty.com>`,
    // → Emails de support

    supportEmail: "support@baobab-loyalty.com",
    // → Adresse affichée pour contacter le support
  },

  // ============================================
  // 5. PLANS STRIPE
  // ============================================
  // Configurez vos produits et prix Stripe
  // 
  // COMMENT OBTENIR VOS priceId :
  // 1. Allez sur dashboard.stripe.com/products
  // 2. Créez un produit avec un prix
  // 3. Copiez le "Price ID" (commence par price_)
  // 
  // En développement, utilisez vos clés de test (price_test_...)
  // En production, utilisez vos clés live (price_live_...)
  
  stripe: {
    currency: "FCFA",
    plans: [
      {
        name: "Starter",
        description: "Pour tester et démarrer",
        price: 39000,
        features: [
          { name: "Jusqu'à 30 chambres" },
          { name: "Segmentation clients de base" },
          { name: "Campagnes WhatsApp" },
          { name: "Support par email" },
        ],
      },
      {
        isFeatured: true,
        name: "Pro",
        description: "Le meilleur rapport qualité/prix",
        price: 79000,
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
        price: 249000,
        features: [
          { name: "Chambres illimitées" },
          { name: "Automatisation avancée" },
          { name: "Campagnes illimitées" },
          { name: "IA personnalisée" },
          { name: "Account Manager dédié" },
        ],
      },
    ],
  },

  // ============================================
  // 6. FEATURE FLAGS
  // ============================================
  // Activez/désactivez des fonctionnalités
  // Utile pour activer progressivement des features
  
  features: {
    payments: true,                   // Paiements Stripe
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
