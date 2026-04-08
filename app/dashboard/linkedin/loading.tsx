export default function LinkedInLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-slate-200 rounded w-72 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-96"></div>
      </div>

      {/* Form skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-32"></div>
          <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-24"></div>
          <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-20"></div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg flex-1"></div>
            ))}
          </div>
        </div>
        <div className="h-10 bg-slate-200 rounded-lg w-40"></div>
      </div>

      {/* Output skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-32"></div>
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-4/5"></div>
        <div className="h-3 bg-slate-100 rounded w-3/5"></div>
      </div>
    </div>
  );
}
