import { Skeleton } from '@/components/ui/skeleton';

export default function RankingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
