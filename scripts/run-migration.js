#!/usr/bin/env node
/**
 * Instructions pour exécuter les migrations Supabase (clients, configuration).
 * 
 * 1. Ouvrez Supabase Dashboard > SQL Editor > New query
 * 2. Collez le contenu de : supabase/migrations/005_clients_and_config.sql
 *    (ou supabase/TOUT_CONFIGURER.sql pour une configuration complète)
 * 3. Cliquez sur Run
 * 
 * Pour les réservations via /offre, ajoutez dans .env.local :
 *   SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
 */

console.log("📋 Migrations Supabase - Baobab Loyalty");
console.log("");
console.log("Exécutez l'une des options dans Supabase > SQL Editor :");
console.log("  • supabase/migrations/005_clients_and_config.sql  (nouveau uniquement)");
console.log("  • supabase/TOUT_CONFIGURER.sql                    (configuration complète)");
console.log("");
