import { Skeleton } from '@/components/ui/skeleton';

export default function LanguageDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Back link */}
      <Skeleton className="mb-6 h-4 w-32" />

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Top repos */}
      <Skeleton className="mb-4 h-6 w-36" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
