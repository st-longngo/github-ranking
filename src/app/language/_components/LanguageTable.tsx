'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import type { LanguageSummary, LanguageSortColumn, SortDir } from '@/types/csvRankings';

interface Props {
  summaries: LanguageSummary[];
}

interface SortState {
  column: LanguageSortColumn;
  dir: SortDir;
}

const COLUMNS: { key: LanguageSortColumn; label: string; title: string }[] = [
  { key: 'compositeScore', label: 'Score', title: 'Weighted composite score (0–100)' },
  { key: 'totalStars', label: 'Total Stars', title: 'Sum of stars across top-100 repos' },
  { key: 'repoCount', label: 'Repos', title: 'Number of repos in snapshot (≤ 100)' },
  { key: 'totalForks', label: 'Total Forks', title: 'Sum of forks across top-100 repos' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span
        className="inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-bold text-gold"
        aria-label="Gold rank"
      >
        🥇
      </span>
    );
  if (rank === 2)
    return (
      <span
        className="inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-bold text-silver"
        aria-label="Silver rank"
      >
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span
        className="inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-bold text-bronze"
        aria-label="Bronze rank"
      >
        🥉
      </span>
    );
  return (
    <span className="inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-medium text-muted">
      {rank}
    </span>
  );
}

function SortIcon({ column, sort }: { column: LanguageSortColumn; sort: SortState }) {
  if (sort.column !== column) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  return sort.dir === 'desc' ? (
    <ArrowDown className="h-3.5 w-3.5" />
  ) : (
    <ArrowUp className="h-3.5 w-3.5" />
  );
}

function sortSummaries(
  summaries: LanguageSummary[],
  sort: SortState,
): LanguageSummary[] {
  return [...summaries].sort((a, b) => {
    const factor = sort.dir === 'desc' ? -1 : 1;
    const diff = a[sort.column] - b[sort.column];
    return diff * factor;
  });
}

export default function LanguageTable({ summaries }: Props) {
  const router = useRouter();
  const [sort, setSort] = useState<SortState>({
    column: 'compositeScore',
    dir: 'desc',
  });

  function toggleSort(column: LanguageSortColumn) {
    setSort(prev =>
      prev.column === column
        ? { column, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { column, dir: 'desc' },
    );
  }

  const sorted = sortSummaries(summaries, sort);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs font-medium text-muted">
            <th className="px-4 py-3 w-14" scope="col">
              #
            </th>
            <th className="px-4 py-3" scope="col">
              Language
            </th>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-right"
                scope="col"
                title={col.title}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:text-foreground',
                    sort.column === col.key ? 'text-foreground' : 'text-muted',
                  )}
                  aria-sort={
                    sort.column === col.key
                      ? sort.dir === 'desc'
                        ? 'descending'
                        : 'ascending'
                      : 'none'
                  }
                >
                  {col.label}
                  <SortIcon column={col.key} sort={sort} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(lang => (
            <tr
              key={lang.language}
              className="border-b border-border transition-colors last:border-0 hover:bg-surface/60 cursor-pointer"
              onClick={() => router.push(`/language/${lang.slug}`)}
            >
              <td className="px-4 py-3">
                <RankBadge rank={lang.rank} />
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                <Link
                  href={`/language/${lang.slug}`}
                  className="hover:text-accent transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {lang.language}
                </Link>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    sort.column === 'compositeScore'
                      ? 'bg-accent/10 text-accent'
                      : 'text-foreground',
                  )}
                >
                  {lang.compositeScore.toFixed(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {formatNumber(lang.totalStars)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {formatNumber(lang.repoCount)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {formatNumber(lang.totalForks)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
