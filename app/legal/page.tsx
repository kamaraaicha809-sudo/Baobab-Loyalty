import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informations légales | Baobab Loyalty",
};

const pages = [
  {
    href: "/legal/mentions-legales",
    title: "Mentions légales",
    desc: "Informations sur l'éditeur du site, l'hébergeur et la propriété intellectuelle.",
  },
  {
    href: "/legal/cgu",
    title: "Conditions Générales d'Utilisation",
    desc: "Règles d'accès et d'utilisation de la plateforme Baobab Loyalty.",
  },
  {
    href: "/legal/confidentialite",
    title: "Politique de Confidentialité",
    desc: "Comment nous collectons, utilisons et protégeons vos données personnelles.",
  },
  {
    href: "/legal/cookies",
    title: "Politique de Cookies",
    desc: "Informations sur les cookies utilisés et comment les gérer.",
  },
  {
    href: "/legal/cgv",
    title: "Conditions Générales de Vente",
    desc: "Tarifs, paiements, garanties et conditions de résiliation.",
  },
];

export default function LegalIndexPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Informations légales</h1>
      <p className="text-slate-500 mb-10">
        Retrouvez ci-dessous l&apos;ensemble de nos documents légaux.
      </p>

      <div className="space-y-3">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="block p-5 rounded-xl border border-slate-200 hover:border-primary hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 group-hover:text-primary transition-colors mb-1">
                  {page.title}
                </h2>
                <p className="text-sm text-slate-500">{page.desc}</p>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
