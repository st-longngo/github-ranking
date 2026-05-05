import { Skeleton } from '@/components/ui/skeleton';

export default function FeedSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {Array.from({ length: 10 }).map((_, i) => (
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
  );
}
