'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import type { TopUsersPage, TopOrgsPage, TopReposPage } from '@/types/rankings';

interface TopRankingOverviewProps {
  initialUsers: TopUsersPage;
  initialOrgs: TopOrgsPage;
  initialRepos: TopReposPage;
}

const PREVIEW_COUNT = 10;

export default function TopRankingOverview({
  initialUsers,
  initialOrgs,
  initialRepos,
}: TopRankingOverviewProps) {
  const users = initialUsers.users.slice(0, PREVIEW_COUNT);
  const orgs = initialOrgs.orgs.slice(0, PREVIEW_COUNT);
  const repos = initialRepos.repos.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Top Ranking</h1>
        <p className="text-sm text-muted">
          Top GitHub users, organizations, and repositories ranked by stars.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users Column */}
        <RankingColumn title="Users" href="/top-ranking/users">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted">
                <th className="w-12 pb-2">Rank</th>
                <th className="pb-2">User</th>
                <th className="pb-2 text-right">Followers</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.login} className="border-b border-border/30">
                  <td className="py-2 text-sm text-muted">{user.rank}</td>
                  <td className="py-2">
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
                  <td className="py-2 text-right text-sm tabular-nums text-muted">
                    {formatNumber(user.followers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RankingColumn>

        {/* Organizations Column */}
        <RankingColumn title="Organizations" href="/top-ranking/organizations">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted">
                <th className="w-12 pb-2">Rank</th>
                <th className="pb-2">Organization</th>
                <th className="pb-2 text-right">Followers</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.login} className="border-b border-border/30">
                  <td className="py-2 text-sm text-muted">{org.rank}</td>
                  <td className="py-2">
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
                  <td className="py-2 text-right text-sm tabular-nums text-muted">
                    {formatNumber(org.followers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RankingColumn>

        {/* Repositories Column */}
        <RankingColumn title="Repositories" href="/top-ranking/repositories">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted">
                <th className="w-12 pb-2">Rank</th>
                <th className="pb-2">Repository</th>
                <th className="pb-2 text-right">Stars</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <tr key={repo.fullName} className="border-b border-border/30">
                  <td className="py-2 text-sm text-muted">{repo.rank}</td>
                  <td className="py-2">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-accent"
                    >
                      {repo.fullName}
                    </a>
                  </td>
                  <td className="py-2 text-right text-sm tabular-nums text-muted">
                    {formatNumber(repo.starCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RankingColumn>
      </div>
    </div>
  );
}

function RankingColumn({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
      >
        Show more
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
