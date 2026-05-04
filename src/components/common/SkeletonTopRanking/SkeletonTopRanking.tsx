import { Skeleton } from '@/components/ui/skeleton';

const ROWS = 10;

// Varied widths to make names look natural
const USER_WIDTHS = [72, 88, 64, 96, 80, 68, 84, 76, 92, 70];
const REPO_WIDTHS = [112, 96, 128, 104, 88, 120, 100, 92, 116, 84];

function ColumnSkeleton({ nameWidths }: { nameWidths: number[] }) {
  return (
    <div className="flex flex-col">
      {/* Column title */}
      <Skeleton className="mb-4 h-7 w-32" />

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="w-12 pb-2">
              <Skeleton className="h-3.5 w-8" />
            </th>
            <th className="pb-2">
              <Skeleton className="h-3.5 w-16" />
            </th>
            <th className="pb-2 text-right">
              <Skeleton className="ml-auto h-3.5 w-14" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }).map((_, i) => (
            <tr key={i} className="border-b border-border/30">
              <td className="py-2">
                <Skeleton className="h-4 w-5" />
              </td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                  <Skeleton className="h-4" style={{ width: nameWidths[i] }} />
                </div>
              </td>
              <td className="py-2 text-right">
                <Skeleton className="ml-auto h-4 w-12" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show more link */}
      <Skeleton className="mt-4 h-4 w-24" />
    </div>
  );
}

export default function SkeletonTopRanking() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading top ranking">
      {/* Page heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* 3-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ColumnSkeleton nameWidths={USER_WIDTHS} />
        <ColumnSkeleton nameWidths={USER_WIDTHS.slice().reverse()} />
        <ColumnSkeleton nameWidths={REPO_WIDTHS} />
      </div>
    </div>
  );
}
