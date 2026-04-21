import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonTable() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading rankings">
      {/* Controls skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Category chips skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <div className="flex gap-8">
            {[6, 24, 10, 14, 10, 10, 10].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
        </div>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-8 border-b border-border px-4 py-3 last:border-0"
          >
            <Skeleton className="h-7 w-9" />
            <Skeleton
              className="h-4"
              style={{ width: `${[80, 96, 72, 88, 104, 68, 92, 76, 84, 112, 64, 100, 80, 76, 96][i]}px` }}
            />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
