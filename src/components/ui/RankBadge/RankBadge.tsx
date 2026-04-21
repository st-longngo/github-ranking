import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md';
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-400 text-amber-900 ring-1 ring-amber-300',
  2: 'bg-zinc-300 text-zinc-700 ring-1 ring-zinc-200',
  3: 'bg-amber-700 text-amber-100 ring-1 ring-amber-600',
};

const RANK_ICONS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const style = RANK_STYLES[rank];
  const sizeClass = size === 'sm' ? 'h-5 min-w-7 text-xs' : 'h-7 min-w-9 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded px-1.5 font-bold tabular-nums',
        sizeClass,
        style ?? 'text-muted',
      )}
      title={`Rank ${rank}`}
      aria-label={`Rank ${rank}`}
    >
      {style && <span aria-hidden="true">{RANK_ICONS[rank]}</span>}
      {rank}
    </span>
  );
}
