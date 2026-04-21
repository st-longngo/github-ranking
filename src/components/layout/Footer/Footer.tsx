import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { COMPOSITE_WEIGHTS } from '@/types/rankings';

export default function Footer() {
  const weights = [
    { label: 'Stars', pct: COMPOSITE_WEIGHTS.stars * 100 },
    { label: 'Repos', pct: COMPOSITE_WEIGHTS.repositories * 100 },
    { label: 'Activity', pct: COMPOSITE_WEIGHTS.activity * 100 },
    { label: 'Forks', pct: COMPOSITE_WEIGHTS.forks * 100 },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">

          {/* Connection status */}
          <div className="flex items-center gap-3 text-xs">
            <Badge variant="live" className="gap-1.5 font-medium">
              <span className="live-dot h-1.5 w-1.5" aria-hidden="true" />
              Connected
            </Badge>
            <Separator orientation="vertical" className="h-3" />
            <span className="text-muted">
              <a
                href="https://docs.github.com/en/rest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub REST API
              </a>
              {' '}· Refresh every 5 min
            </span>
          </div>

          {/* Score formula */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="mr-0.5 font-medium uppercase tracking-wider">Score =</span>
            {weights.map((w, i) => (
              <span key={w.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-border">+</span>}
                <code className="rounded border border-border bg-background px-1 py-0.5 font-mono">
                  {w.label} {w.pct}%
                </code>
              </span>
            ))}
          </div>

          <Link
            href="/compare"
            className="cursor-pointer text-xs text-accent transition-opacity hover:opacity-75 hover:underline"
          >
            Compare languages →
          </Link>
        </div>
      </div>
    </footer>
  );
}

