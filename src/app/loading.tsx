import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="hidden w-72 shrink-0 border-r border-border bg-surface lg:block">
        <div className="border-b border-border p-2">
          <div className="flex gap-1 rounded-md bg-background p-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 flex-1 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="space-y-0.5 p-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explorer skeleton */}
      <div className="flex-1">
        <div className="border-b border-border p-3">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="mt-4 h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
      </div>
    </div>
  );
}
