/**
 * Demo Mode Configuration
 * 
 * Permet de tester l'interface sans configurer Supabase.
 * Activez avec NEXT_PUBLIC_DEMO_MODE=true dans .env.local
 */

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Utilisateur fictif pour le mode démo
export const demoUser = {
  id: "demo-user-id",
  email: "demo@kodefast.dev",
  user_metadata: { 
    full_name: "Jean",
    avatar_url: null,
  },
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
};

// Profil fictif pour le mode démo (admin par défaut pour tester l'admin)
export const demoProfile = {
  id: "demo-user-id",
  email: "demo@kodefast.dev",
  customer_id: null,
  price_id: null,
  has_access: true,
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
