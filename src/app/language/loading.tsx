import { Skeleton } from '@/components/ui/skeleton';

export default function LanguageLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Page header skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface" aria-busy="true" aria-label="Loading language rankings">
        {/* Header row */}
        <div className="border-b border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14 ml-auto" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {/* Data rows */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-border px-4 py-3.5 last:border-0"
          >
            <Skeleton className="h-6 w-9 rounded-md" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-14" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </main>
  );
}
