export default function TemplatesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-slate-200 rounded w-32 mb-3"></div>
        <div className="h-8 bg-slate-200 rounded w-72 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-64"></div>
      </div>

      {/* Template cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-slate-200 rounded-lg shrink-0"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="h-3 bg-slate-100 rounded w-full"></div>
            <div className="h-3 bg-slate-100 rounded w-4/5"></div>
            <div className="h-8 bg-slate-200 rounded-lg w-full mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
