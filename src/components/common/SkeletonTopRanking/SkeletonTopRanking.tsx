import { Skeleton } from '@/components/ui/skeleton';

const ROW_WIDTHS = [80, 96, 72, 88, 104, 68, 92, 76, 84, 112, 64, 100, 80, 76, 96, 88, 72, 104, 68, 92];

export default function SkeletonTopRanking() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading top ranking">
      {/* Page heading skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-1 border-b border-border pb-1">
        {[40, 32, 48].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-md" style={{ width: `${w * 3}px` }} />
        ))}
      </div>

      {/* Stats row skeleton */}
      <Skeleton className="h-4 w-40" />

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {/* Header */}
        <div className="flex items-center gap-6 border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Rows */}
        {ROW_WIDTHS.map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-border px-4 py-3 last:border-0"
          >
            <Skeleton className="h-7 w-9 shrink-0" />
            <Skeleton className="h-4 shrink-0" style={{ width: `${w}px` }} />
            <Skeleton className="hidden h-4 w-48 sm:block" />
            <Skeleton className="ml-auto h-4 w-14" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>

      {/* Pagination controls skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
