'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { X, TriangleAlert } from 'lucide-react';
import type { LanguageRanking } from '@/types/rankings';
import { formatNumber, cn } from '@/lib/utils';
import RankBadge from '@/components/ui/RankBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

const MAX_SELECTIONS = 4;
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e'];

interface ComparisonClientProps {
  rankings: LanguageRanking[];
  isStale: boolean;
}

export default function ComparisonClient({ rankings, isStale }: ComparisonClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      rankings.filter(
        r =>
          !selected.includes(r.slug) &&
          r.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [rankings, search, selected],
  );

  const selectedRankings = useMemo(
    () => selected.map(slug => rankings.find(r => r.slug === slug)!).filter(Boolean),
    [selected, rankings],
  );

  function toggleAdd(slug: string) {
    if (selected.length < MAX_SELECTIONS) setSelected(prev => [...prev, slug]);
  }

  function removeLanguage(slug: string) {
    setSelected(prev => prev.filter(s => s !== slug));
  }

  // Transform for recharts RadarChart: [{metric, lang1: val, lang2: val}, ...]
  const radarData = useMemo(() => {
    if (selectedRankings.length < 2) return [];
    return [
      { metric: 'Repos', ...Object.fromEntries(selectedRankings.map(l => [l.name, l.normalized.repositories])) },
      { metric: 'Stars', ...Object.fromEntries(selectedRankings.map(l => [l.name, l.normalized.stars])) },
      { metric: 'Forks', ...Object.fromEntries(selectedRankings.map(l => [l.name, l.normalized.forks])) },
      { metric: 'Activity', ...Object.fromEntries(selectedRankings.map(l => [l.name, l.normalized.activity])) },
    ];
  }, [selectedRankings]);

  return (
    <div>
      {isStale && (
        <Alert variant="warning" className="mb-4 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>Showing estimated data — live GitHub data unavailable.</AlertDescription>
        </Alert>
      )}

      {/* Language selector */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {selectedRankings.map((lang, i) => (
            <span
              key={lang.slug}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
              style={{ borderColor: COLORS[i], color: COLORS[i] }}
            >
              {lang.name}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLanguage(lang.slug)}
                className="h-4 w-4 rounded-full p-0 opacity-70 hover:opacity-100"
                aria-label={`Remove ${lang.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
          {selected.length < MAX_SELECTIONS && (
            <div className="relative">
              <Input
                type="text"
                placeholder="Add language…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-44 rounded-full"
              />
              {search && filtered.length > 0 && (
                <ul className="absolute left-0 top-9 z-10 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
                  {filtered.slice(0, 8).map(lang => (
                    <li key={lang.slug}>
                      <button
                        onClick={() => { toggleAdd(lang.slug); setSearch(''); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <RankBadge rank={lang.rank} size="sm" />
                        {lang.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {selected.length === 0 && (
          <p className="mt-3 text-sm text-muted">
            Search above to select 2–4 languages to compare, or try:{' '}
            {['python', 'javascript', 'rust', 'go'].map(slug => (
              <button
                key={slug}
                onClick={() => toggleAdd(slug)}
                className="mr-1 underline hover:text-accent"
              >
                {rankings.find(r => r.slug === slug)?.name ?? slug}
              </button>
            ))}
          </p>
        )}
      </div>

      {selectedRankings.length >= 2 ? (
        <div className="space-y-8">
          {/* Radar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
                Normalized metrics (0–100)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {selectedRankings.map((lang, i) => (
                    <Radar
                      key={lang.slug}
                      name={lang.name}
                      dataKey={lang.name}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.15}
                      dot={false}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Side-by-side table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table className="min-w-120">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Metric</TableHead>
                  {selectedRankings.map((lang, i) => (
                    <TableHead key={lang.slug} className="text-right font-semibold" style={{ color: COLORS[i] }}>
                      <Link href={`/language/${lang.slug}`} className="hover:underline">
                        {lang.name}
                      </Link>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-surface/40">
                  <TableCell className="font-medium text-muted">Rank</TableCell>
                  {selectedRankings.map(lang => (
                    <TableCell key={lang.slug} className="text-right">
                      <RankBadge rank={lang.rank} size="sm" />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted">Composite score</TableCell>
                  {selectedRankings.map(lang => (
                    <TableCell key={lang.slug} className="text-right font-mono font-semibold text-accent tabular-nums">
                      {lang.compositeScore.toFixed(1)}
                    </TableCell>
                  ))}
                </TableRow>
                {(
                  [
                    { label: 'Repositories', key: 'repositoryCount' },
                    { label: 'Stars (top 100)', key: 'starCount' },
                    { label: 'Forks (top 100)', key: 'forkCount' },
                    { label: 'Active repos', key: 'activityCount' },
                  ] as const
                ).map(({ label, key }) => (
                  <TableRow key={key} className={cn('hover:bg-zinc-50 dark:hover:bg-zinc-800/30')}>
                    <TableCell className="font-medium text-muted">{label}</TableCell>
                    {selectedRankings.map(lang => (
                      <TableCell key={lang.slug} className="text-right font-mono tabular-nums">
                        {formatNumber(lang[key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : selected.length === 1 ? (
        <p className="text-sm text-muted">Add at least one more language to compare.</p>
      ) : null}
    </div>
  );
}
