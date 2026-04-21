import { cn } from '@/lib/utils';

interface MetricBarProps {
  value: number; // normalized 0–100
  colorClass?: string;
  label?: string;
}

export default function MetricBar({
  value,
  colorClass = 'bg-primary',
  label,
}: MetricBarProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 100));

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${pct}%`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs tabular-nums text-muted">
        {pct}
      </span>
    </div>
  );
}
