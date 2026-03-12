"use client";

/**
 * Global Error Boundary
 * 
 * Capture les erreurs au niveau du root layout.
 * Ce composant doit inclure ses propres balises <html> et <body>
 * car il remplace entièrement le layout en cas d'erreur.
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body className="bg-slate-50">
        <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-6 p-6">
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Erreur critique
            </h1>
            
            <p className="text-slate-500 text-sm mb-6">
              Une erreur inattendue est survenue. Veuillez rafraîchir la page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={reset}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                Réessayer
              </button>

              <a 
                href="/"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Accueil
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
