// Grey placeholder shapes shown while data loads (inside <Suspense>), so
// the page keeps its layout instead of jumping when the content arrives.

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      aria-hidden
      className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-xl border border-slate-200">
          <div className="aspect-square bg-slate-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="h-6 w-1/3 rounded bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CategoryNavSkeleton() {
  return (
    <div aria-hidden className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-11 max-w-7xl animate-pulse items-center gap-6 overflow-hidden px-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-3 w-20 shrink-0 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function HeadingSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-3">
      <div className="h-8 w-56 rounded bg-slate-100" />
      <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
    </div>
  );
}