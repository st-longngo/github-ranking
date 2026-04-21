'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { TriangleAlert } from 'lucide-react';
import type { LanguageRanking, SortMetric } from '@/types/rankings';
import { METRIC_LABELS } from '@/types/rankings';
import { formatNumber, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CHART_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899',
];

type ChartTab = 'bar' | 'bubble' | 'donut';

interface VisualizationsClientProps {
  rankings: LanguageRanking[];
  isStale: boolean;
}

export default function VisualizationsClient({ rankings, isStale }: VisualizationsClientProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('bar');
  const [barMetric, setBarMetric] = useState<SortMetric>('composite');
  const [bubbleX, setBubbleX] = useState<SortMetric>('stars');
  const [bubbleY, setBubbleY] = useState<SortMetric>('activity');

  const TOP_N = 15;

  const barData = useMemo(() => {
    const sorted = [...rankings].sort((a, b) => {
      const av = barMetric === 'composite' ? a.compositeScore : a[barMetric === 'repositories' ? 'repositoryCount' : barMetric === 'stars' ? 'starCount' : barMetric === 'forks' ? 'forkCount' : 'activityCount'];
      const bv = barMetric === 'composite' ? b.compositeScore : b[barMetric === 'repositories' ? 'repositoryCount' : barMetric === 'stars' ? 'starCount' : barMetric === 'forks' ? 'forkCount' : 'activityCount'];
      return bv - av;
    });
    return sorted.slice(0, TOP_N).map(r => ({
      name: r.name,
      value: barMetric === 'composite'
        ? r.compositeScore
        : r[barMetric === 'repositories' ? 'repositoryCount' : barMetric === 'stars' ? 'starCount' : barMetric === 'forks' ? 'forkCount' : 'activityCount'],
    }));
  }, [rankings, barMetric]);

  const getMetricValue = (r: LanguageRanking, m: SortMetric): number => {
    if (m === 'composite') return r.compositeScore;
    if (m === 'repositories') return r.repositoryCount;
    if (m === 'stars') return r.starCount;
    if (m === 'forks') return r.forkCount;
    return r.activityCount;
  };

  const bubbleData = useMemo(
    () => rankings.map(r => ({ name: r.name, x: getMetricValue(r, bubbleX), y: getMetricValue(r, bubbleY), z: r.compositeScore })),
    [rankings, bubbleX, bubbleY],
  );

  const donutData = useMemo(() => {
    const top10 = rankings.slice(0, 10);
    const otherStars = rankings.slice(10).reduce((s, r) => s + r.starCount, 0);
    return [
      ...top10.map(r => ({ name: r.name, value: r.starCount })),
      { name: 'Others', value: otherStars },
    ];
  }, [rankings]);

  const TABS: { key: ChartTab; label: string }[] = [
    { key: 'bar', label: 'Bar Chart' },
    { key: 'bubble', label: 'Bubble Chart' },
    { key: 'donut', label: 'Donut Chart' },
  ];

  const METRIC_OPTS: { key: SortMetric; label: string }[] = [
    { key: 'composite', label: 'Score' },
    { key: 'repositories', label: 'Repos' },
    { key: 'stars', label: 'Stars' },
    { key: 'forks', label: 'Forks' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <div>
      {isStale && (
        <Alert variant="warning" className="mb-4 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>Showing estimated data — live GitHub data unavailable.</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2" role="tablist">
        {TABS.map(tab => (
          <Button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Bar chart */}
      {activeTab === 'bar' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Metric:</span>
              {METRIC_OPTS.map(m => (
                <Button
                  key={m.key}
                  variant={barMetric === m.key ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setBarMetric(m.key)}
                  className="h-7 px-2.5 text-xs"
                >
                  {m.label}
                </Button>
              ))}
            </div>
            <CardTitle className="text-sm font-semibold">Top {TOP_N} by {METRIC_LABELS[barMetric]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={barData} layout="vertical" margin={{ left: 72, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => formatNumber(v as number)}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v) => [formatNumber(v as number), METRIC_LABELS[barMetric]]}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bubble chart */}
      {activeTab === 'bubble' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">X axis:</span>
                {METRIC_OPTS.filter(m => m.key !== 'composite').map(m => (
                  <Button
                    key={m.key}
                    variant={bubbleX === m.key ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setBubbleX(m.key)}
                    className="h-7 px-2.5 text-xs"
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Y axis:</span>
                {METRIC_OPTS.filter(m => m.key !== 'composite').map(m => (
                  <Button
                    key={m.key}
                    variant={bubbleY === m.key ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setBubbleY(m.key)}
                    className="h-7 px-2.5 text-xs"
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted">Bubble size = composite score</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="x"
                  type="number"
                  name={METRIC_LABELS[bubbleX]}
                  tickFormatter={v => formatNumber(v as number)}
                  tick={{ fontSize: 11 }}
                  label={{ value: METRIC_LABELS[bubbleX], position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name={METRIC_LABELS[bubbleY]}
                  tickFormatter={v => formatNumber(v as number)}
                  tick={{ fontSize: 11 }}
                  label={{ value: METRIC_LABELS[bubbleY], angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <ZAxis dataKey="z" range={[40, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload as typeof bubbleData[0];
                    return (
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                        <p className="font-semibold">{d.name}</p>
                        <p>{METRIC_LABELS[bubbleX]}: {formatNumber(d.x)}</p>
                        <p>{METRIC_LABELS[bubbleY]}: {formatNumber(d.y)}</p>
                        <p>Score: {d.z.toFixed(1)}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={bubbleData} fill="#6366f1" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Donut chart */}
      {activeTab === 'donut' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Star share — top 10 languages vs others</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={150}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={i < CHART_COLORS.length ? CHART_COLORS[i] : '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [formatNumber(v as number), 'Stars']}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

