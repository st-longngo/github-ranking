import type { RepoItem, TopReposPage, TopUserItem, TopUsersPage, TopOrgItem, TopOrgsPage } from '@/types/rankings';
import type { GitHubRepoItem, GitHubSearchResponse, GitHubUserItem } from '@/types/github';
import { appCache } from '../lib/cache';
import { env } from '@/lib/env';
import { getAuthHeaders } from '@/lib/utils';
import { REPOS_CACHE_TTL_MS, TOP_REPOS_CACHE_TTL_MS } from '@/constants/cache';
import { TOP_REPOS_PER_PAGE, TOP_USERS_PER_PAGE } from '@/constants/pagination';

export { LANGUAGES } from '@/constants/languages';

type SearchResponse = GitHubSearchResponse<GitHubRepoItem>;
type SearchUsersResponse = GitHubSearchResponse<GitHubUserItem>;

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

export type TopRepoType = 'stars' | 'forks' | 'trending';

/**
 * Fetch top-ranked repositories by a single metric, with server-side pagination.
 * Each (type, page) combination is cached independently for 30 min.
 * 1 GitHub API call per request — safe to call without exhausting rate limit.
 */
export async function getTopRepos(type: TopRepoType, page = 1): Promise<TopReposPage> {
  const cacheKey = `github:top-repos:${type}:${page}`;
  const cached = appCache.get<TopReposPage>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) {
    return { repos: [], totalCount: 0, hasNextPage: false, isStale: true };
  }

  try {
    const date30dAgo = thirtyDaysAgo();
    const params = new URLSearchParams({
      per_page: String(TOP_REPOS_PER_PAGE),
      page: String(page),
      order: 'desc',
    });

    if (type === 'stars') {
      params.set('q', 'stars:>1000');
      params.set('sort', 'stars');
    } else if (type === 'forks') {
      params.set('q', 'forks:>100');
      params.set('sort', 'forks');
    } else {
      params.set('q', `pushed:>${date30dAgo} stars:>50`);
      params.set('sort', 'updated');
    }

    const res = await fetch(`${env.GITHUB_API_BASE}/search/repositories?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (res.status === 403 || res.status === 429) return { repos: [], totalCount: 0, hasNextPage: false, isStale: true };
    if (!res.ok) return { repos: [], totalCount: 0, hasNextPage: false, isStale: true };

    const json = (await res.json()) as SearchResponse;
    const startRank = (page - 1) * TOP_REPOS_PER_PAGE + 1;

    const repos: RepoItem[] = json.items.map((item, i) => ({
      rank: startRank + i,
      fullName: item.full_name,
      htmlUrl: item.html_url,
      description: item.description,
      ownerAvatar: item.owner?.avatar_url ?? null,
      starCount: item.stargazers_count,
      forkCount: item.forks_count,
      pushedAt: item.pushed_at,
    }));

    const result: TopReposPage = {
      repos,
      totalCount: json.total_count,
      hasNextPage: json.items.length === TOP_REPOS_PER_PAGE,
      isStale: false,
    };

    appCache.set(cacheKey, result, TOP_REPOS_CACHE_TTL_MS);
    return result;
  } catch {
    return { repos: [], totalCount: 0, hasNextPage: false, isStale: true };
  }
}

export async function getLanguageRepos(languageName: string): Promise<RepoItem[]> {
  const cacheKey = `github:repos:${languageName.toLowerCase()}`;

  const cached = appCache.get<RepoItem[]>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) return [];

  try {
    const encodedLang = encodeURIComponent(languageName);
    const url = `${env.GITHUB_API_BASE}/search/repositories?q=language:${encodedLang}&sort=stars&order=desc&per_page=100`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = (await res.json()) as SearchResponse;
    const repos: RepoItem[] = json.items.map((item, i) => ({
      rank: i + 1,
      fullName: item.full_name,
      htmlUrl: item.html_url,
      description: item.description,
      starCount: item.stargazers_count,
      forkCount: item.forks_count,
      pushedAt: item.pushed_at,
    }));

    appCache.set(cacheKey, repos, REPOS_CACHE_TTL_MS);
    return repos;
  } catch {
    return [];
  }
}

// ─── Top Users / Organizations ────────────────────────────────

export async function getTopUsers(page = 1): Promise<TopUsersPage> {
  const cacheKey = `github:top-users:${page}`;
  const cached = appCache.get<TopUsersPage>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) {
    return { users: [], totalCount: 0, hasNextPage: false, isStale: true };
  }

  try {
    const params = new URLSearchParams({
      q: 'type:user followers:>1000',
      sort: 'followers',
      order: 'desc',
      per_page: String(TOP_USERS_PER_PAGE),
      page: String(page),
    });

    const res = await fetch(`${env.GITHUB_API_BASE}/search/users?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) return { users: [], totalCount: 0, hasNextPage: false, isStale: true };

    const json = (await res.json()) as SearchUsersResponse;
    const startRank = (page - 1) * TOP_USERS_PER_PAGE + 1;

    const users: TopUserItem[] = json.items.map((item, i) => ({
      rank: startRank + i,
      login: item.login,
      avatarUrl: item.avatar_url,
      htmlUrl: item.html_url,
      followers: item.followers ?? 0,
    }));

    const result: TopUsersPage = {
      users,
      totalCount: json.total_count,
      hasNextPage: json.items.length === TOP_USERS_PER_PAGE,
      isStale: false,
    };

    appCache.set(cacheKey, result, TOP_REPOS_CACHE_TTL_MS);
    return result;
  } catch {
    return { users: [], totalCount: 0, hasNextPage: false, isStale: true };
  }
}

export async function getTopOrgs(page = 1): Promise<TopOrgsPage> {
  const cacheKey = `github:top-orgs:${page}`;
  const cached = appCache.get<TopOrgsPage>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) {
    return { orgs: [], totalCount: 0, hasNextPage: false, isStale: true };
  }

  try {
    const params = new URLSearchParams({
      q: 'type:org followers:>1000',
      sort: 'followers',
      order: 'desc',
      per_page: String(TOP_USERS_PER_PAGE),
      page: String(page),
    });

    const res = await fetch(`${env.GITHUB_API_BASE}/search/users?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) return { orgs: [], totalCount: 0, hasNextPage: false, isStale: true };

    const json = (await res.json()) as SearchUsersResponse;
    const startRank = (page - 1) * TOP_USERS_PER_PAGE + 1;

    const orgs: TopOrgItem[] = json.items.map((item, i) => ({
      rank: startRank + i,
      login: item.login,
      avatarUrl: item.avatar_url,
      htmlUrl: item.html_url,
      followers: item.followers ?? 0,
    }));

    const result: TopOrgsPage = {
      orgs,
      totalCount: json.total_count,
      hasNextPage: json.items.length === TOP_USERS_PER_PAGE,
      isStale: false,
    };

    appCache.set(cacheKey, result, TOP_REPOS_CACHE_TTL_MS);
    return result;
  } catch {
    return { orgs: [], totalCount: 0, hasNextPage: false, isStale: true };
  }
}
