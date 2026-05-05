import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import config from "@/config";

const keyFacts = [
  { value: "3", label: "pays actifs", detail: "Côte d'Ivoire, Sénégal, Cameroun" },
  { value: "10 min", label: "pour lancer une campagne", detail: "De l'import CSV au premier envoi WhatsApp" },
  { value: "90%+", label: "taux d'ouverture WhatsApp", detail: "Vs 20% pour l'email marketing" },
  { value: "3×", label: "plus de réservations directes", detail: "Constatés chez les hôteliers utilisateurs" },
  { value: "−35%", label: "de dépendance OTA", detail: "Après 3 mois d'utilisation" },
  { value: "FCFA", label: "facturation locale", detail: "Adapté au marché Afrique francophone" },
];

const pressReleases = [
  {
    id: "civ",
    country: "Côte d'Ivoire",
    date: "5 mai 2026",
    city: "Abidjan",
    flag: "🇨🇮",
    headline:
      "Baobab Loyalty lance sa solution de fidélisation hôtelière en Côte d'Ivoire : les hôteliers abidjanais reprennent le contrôle de leurs réservations directes",
    body: `ABIDJAN, le 5 mai 2026 — Baobab Loyalty, startup spécialisée dans la fidélisation clients pour hôtels africains, annonce le lancement officiel de sa plateforme en Côte d'Ivoire. La solution, accessible dès aujourd'hui aux hôteliers ivoiriens, permet de créer et d'envoyer des campagnes de réservation via WhatsApp en moins de 2 minutes — sans commission, directement depuis leur tableau de bord.

Les hôtels ivoiriens font face à une double pression : d'un côté, les plateformes de réservation en ligne (OTAs) comme Booking.com et Expedia qui prélèvent entre 15% et 20% de commission sur chaque réservation ; de l'autre, l'absence d'outils numériques adaptés au marché local, au FCFA et aux habitudes de communication africaines.

"En Côte d'Ivoire, plus de 91% des voyageurs d'affaires utilisent WhatsApp quotidiennement. Pourtant, aucun logiciel hôtelier ne permettait d'en faire un canal de fidélisation structuré. Baobab Loyalty comble ce manque avec une solution 100% pensée pour l'Afrique", déclare l'équipe fondatrice de Baobab Loyalty.

La plateforme permet aux hôtels d'importer leur base clients depuis un fichier Excel ou CSV, de segmenter automatiquement les clients inactifs depuis 3, 6 ou 9 mois, puis d'envoyer des offres personnalisées directement sur WhatsApp. Un tableau de bord en temps réel permet de suivre les réservations générées et les revenus en FCFA.

Les premiers hôtels utilisateurs à Abidjan constatent en moyenne un triplement de leurs réservations directes et une réduction de 35% de leur dépendance aux OTAs après trois mois d'utilisation.

Baobab Loyalty est disponible à partir de 39 000 FCFA par mois, sans engagement. Un accès gratuit en mode démo est proposé sans carte bancaire. La solution est déjà opérationnelle au Sénégal et au Cameroun.

###

À propos de Baobab Loyalty
Baobab Loyalty est une solution SaaS de fidélisation clients pour hôtels en Afrique francophone. Fondée pour répondre aux spécificités du marché hôtelier africain — WhatsApp, FCFA, clientèle d'affaires locale — la plateforme aide les hôteliers à reconquérir leurs clients inactifs et à générer des réservations directes sans passer par les OTAs. Disponible en Côte d'Ivoire, au Sénégal et au Cameroun.

Contact presse
Email : presse@baobabloyalty.com
Site : https://baobabloyalty.com/presse`,
  },
  {
    id: "sn",
    country: "Sénégal",
    date: "5 mai 2026",
    city: "Dakar",
    flag: "🇸🇳",
    headline:
      "Baobab Loyalty s'implante à Dakar et aide les hôteliers sénégalais à réduire leur dépendance aux plateformes de réservation en ligne",
    body: `DAKAR, le 5 mai 2026 — Baobab Loyalty, plateforme SaaS de fidélisation clients pour hôtels africains, annonce son déploiement officiel au Sénégal. La solution est désormais accessible aux hôteliers de Dakar, des Almadies et de tout le Sénégal, avec une facturation en FCFA et un support en français.

Le tourisme d'affaires à Dakar connaît une croissance soutenue. La capitale sénégalaise accueille chaque année des milliers de voyageurs professionnels, de délégations diplomatiques et de participants à des conférences régionales. Pourtant, la majorité des hôtels dakarois n'ont pas de dispositif structuré pour fidéliser ces clients après leur séjour.

"Dakar est l'une des villes africaines où WhatsApp est le plus utilisé dans le milieu professionnel. Les hôtels qui ne l'intègrent pas dans leur stratégie marketing passent à côté d'un levier majeur de fidélisation directe", explique l'équipe de Baobab Loyalty.

Grâce à Baobab Loyalty, les hôtels sénégalais peuvent identifier leurs clients inactifs, créer des offres personnalisées (réductions, upgrades, cocktails de bienvenue) et les envoyer directement sur WhatsApp en quelques clics. L'intelligence artificielle intégrée aide à rédiger des messages adaptés à chaque segment de clientèle.

Les hôtels utilisateurs constatent un taux d'ouverture supérieur à 90% pour leurs messages WhatsApp, contre moins de 20% pour les campagnes email classiques. Les réservations directes générées permettent d'économiser l'intégralité des commissions OTA sur ces transactions.

Baobab Loyalty est proposé à partir de 39 000 FCFA par mois. La plateforme est opérationnelle sans formation technique préalable — si vous savez utiliser Excel, vous savez utiliser Baobab Loyalty.

###

À propos de Baobab Loyalty
Baobab Loyalty est une solution SaaS de fidélisation clients pour hôtels en Afrique francophone. Fondée pour répondre aux spécificités du marché hôtelier africain — WhatsApp, FCFA, clientèle d'affaires locale — la plateforme aide les hôteliers à reconquérir leurs clients inactifs et à générer des réservations directes sans passer par les OTAs. Disponible en Côte d'Ivoire, au Sénégal et au Cameroun.

Contact presse
Email : presse@baobabloyalty.com
Site : https://baobabloyalty.com/presse`,
  },
  {
    id: "cm",
    country: "Cameroun",
    date: "5 mai 2026",
    city: "Douala",
    flag: "🇨🇲",
    headline:
      "Baobab Loyalty arrive au Cameroun : les hôtels de Douala et Yaoundé disposent enfin d'un outil de fidélisation adapté à leur marché",
    body: `DOUALA, le 5 mai 2026 — Baobab Loyalty, la plateforme de fidélisation hôtelière conçue pour l'Afrique, annonce son lancement officiel au Cameroun. Disponible immédiatement pour les hôtels de Douala et Yaoundé, la solution répond à un besoin longtemps ignoré par les logiciels marketing internationaux : permettre aux hôteliers camerounais de fidéliser leurs clients via WhatsApp, en FCFA, sans compétence technique.

Le marché hôtelier camerounais est l'un des plus dynamiques d'Afrique centrale. Douala, capitale économique et premier port du pays, accueille une clientèle d'affaires en forte croissance. Yaoundé, capitale administrative, reçoit délégations diplomatiques et fonctionnaires internationaux toute l'année. Pourtant, la plupart des hôtels de ces deux villes dépendent encore entièrement des OTAs pour leurs réservations, sans mécanisme de fidélisation propre.

"Les hôteliers camerounais nous disaient tous la même chose : ils avaient une base de centaines de clients satisfaits, mais aucun moyen de les recontacter. Baobab Loyalty leur donne cet outil en 10 minutes", souligne l'équipe fondatrice.

La plateforme s'intègre directement avec WhatsApp Business — le canal de communication dominant au Cameroun avec plus de 88% de pénétration chez les voyageurs d'affaires. Les campagnes de réactivation ciblent précisément les clients inactifs depuis 3, 6 ou 9 mois, avec des offres générées par intelligence artificielle et personnalisées selon le segment.

Dès les premiers mois d'utilisation, les hôtels camerounais partenaires ont généré en moyenne 12 à 22 réservations directes supplémentaires par campagne, sans passer par Booking.com ou Expedia.

Baobab Loyalty est accessible à partir de 39 000 FCFA par mois, sans engagement et sans frais d'installation. Un essai gratuit en mode démo est disponible sur baobabloyalty.com.

###

À propos de Baobab Loyalty
Baobab Loyalty est une solution SaaS de fidélisation clients pour hôtels en Afrique francophone. Fondée pour répondre aux spécificités du marché hôtelier africain — WhatsApp, FCFA, clientèle d'affaires locale — la plateforme aide les hôteliers à reconquérir leurs clients inactifs et à générer des réservations directes sans passer par les OTAs. Disponible en Côte d'Ivoire, au Sénégal et au Cameroun.

Contact presse
Email : presse@baobabloyalty.com
Site : https://baobabloyalty.com/presse`,
  },
];

const pressSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Page Presse — Baobab Loyalty",
  description:
    "Communiqués de presse, chiffres clés et contact médias de Baobab Loyalty, solution de fidélisation hôtelière pour l'Afrique francophone.",
  url: `https://${config.domainName}/presse`,
  publisher: {
    "@type": "Organization",
    name: "Baobab Loyalty",
    url: `https://${config.domainName}`,
  },
};

export default function PressePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pressSchema) }}
      />
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        {/* Hero */}
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold uppercase tracking-widest">
              Presse & Médias
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight mb-5">
              Baobab Loyalty dans{" "}
              <span className="text-[#1a2f2a]">les médias</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
              Retrouvez ici nos communiqués de presse, chiffres clés et ressources pour les
              journalistes couvrant l&apos;hôtellerie, la tech et l&apos;économie numérique en
              Afrique de l&apos;Ouest et centrale.
            </p>
            <a
              href="mailto:presse@baobabloyalty.com"
              className="inline-block px-7 py-3.5 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
            >
              Contacter le service presse
            </a>
          </div>
        </section>

        {/* Key facts */}
        <section className="py-16 sm:py-20 bg-[#1a2f2a]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Baobab Loyalty en chiffres
              </h2>
              <p className="text-[#a3c4b5] text-base">
                Données clés pour vos articles et publications.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {keyFacts.map((fact, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10"
                >
                  <p className="text-3xl font-bold text-[#EBC161] mb-1">{fact.value}</p>
                  <p className="text-white font-semibold text-sm mb-1">{fact.label}</p>
                  <p className="text-[#a3c4b5] text-xs leading-snug">{fact.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About boilerplate */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                  À propos de Baobab Loyalty
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Baobab Loyalty est une solution SaaS de fidélisation clients pour hôtels en
                  Afrique francophone. La plateforme permet aux hôteliers de segmenter
                  automatiquement leur base clients, de créer des campagnes WhatsApp ciblées et
                  de générer des réservations directes sans commission OTA.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Conçue spécifiquement pour le marché africain — WhatsApp comme canal
                  principal, facturation en FCFA, interface en français — Baobab Loyalty est
                  opérationnelle en Côte d&apos;Ivoire, au Sénégal et au Cameroun.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  La plateforme est accessible à partir de 39 000 FCFA par mois, sans
                  engagement, et fonctionnelle en moins de 10 minutes.
                </p>
              </div>
              <div className="bg-[#FDFDF9] rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-[#2C2C2C] mb-4 text-sm">Informations clés</h3>
                <dl className="space-y-3">
                  {[
                    { label: "Secteur", value: "SaaS / Hôtellerie / Tech for Africa" },
                    { label: "Marchés", value: "Côte d'Ivoire, Sénégal, Cameroun, Ghana" },
                    { label: "Canal principal", value: "WhatsApp Business API" },
                    { label: "Devise", value: "FCFA (XOF) — GHS pour le Ghana" },
                    { label: "Lancement", value: "2025" },
                    { label: "Site web", value: "baobabloyalty.com" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <dt className="text-xs font-semibold text-slate-400 w-28 shrink-0 pt-0.5">
                        {item.label}
                      </dt>
                      <dd className="text-xs text-slate-600 leading-snug">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Press releases */}
        <section className="py-16 sm:py-20 bg-[#F8F8F6]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
                Communiqués de presse
              </h2>
              <p className="text-slate-500 text-sm">
                Disponibles pour diffusion immédiate. Reproduction autorisée avec mention de la source.
              </p>
            </div>
            <div className="space-y-8">
              {pressReleases.map((pr) => (
                <article
                  key={pr.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 p-6 sm:p-8 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-[#1a2f2a]/6 flex items-center justify-center text-xl shrink-0">
                      {pr.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-[#1a2f2a] uppercase tracking-widest">
                          {pr.country}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{pr.date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#1a2f2a]/8 text-[#1a2f2a] text-xs font-semibold">
                          Pour diffusion immédiate
                        </span>
                      </div>
                      <h3 className="font-bold text-[#2C2C2C] text-sm sm:text-base leading-snug">
                        {pr.headline}
                      </h3>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-6 sm:p-8">
                    <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                      {pr.body}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Media contact */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-4">
              Contact presse
            </h2>
            <p className="text-slate-500 text-base sm:text-lg mb-8 leading-relaxed">
              Pour toute demande d&apos;interview, de visuels supplémentaires ou d&apos;informations
              complémentaires, contactez notre équipe presse.
            </p>
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:presse@baobabloyalty.com"
                className="inline-block px-8 py-4 rounded-xl bg-[#1a2f2a] text-white text-sm font-bold hover:bg-[#243d38] transition-colors"
              >
                presse@baobabloyalty.com
              </a>
              <Link
                href="/demo"
                className="inline-block px-8 py-4 rounded-xl border border-slate-200 text-[#2C2C2C] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Tester la plateforme
              </Link>
            </div>
            <p className="text-slate-400 text-xs mt-6">
              Réponse sous 24 heures ouvrées. Interviews disponibles en français et en anglais.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
