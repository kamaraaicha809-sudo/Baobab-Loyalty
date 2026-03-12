/**
 * Admin Loading State
 * 
 * Affiché automatiquement pendant le chargement des pages admin.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 bg-slate-200 rounded-lg w-48 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-64"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-100 rounded w-24"></div>
              <div className="h-5 bg-slate-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-100 rounded w-24"></div>
              <div className="h-5 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action card skeleton */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200 h-24"></div>
    </div>
  );
}
