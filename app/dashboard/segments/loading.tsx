export default function SegmentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-slate-200 rounded w-32 mb-3"></div>
        <div className="h-8 bg-slate-200 rounded w-80 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-96"></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-5 w-5 bg-slate-200 rounded shrink-0 mt-0.5"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-36"></div>
                  <div className="h-3 bg-slate-100 rounded w-52"></div>
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <div className="h-8 bg-slate-200 rounded w-12 ml-auto"></div>
                <div className="h-3 bg-slate-100 rounded w-10 ml-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
