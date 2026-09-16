import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Accès limité | ${config.appName}`,
  description: `${config.appName} est actuellement en accès limité pendant la phase de préparation et de déploiement auprès de nos hôtels partenaires.`,
});

export default function AccesLimitePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <Image
            src={config.region === "europe" ? "/brand/loyavia-emblem.png" : "/brand/baobab-emblem.png"}
            alt={config.appName}
            width={720}
            height={720}
            className="w-12 h-12 rounded-xl mb-6 inline-block"
          />

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
            Accès limité
          </h1>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {config.appName} est actuellement en accès limité. Notre plateforme est
            temporairement fermée au public pendant la phase de préparation et de
            déploiement auprès de nos hôtels partenaires. Nous vous remercions pour
            votre patience. L&apos;ouverture officielle sera annoncée prochainement.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/beta"
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all text-sm sm:text-base"
            >
              Rejoindre la bêta hôteliers
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all text-sm sm:text-base"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
