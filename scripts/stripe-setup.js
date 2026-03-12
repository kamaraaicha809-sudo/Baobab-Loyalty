/**
 * Script de création des produits Stripe pour Baobab Loyalty
 *
 * Prérequis : STRIPE_SECRET_KEY dans .env.local ou en variable d'environnement
 *
 * Usage : node scripts/stripe-setup.js
 */

require("dotenv").config({ path: ".env.local" });

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error("❌ STRIPE_SECRET_KEY manquant dans .env.local");
  console.log("\nAjoutez : STRIPE_SECRET_KEY=sk_test_xxx");
  process.exit(1);
}

async function main() {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  const plans = [
    { name: "Essentiel", price: 29000, id: "essentiel" },
    { name: "Croissance", price: 49000, id: "croissance" },
    { name: "Premium", price: 69000, id: "premium" },
  ];

  console.log("🔧 Création des produits Stripe pour Baobab Loyalty...\n");

  for (const plan of plans) {
    const product = await stripe.products.create({
      name: `Baobab Loyalty - ${plan.name}`,
      description: `Plan ${plan.name} - ${plan.price.toLocaleString("fr-FR")} FCFA/mois`,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price, // XOF : pas de décimales, 1 FCFA = 1 unité
      currency: "xof",
      recurring: { interval: "month" },
    });

    console.log(`✅ ${plan.name}:`);
    console.log(`   Produit: ${product.id}`);
    console.log(`   Prix: ${price.id} (${plan.price.toLocaleString("fr-FR")} FCFA/mois)`);
    console.log("");
  }

  console.log("📋 Mettez à jour config.js avec les Price IDs ci-dessus.");
  console.log("   (price_essentiel_test, price_croissance_test, price_premium_test)");
}

main().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
