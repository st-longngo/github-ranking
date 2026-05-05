'use client';

import Image from 'next/image';
import { formatNumber } from '@/lib/utils';
import type { TopOrgItem } from '@/types/rankings';

interface OrgTableProps {
  orgs: TopOrgItem[];
  isFetching: boolean;
}

export default function OrgTable({ orgs, isFetching }: OrgTableProps) {
  if (orgs.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted">
            <th className="w-16 px-4 py-2.5">Rank</th>
            <th className="px-4 py-2.5">Organization</th>
            <th className="px-4 py-2.5 text-right">Followers</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr
              key={org.login}
              className={`border-b border-border/30 ${isFetching ? 'opacity-50' : ''}`}
            >
              <td className="px-4 py-2 text-sm text-muted">{org.rank}</td>
              <td className="px-4 py-2">
                <a
                  href={org.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
                >
                  <Image
                    src={org.avatarUrl}
                    alt={org.login}
                    className="h-5 w-5 rounded-full"
                    width={20}
                    height={20}
                  />
                  {org.login}
                </a>
              </td>
              <td className="px-4 py-2 text-right text-sm tabular-nums text-muted">
                {formatNumber(org.followers)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
