import { Skeleton } from '@/components/ui/skeleton';

export default function RepoDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Skeleton className="mb-6 h-4 w-24 rounded" />

      <div className="grid gap-6 lg:grid-cols-[200px_1fr_280px]">
        {/* Sidebar skeleton */}
        <div className="hidden space-y-2 lg:block">
          <Skeleton className="mb-3 h-3 w-20" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>

        {/* Centre skeleton */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex gap-4 border-b border-border pb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-5">
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right panel skeleton */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
