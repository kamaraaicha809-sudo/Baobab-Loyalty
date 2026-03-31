import Link from "next/link";
import Logo from "@/components/common/Logo";
import config from "@/config";

export const metadata = {
  title: "Accès Bêta Privé — Baobab Loyalty",
  description: "Rejoignez les premiers hôteliers à tester Baobab Loyalty gratuitement.",
  robots: "noindex, nofollow",
};

export default function BetaPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light mb-4 p-3">
            <Logo size={36} variant="white" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mt-2">
            {config.appName}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-2xl">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              ACCÈS BÊTA PRIVÉ
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-3">
            Testez Baobab Loyalty en avant-première
          </h1>
          <p className="text-slate-500 text-center text-sm sm:text-base mb-8">
            Vous avez été sélectionné pour faire partie des premiers hôteliers à utiliser notre plateforme.
          </p>

          {/* Détails */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary">
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Places limitées</p>
                <p className="text-xs text-slate-500">Seulement 20 hôteliers sélectionnés pour cette phase bêta.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Durée : 20 jours</p>
                <p className="text-xs text-slate-500">Accès complet pendant toute la durée de la bêta.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">100% gratuit</p>
                <p className="text-xs text-slate-500">Accès à toutes les fonctionnalités sans carte bancaire.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary">
                  <path d="M3.505 2.365A41.369 41.369 0 0 1 9 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 0 0-.577-.069 43.141 43.141 0 0 0-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 0 1 5 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914Z" />
                  <path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.141 2.841 2.705 2.932.302.017.605.032.91.044v2.5a.75.75 0 0 0 1.28.53l3.139-3.138a2.779 2.779 0 0 0 .469-.558 1.872 1.872 0 0 0 .07-.11c.276-.48.427-1.028.427-1.604V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0 0 14 6Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Votre avis compte</p>
                <p className="text-xs text-slate-500">On vous demande un retour simple sur votre expérience.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/signup?ref=beta"
            className="block w-full py-3.5 rounded-xl bg-primary text-white font-bold text-center hover:bg-primary-dark transition-all text-sm sm:text-base shadow-lg shadow-primary/20"
          >
            Rejoindre la bêta gratuitement
          </Link>

          <p className="text-center text-xs text-slate-400 mt-4">
            Déjà un compte ?{" "}
            <Link href="/signin" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Cette page est réservée aux bêta testeurs invités.
        </p>
      </div>
    </main>
  );
}
