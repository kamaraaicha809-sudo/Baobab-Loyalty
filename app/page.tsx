import { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";
import { getSEOTags, renderSchemaTags, renderOrganizationSchema, renderFAQSchema } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `${config.appName} — Remplissez vos chambres vides sans Booking.com`,
  description: config.region === "europe"
    ? "Vos clients oublient votre hôtel ? Relancez-les via WhatsApp, avec leur accord, et récupérez des réservations directes sans commission. Essai gratuit."
    : "Vos clients oublient votre hôtel ? Relancez-les via WhatsApp en 2 min — 0% commission sur vos réservations directes. Essai gratuit, résultats dès la 1ère campagne.",
  canonicalUrlRelative: "/",
});

// Below the fold — code split to reduce initial JS bundle
const Pricing = dynamic(() => import("@/components/landing/Pricing"));
const FAQ = dynamic(() => import("@/components/landing/FAQ"));
const CTA = dynamic(() => import("@/components/landing/CTA"));

export default function Home() {
  return (
    <>
      {renderSchemaTags()}
      {renderOrganizationSchema()}
      {/* Ces questions affirment des faits propres à l'Afrique (pays desservis,
          loi ivoirienne, prix FCFA) — jamais vrais pour l'Europe et jamais
          inventer un équivalent RGPD non validé juridiquement ici. Suspendu
          pour l'Europe tant qu'un contenu FAQ Europe réel n'a pas été rédigé
          et validé (cf. audit Phase "pages publiques Europe", non commencé). */}
      {config.region !== "europe" && renderFAQSchema([
        {
          question: "Qu'est-ce que Baobab Loyalty ?",
          answer:
            "Baobab Loyalty est une solution SaaS de fidélisation client pour les hôtels d'Afrique de l'Ouest, lancée en Côte d'Ivoire. Elle permet d'envoyer des campagnes WhatsApp personnalisées aux clients inactifs qui ont donné leur accord, grâce à l'IA et à la segmentation automatique.",
        },
        {
          question: "Combien coûte Baobab Loyalty ?",
          answer:
            "Baobab Loyalty propose trois plans en FCFA : Starter à 39 000 FCFA/mois pour les hôtels de moins de 30 chambres, Pro à 69 000 FCFA/mois pour moins de 60 chambres, et Premium à 189 000 FCFA/mois pour les hôtels sans limite de chambres.",
        },
        {
          question: "Dans quels pays est disponible Baobab Loyalty ?",
          answer:
            "Baobab Loyalty est lancé en Côte d'Ivoire. Le Sénégal, le Cameroun et le Ghana sont les prochains marchés prévus. La solution est en français, avec une version anglaise préparée pour le Ghana.",
        },
        {
          question: "Faut-il un compte WhatsApp Business pour utiliser Baobab Loyalty ?",
          answer:
            "Oui, Baobab Loyalty utilise l'API WhatsApp Business (Meta Cloud API) pour envoyer les campagnes. Chaque hôtelier connecte son propre compte WhatsApp Business, ce qui garantit la personnalisation et la conformité avec les règles de Meta.",
        },
        {
          question: "Comment importer ma base de clients dans Baobab Loyalty ?",
          answer:
            "L'import se fait via un fichier CSV depuis votre logiciel hôtelier existant. Baobab Loyalty détecte automatiquement les colonnes (nom, email, téléphone, WhatsApp, dernière visite) et importe vos clients en quelques secondes.",
        },
        {
          question: "Comment Baobab Loyalty protège-t-il les données de mes clients ?",
          answer:
            "Baobab Loyalty applique la loi ivoirienne n° 2013-450 sur la protection des données personnelles : données cloisonnées par hôtel, messages WhatsApp envoyés uniquement aux clients qui ont donné leur accord, et lien de désinscription dans chaque message. Les formalités auprès de l'ARTCI (déclaration et autorisation de transfert des données) sont en préparation.",
        },
      ])}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <NewsletterBanner />
      <Footer />
    </>
  );
}
