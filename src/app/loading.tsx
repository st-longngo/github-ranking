import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Hero skeleton */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Search skeleton */}
      <div className="mx-auto mb-8 max-w-xl">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6 flex gap-1 border-b border-border pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-t-md" />
        ))}
      </div>

      {/* Feed skeleton */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-6">
            <Skeleton className="mt-1 h-4 w-6 rounded" />
            <Skeleton className="mt-0.5 h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
