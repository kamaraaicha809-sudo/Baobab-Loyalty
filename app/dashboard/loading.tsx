/**
 * Dashboard Loading State
 * 
 * Affiché automatiquement par Next.js pendant le chargement
 * des pages du dashboard (Suspense boundary).
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 bg-slate-200 rounded-lg w-64 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-48"></div>
      </div>

      {/* Card skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200">
        <div className="h-5 bg-slate-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-slate-100">
            <div className="h-4 bg-slate-100 rounded w-16"></div>
            <div className="h-4 bg-slate-100 rounded w-40"></div>
          </div>
          <div className="flex justify-between py-3 border-b border-slate-100">
            <div className="h-4 bg-slate-100 rounded w-24"></div>
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
          </div>
        </div>
      </div>

      {/* Info card skeleton */}
      <div className="bg-slate-100 rounded-xl sm:rounded-2xl p-6 h-24"></div>
    </div>
  );
}
