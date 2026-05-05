'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { StarDataPoint } from '@/types/rankings';

interface ChartTooltipPayload {
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-surface px-3 py-2 text-xs shadow-lg ring-1 ring-border">
      <p className="text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-amber-500">★ {formatNumber(payload[0].value)}</p>
    </div>
  );
}

function formatXDate(dateStr: string): string {
  return String(new Date(dateStr).getFullYear());
}

interface StarHistoryTabProps {
  owner: string;
  name: string;
}

export default function StarHistoryTab({ owner, name }: StarHistoryTabProps) {
  const { data, isLoading } = useQuery<StarDataPoint[]>({
    queryKey: ['repo-stars', owner, name],
    queryFn: async () => {
      const res = await fetch(
        `/api/repo-stars?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}`,
      );
      if (!res.ok) return [];
      const json = (await res.json()) as { data: StarDataPoint[] };
      return json.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const points = data ?? [];

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  if (points.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Star className="h-8 w-8 text-muted" />
        <p className="mt-2 text-sm text-muted">No star history available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Star className="h-4 w-4 text-amber-500" />
        Star History
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={points} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="starGradientDetail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.12)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXDate}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="stars"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#starGradientDetail)"
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', stroke: 'transparent' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
