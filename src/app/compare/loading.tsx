export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-8 h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-4 h-10 w-full max-w-sm rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
