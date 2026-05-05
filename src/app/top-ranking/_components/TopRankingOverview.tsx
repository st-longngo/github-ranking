'use client';

import Link from 'next/link';
import { ChevronRight, Users, Building2, BookMarked } from 'lucide-react';
import UsersSection from '@/app/top-ranking/_components/UsersSection';
import OrgsSection from '@/app/top-ranking/_components/OrgsSection';
import ReposSection from '@/app/top-ranking/_components/ReposSection';
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Top Ranking</h1>
        <p className="mt-1 text-sm text-muted">
          Top GitHub users, organizations, and repositories ranked by popularity.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted" />
              <h2 className="text-lg font-semibold">Users</h2>
            </div>
            <Link
              href="/top-ranking/users"
              className="flex items-center gap-0.5 text-sm text-accent hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <UsersSection users={users} />
        </section>

        {/* Organizations */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted" />
              <h2 className="text-lg font-semibold">Organizations</h2>
            </div>
            <Link
              href="/top-ranking/organizations"
              className="flex items-center gap-0.5 text-sm text-accent hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <OrgsSection orgs={orgs} />
        </section>

        {/* Repositories */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-muted" />
              <h2 className="text-lg font-semibold">Repositories</h2>
            </div>
            <Link
              href="/top-ranking/repositories"
              className="flex items-center gap-0.5 text-sm text-accent hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ReposSection repos={repos} />
        </section>
      </div>
    </div>
  );
}
