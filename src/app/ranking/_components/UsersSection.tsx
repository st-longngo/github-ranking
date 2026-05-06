'use client';

import Image from 'next/image';
import { formatNumber } from '@/lib/utils';
import type { TopUserItem } from '@/types/rankings';

interface UsersSectionProps {
  users: TopUserItem[];
}

export default function UsersSection({ users }: UsersSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {users.map((user, i) => (
        <a
          key={user.login}
          href={user.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface ${i < users.length - 1 ? 'border-b border-border' : ''}`}
        >
          <span className="w-6 text-right font-mono text-sm text-muted">{user.rank}</span>
          <Image
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full"
            width={28}
            height={28}
          />
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {user.login}
          </span>
          <span className="text-sm tabular-nums text-muted">
            {formatNumber(user.followers)} followers
          </span>
        </a>
      ))}
    </div>
  );
}
