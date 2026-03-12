"use client";

/**
 * Dashboard Error Boundary
 * 
 * Capture les erreurs dans les pages du dashboard
 * sans affecter le layout (sidebar reste visible).
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Erreur de chargement
        </h2>
        
        <p className="text-slate-500 text-sm mb-6">
          {error?.message || "Impossible de charger cette page. Veuillez réessayer."}
        </p>

        <button 
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
