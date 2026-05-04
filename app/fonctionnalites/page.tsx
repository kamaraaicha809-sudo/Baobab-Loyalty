import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: `https://${config.domainName}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Fonctionnalités",
      item: `https://${config.domainName}/fonctionnalites`,
    },
  ],
};

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
      </svg>
    ),
    title: "Import clients en un clic",
    desc: "Chargez votre fichier Excel ou CSV existant. Baobab Loyalty détecte automatiquement les colonnes (nom, téléphone, email, date de dernière visite) et importe votre base entière en moins de 2 minutes.",
    points: [
      "Compatible Excel (.xlsx) et CSV",
      "Détection automatique des colonnes",
      "Import par batch de 100 contacts",
      "Dédoublonnage automatique",
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: "Segmentation automatique",
    desc: "Le système analyse automatiquement votre base et regroupe vos clients selon leur dernière visite. Identifiez en un coup d'œil qui relancer, avec quelle offre et à quel moment.",
    points: [
      "4 segments prédéfinis : 3, 6, 9 mois et tous",
      "Compteur de clients par segment en temps réel",
      "Mise à jour automatique à chaque import",
      "Ciblage précis pour chaque campagne",
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Campagnes WhatsApp ciblées",
    desc: "Envoyez des messages personnalisés directement sur le WhatsApp de vos clients. Choisissez un segment, rédigez votre message, confirmez et envoyez. Chaque client reçoit une offre adaptée à sa situation.",
    points: [
      "Envoi en masse via WhatsApp",
      "Personnalisation du message par segment",
      "Suivi du statut d'envoi en temps réel",
      "Historique complet des campagnes",
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "IA de génération de messages",
    desc: "L'intelligence artificielle rédige votre message de campagne à votre place. Elle adapte automatiquement le ton et le contenu selon le segment ciblé et l'offre proposée.",
    points: [
      "Génération en un clic",
      "Adapté au contexte (segment + offre)",
      "Ton personnalisable par hôtel",
      "Prompts configurables par l'admin",
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Tableau de bord temps réel",
    desc: "Suivez en direct l'impact de vos campagnes sur vos réservations. Revenus générés en FCFA, graphique des 7 derniers jours, comparaison réservations directes vs. autres canaux.",
    points: [
      "Réservations via Baobab (total + aujourd'hui)",
      "Revenus générés en FCFA",
      "Graphique 7 jours : directes vs. autres",
      "Activité live via Supabase Realtime",
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Tracking des offres envoyées",
    desc: "Chaque lien WhatsApp est unique et traçable. Sachez exactement combien de clients ont cliqué sur votre offre, lesquels ont réservé et lesquels ont annulé.",
    points: [
      "Lien unique par offre et par client",
      "Statuts : cliqué → réservé / annulé",
      "Page offre publique accessible sans app",
      "Historique complet des redemptions",
    ],
  },
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: config.appName,
  description:
    "Logiciel de fidélisation clients pour hôtels en Afrique : import CSV, segmentation automatique, campagnes WhatsApp et tableau de bord temps réel.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: `https://${config.domainName}`,
  featureList: [
    "Import CSV et Excel",
    "Segmentation automatique des clients inactifs",
    "Campagnes WhatsApp ciblées",
    "Génération de messages par IA",
    "Tableau de bord réservations en temps réel",
    "Tracking des offres et des réservations",
  ],
  offers: {
    "@type": "Offer",
    price: "29000",
    priceCurrency: "XOF",
    description: "À partir de 29 000 FCFA par mois",
  },
};

export default function FonctionnalitesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        {/* Hero */}
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-[#FDFDF9]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Fonctionnalités
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Tout ce dont votre hôtel a besoin{" "}
              <span className="text-[#1a2f2a]">pour fidéliser</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              De l'import de votre base clients à l'envoi de campagnes WhatsApp ciblées —
              Baobab Loyalty regroupe toutes les fonctionnalités pensées pour les hôtels
              d'Afrique, sans complexité inutile.
            </p>
            <Link
              href="/demo"
              className="inline-block px-7 py-3.5 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              Essayer gratuitement
            </Link>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="p-7 rounded-2xl bg-[#FDFDF9] border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#1a2f2a] flex items-center justify-center text-[#EBC161] mb-5">
                    {feature.icon}
                  </div>
                  <h2 className="font-bold text-lg text-[#2C2C2C] mb-3">{feature.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <svg
                          className="w-4 h-4 mt-0.5 shrink-0 text-[#1a2f2a]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-slate-600 text-sm leading-snug">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison — avec vs sans */}
        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
                Avant et après Baobab Loyalty
              </h2>
              <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
                Ce que change concrètement l'utilisation de Baobab Loyalty au quotidien.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-7 rounded-2xl bg-white border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
                  Sans Baobab Loyalty
                </p>
                <ul className="space-y-3">
                  {[
                    "Clients perdus après le check-out",
                    "Aucune visibilité sur les clients inactifs",
                    "Campagnes manuelles, une par une",
                    "Commission OTA de 15 à 20%",
                    "Aucun suivi des offres envoyées",
                    "Tableau de bord vide ou inexistant",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-slate-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-7 rounded-2xl bg-[#1a2f2a] ring-2 ring-[#EBC161]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#EBC161] mb-5">
                  Avec Baobab Loyalty
                </p>
                <ul className="space-y-3">
                  {[
                    "Chaque client est recontacté automatiquement",
                    "Segments inactifs identifiés en 1 clic",
                    "Campagnes en masse en moins de 10 minutes",
                    "Réservations directes sans commission",
                    "Tracking complet : clics, réservations, revenus",
                    "Dashboard temps réel en FCFA",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0 text-[#EBC161]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-[#d4e8df] text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
              Prêt à mettre ces fonctionnalités au service de votre hôtel ?
            </h2>
            <p className="text-[#a3c4b5] text-base sm:text-lg mb-8 leading-relaxed">
              Démarrez gratuitement. Aucune carte bancaire requise. Opérationnel en 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/demo"
                className="inline-block px-8 py-4 rounded-xl bg-[#EBC161] text-[#1a2f2a] text-sm font-bold hover:bg-[#d4a94d] transition-colors"
              >
                Essayer gratuitement
              </Link>
              <Link
                href="/tarifs"
                className="inline-block px-8 py-4 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
