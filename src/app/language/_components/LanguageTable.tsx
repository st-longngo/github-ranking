'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { LANGUAGE_CATEGORIES } from '@/constants/rankings';
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

const ALL_CATEGORIES = Object.keys(LANGUAGE_CATEGORIES);

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
  const [nameFilter, setNameFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  function toggleSort(column: LanguageSortColumn) {
    setSort(prev =>
      prev.column === column
        ? { column, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { column, dir: 'desc' },
    );
  }

  function toggleCategory(category: string) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function clearFilters() {
    setNameFilter('');
    setSelectedCategories(new Set());
  }

  const hasActiveFilters = nameFilter.trim() !== '' || selectedCategories.size > 0;

  const filtered = useMemo(() => {
    return summaries.filter(lang => {
      const matchesName =
        nameFilter.trim() === '' ||
        lang.language.toLowerCase().includes(nameFilter.trim().toLowerCase());

      const matchesCategory =
        selectedCategories.size === 0 ||
        [...selectedCategories].some(cat =>
          LANGUAGE_CATEGORIES[cat]?.includes(lang.language),
        );

      return matchesName && matchesCategory;
    });
  }, [summaries, nameFilter, selectedCategories]);

  const sorted = useMemo(() => sortSummaries(filtered, sort), [filtered, sort]);

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Name search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by name…"
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {nameFilter && (
              <button
                type="button"
                onClick={() => setNameFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
                aria-label="Clear name filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-critical hover:text-critical sm:self-auto"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(category => {
            const isSelected = selectedCategories.has(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-surface text-muted hover:border-accent hover:text-foreground',
                )}
                aria-pressed={isSelected}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      {hasActiveFilters && (
        <p className="text-xs text-muted">
          Showing{' '}
          <span className="font-semibold text-foreground">{sorted.length}</span> of{' '}
          <span className="font-semibold text-foreground">{summaries.length}</span> languages
        </p>
      )}

      {/* Table */}
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
                  aria-sort={
                    sort.column === col.key
                      ? sort.dir === 'desc'
                        ? 'descending'
                        : 'ascending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:text-foreground',
                      sort.column === col.key ? 'text-foreground' : 'text-muted',
                    )}
                  >
                    {col.label}
                    <SortIcon column={col.key} sort={sort} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No languages match your filters.
                </td>
              </tr>
            ) : (
              sorted.map(lang => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
