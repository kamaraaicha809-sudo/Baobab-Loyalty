import { Suspense } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import config from "@/config";
import { getSEOTags, renderBreadcrumbSchema } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Contact — Baobab Loyalty",
  description: "Une question sur Baobab Loyalty ? Contactez notre équipe par email ou via le formulaire. Réponse sous 24 à 48 heures ouvrées.",
  canonicalUrlRelative: "/contact",
});

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Baobab Loyalty",
  url: `https://${config.domainName}/contact`,
};

const contactChannels = [
  {
    label: "Support produit",
    email: "support@baobabloyalty.com",
    detail: "Questions sur votre compte, votre abonnement ou l'utilisation de la plateforme.",
  },
  {
    label: "Presse & médias",
    email: "presse@baobabloyalty.com",
    detail: "Demandes d'interview, communiqués ou ressources pour journalistes.",
  },
  {
    label: "Questions légales",
    email: "legal@baobabloyalty.com",
    detail: "Mentions légales, CGU/CGV, protection des données.",
  },
];

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      {renderBreadcrumbSchema([
        { name: "Accueil", urlRelative: "/" },
        { name: "Contact", urlRelative: "/contact" },
      ])}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Contact
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Une question ? <span className="text-[#1a2f2a]">Parlons-en.</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              Notre équipe est basée à Abidjan, Côte d&apos;Ivoire, et répond en français
              sous 24 à 48 heures ouvrées.
            </p>
          </div>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Form */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-[#2C2C2C] mb-6">Envoyez-nous un message</h2>
                <ContactForm />
              </div>

              {/* Channels */}
              <div className="lg:col-span-2 space-y-5">
                {contactChannels.map((channel) => (
                  <div
                    key={channel.email}
                    className="bg-white rounded-2xl border border-slate-100 p-5"
                  >
                    <p className="text-xs font-semibold text-[#1a2f2a] uppercase tracking-widest mb-2">
                      {channel.label}
                    </p>
                    <a
                      href={`mailto:${channel.email}`}
                      className="text-sm font-semibold text-[#2C2C2C] hover:text-[#1a2f2a] transition-colors"
                    >
                      {channel.email}
                    </a>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{channel.detail}</p>
                  </div>
                ))}

                <div className="bg-[#1a2f2a] rounded-2xl p-5">
                  <p className="text-xs font-semibold text-[#EBC161] uppercase tracking-widest mb-2">
                    Envie de tester avant d&apos;écrire ?
                  </p>
                  <p className="text-sm text-white/80 mb-4 leading-relaxed">
                    Découvrez Baobab Loyalty en mode démonstration, sans carte bancaire.
                  </p>
                  <a
                    href="/demo"
                    className="inline-block text-sm font-semibold text-white underline underline-offset-4 hover:text-[#EBC161] transition-colors"
                  >
                    Voir la démo →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
