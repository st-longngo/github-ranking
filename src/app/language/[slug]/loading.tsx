export default function LanguageDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />

      {/* Hero */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Metric bars */}
      <div className="mb-8 space-y-4 rounded-xl border border-border bg-surface p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
