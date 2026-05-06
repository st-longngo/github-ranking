'use client';

import { cn } from '@/lib/utils';

interface MetricBarProps {
  label: string;
  value: string;
  normalised: number; // 0–100 position relative to all languages
  percentile: number; // 0–100 percentile rank
  highlighted?: boolean;
}

export default function MetricBar({
  label,
  value,
  normalised,
  percentile,
  highlighted = false,
}: MetricBarProps) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 space-y-2.5">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p
        className={cn(
          'text-2xl font-bold tabular-nums',
          highlighted ? 'text-accent' : 'text-foreground',
        )}
      >
        {value}
      </p>

      {/* Distribution bar */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-border"
        role="meter"
        aria-valuenow={normalised}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentile}th percentile`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            highlighted ? 'bg-accent' : 'bg-muted',
          )}
          style={{ width: `${normalised}%` }}
        />
        {/* Marker dot */}
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full border-2 border-background',
            highlighted ? 'bg-accent' : 'bg-foreground',
          )}
          style={{ left: `${normalised}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="text-xs text-muted">
        {percentile}
        <sup>th</sup> percentile
      </p>
    </div>
  );
}
