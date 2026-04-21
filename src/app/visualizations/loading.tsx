export default function VisualizationsLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-8 h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="h-80 w-full rounded-xl border border-border bg-surface" />
    </div>
  );
}
