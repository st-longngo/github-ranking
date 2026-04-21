import SkeletonTable from '@/components/common/SkeletonTable';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <SkeletonTable />
    </div>
  );
}
