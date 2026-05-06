'use client';

import Image from 'next/image';
import { formatNumber } from '@/lib/utils';
import type { TopUserItem } from '@/types/rankings';

interface UserTableProps {
  users: TopUserItem[];
  isFetching: boolean;
}

export default function UserTable({ users, isFetching }: UserTableProps) {
  if (users.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted">
            <th className="w-16 px-4 py-2.5">Rank</th>
            <th className="px-4 py-2.5">User</th>
            <th className="px-4 py-2.5 text-right">Followers</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.login}
              className={`border-b border-border/30 ${isFetching ? 'opacity-50' : ''}`}
            >
              <td className="px-4 py-2 text-sm text-muted">{user.rank}</td>
              <td className="px-4 py-2">
                <a
                  href={user.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
                >
                  <Image
                    src={user.avatarUrl}
                    alt={user.login}
                    className="h-5 w-5 rounded-full"
                    width={20}
                    height={20}
                  />
                  {user.login}
                </a>
              </td>
              <td className="px-4 py-2 text-right text-sm tabular-nums text-muted">
                {formatNumber(user.followers)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
