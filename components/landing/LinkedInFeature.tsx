"use client";

import { useState } from "react";
import Link from "next/link";

const LINKEDIN_ICON_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

const ARROW_PATH = "M14 5l7 7m0 0l-7 7m7-7H3";
const BOLT_PATH = "M13 10V3L4 14h7v7l9-11h-7z";

const STATIC_LINKEDIN_POST = `Fidéliser ses clients, c'est l'un des leviers les plus puissants pour un hôtel.

Chez Hôtel Le Baobab, nous l'avons compris : nos clients qui reviennent génèrent 3x plus de valeur que les nouveaux.

C'est pourquoi nous avons mis en place une stratégie d'engagement personnalisée — des messages sur-mesure, au bon moment, pour les bonnes personnes.

Résultat : +20% de réservations directes en 3 mois.

Et si vous faisiez pareil ? 👇

#Hôtellerie #FidélisationClient #HôtelAfrique`;

const STATIC_WA_MESSAGE = `Bonjour Moussa ! Suite à notre offre spéciale du week-end, nous avons une surprise réservée à nos clients fidèles : -20% sur votre prochain séjour. Réservez avant vendredi pour en profiter. Hôtel Le Baobab vous attend !`;

function LinkedInIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={LINKEDIN_ICON_PATH} />
    </svg>
  );
}

function AiBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex-1 h-px bg-slate-200" />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={BOLT_PATH} />
        </svg>
        {label}
      </div>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function WhatsAppBubble({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-[#ECE5DD] p-3">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-tr-none bg-white shadow-sm px-3 py-2.5">
          <p className="text-slate-800 text-sm leading-relaxed">{message}</p>
          <p className="text-slate-400 text-[10px] text-right mt-1">22:22 ✓✓</p>
        </div>
      </div>
    </div>
  );
}

export default function LinkedInFeature() {
  const [activeTab, setActiveTab] = useState<"wa-to-li" | "li-to-wa">("wa-to-li");

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 py-20 sm:py-24">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-semibold uppercase tracking-wider mb-4">
            <LinkedInIcon className="w-3.5 h-3.5" />
            Nouvelle fonctionnalité
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Baobab Loyalty et LinkedIn : les deux ensemble
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Grâce à l&apos;IA, vos campagnes voyagent dans les deux sens — depuis Baobab Loyalty vers votre page LinkedIn, ou depuis un post LinkedIn directement vers vos clients ciblés dans Baobab.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveTab("wa-to-li")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === "wa-to-li"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-black">B</span>
            Baobab
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW_PATH} />
            </svg>
            <LinkedInIcon className="w-4 h-4" />
            LinkedIn
          </button>
          <button
            onClick={() => setActiveTab("li-to-wa")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === "li-to-wa"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <LinkedInIcon className="w-4 h-4" />
            LinkedIn
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW_PATH} />
            </svg>
            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-black">B</span>
            Baobab
          </button>
        </div>

        {/* Tab: Baobab → LinkedIn */}
        {activeTab === "wa-to-li" && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Votre message Baobab Loyalty
              </p>
              <WhatsAppBubble message="Bonjour Moussa, cela fait un moment que vous n'êtes pas venus nous voir à l'Hôtel Le Baobab ! Pour votre prochain séjour, nous avons une surprise : 20% de réduction sur votre prochaine chambre. Réservez avant la fin du mois pour en profiter." />
            </div>

            <AiBadge label="Baobab IA reformule pour LinkedIn" />

            <div className="rounded-xl border border-[#0A66C2]/30 bg-white overflow-hidden shadow-sm">
              {/* Header profil LinkedIn */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-700 shrink-0">
                  B
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Hôtel Le Baobab</p>
                  <p className="text-slate-400 text-xs">Hôtellerie · Côte d&apos;Ivoire · 1 234 abonnés</p>
                  <p className="text-slate-400 text-xs">À l&apos;instant</p>
                </div>
                <div className="ml-auto">
                  <LinkedInIcon className="w-6 h-6 text-[#0A66C2]" />
                </div>
              </div>
              {/* Corps du post */}
              <div className="px-5 py-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{STATIC_LINKEDIN_POST}</p>
              </div>
              {/* Actions LinkedIn */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-6">
                {[
                  { label: "J'aime", icon: "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" },
                  { label: "Commenter", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
                  { label: "Partager", icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" },
                ].map((action) => (
                  <button key={action.label} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0A66C2] text-xs font-semibold transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-primary font-medium flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Post prêt — copiez-le et publiez-le directement sur votre page LinkedIn.
            </p>
          </div>
        )}

        {/* Tab: LinkedIn → Baobab */}
        {activeTab === "li-to-wa" && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
              <p className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Votre post LinkedIn
              </p>
              <div className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {`Nous lançons une offre spéciale pour nos clients fidèles : -20% sur toutes les chambres ce week-end. Réservez maintenant !\n\n#HotelLeBaobab #OffreSpéciale`}
              </div>
            </div>

            <AiBadge label="Baobab IA adapte pour vos clients ciblés" />

            <div className="rounded-xl bg-[#ECE5DD] p-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Message WhatsApp généré par l&apos;IA
              </p>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-tr-none bg-white shadow-sm px-3 py-2.5">
                  <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{STATIC_WA_MESSAGE}</p>
                  <p className="text-slate-400 text-[10px] text-right mt-1">22:22 ✓✓</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Prêt à envoyer à vos clients ciblés</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choisissez votre segment (3 mois, 6 mois, tous...) et lancez la campagne en un clic.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/#tarifs"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Découvrir les plans
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW_PATH} />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
