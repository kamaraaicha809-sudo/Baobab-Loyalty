import { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import { renderSchemaTags, renderOrganizationSchema, renderFAQSchema } from "@/libs/seo";

// Below the fold — code split to reduce initial JS bundle
const LinkedInFeature = dynamic(() => import("@/components/landing/LinkedInFeature"));
const Pricing = dynamic(() => import("@/components/landing/Pricing"));
const FAQ = dynamic(() => import("@/components/landing/FAQ"));
const CTA = dynamic(() => import("@/components/landing/CTA"));

export default function Home() {
  return (
    <>
      {renderSchemaTags()}
      {renderOrganizationSchema()}
      {renderFAQSchema([
        {
          question: "Qu'est-ce que Baobab Loyalty ?",
          answer:
            "Baobab Loyalty est une solution SaaS de fidélisation client pour les hôtels en Afrique de l'Ouest (Côte d'Ivoire, Sénégal, Cameroun, Ghana). Elle permet d'envoyer des campagnes WhatsApp personnalisées à vos clients inactifs en 2 minutes, grâce à l'IA et à la segmentation automatique.",
        },
        {
          question: "Combien coûte Baobab Loyalty ?",
          answer:
            "Baobab Loyalty propose trois plans en FCFA : Essentiel à 29 000 FCFA/mois pour les hôtels de moins de 30 chambres, Croissance à 49 000 FCFA/mois pour moins de 100 chambres, et Premium à 69 000 FCFA/mois pour les hôtels sans limite de chambres.",
        },
        {
          question: "Dans quels pays est disponible Baobab Loyalty ?",
          answer:
            "Baobab Loyalty est disponible en Côte d'Ivoire, au Sénégal, au Cameroun et au Ghana. La solution est entièrement en français pour les marchés francophones, et une version anglaise est disponible pour le Ghana.",
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
          question: "Baobab Loyalty est-il conforme au RGPD et à la réglementation ARTCI ?",
          answer:
            "Oui. Baobab Loyalty est conçu pour être conforme à la réglementation sur la protection des données personnelles en Côte d'Ivoire (ARTCI) et dans les pays de la région. Les données clients sont stockées de manière sécurisée et chaque message inclut une option de désinscription.",
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
        <LinkedInFeature />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
