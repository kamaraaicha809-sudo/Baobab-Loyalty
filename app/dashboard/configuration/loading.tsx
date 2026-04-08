export default function ConfigurationLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-80"></div>
      </div>

      {/* Hotel info card skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="h-5 bg-slate-200 rounded w-40 mb-6"></div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-28"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ))}
      </div>

      {/* Room types card skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-44 mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-10 bg-slate-100 rounded-lg flex-1"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-28"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-28"></div>
          </div>
        ))}
      </div>

      {/* CSV import skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-36 mb-2"></div>
        <div className="h-24 bg-slate-100 rounded-xl w-full"></div>
        <div className="h-10 bg-slate-200 rounded-lg w-40"></div>
      </div>
    </div>
  );
}
