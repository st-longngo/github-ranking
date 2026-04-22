import type { LanguageMetrics, RepoItem, TopReposPage } from '@/types/rankings';
import { appCache } from './cache';
import { FALLBACK_METRICS } from './fallback-data';
import { GitHubApiError, RateLimitError } from './errors';
import { toLanguageSlug } from './utils';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_KEY = 'github:language-metrics';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — GitHub data changes slowly

export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++',
  'Go', 'PHP', 'Ruby', 'Rust', 'Swift', 'Kotlin', 'Scala', 'C',
  'Shell', 'Dart', 'R', 'Lua', 'Perl', 'Haskell', 'Elixir',
  'Clojure', 'Erlang', 'Julia', 'F#', 'Crystal', 'Nim', 'Zig',
  'Objective-C', 'WebAssembly',
] as const;

interface SearchRepoItem {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
}

interface SearchResponse {
  total_count: number;
  items: SearchRepoItem[];
}

function getAuthHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { Accept: 'application/vnd.github+json' };
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

async function searchRepos(lang: string): Promise<LanguageMetrics> {
  const encodedLang = encodeURIComponent(lang);
  const url = `${GITHUB_API_BASE}/search/repositories?q=language:${encodedLang}&sort=stars&order=desc&per_page=100`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
    // No Next.js caching — we manage cache ourselves
    cache: 'no-store',
  });

  if (res.status === 403 || res.status === 429) {
    const resetHeader = res.headers.get('x-ratelimit-reset');
    const resetAt = resetHeader
      ? new Date(parseInt(resetHeader) * 1000)
      : new Date(Date.now() + 60_000);
    throw new RateLimitError(resetAt);
  }

  if (!res.ok) {
    throw new GitHubApiError(`GitHub API ${res.status} for language "${lang}"`);
  }

  const json = (await res.json()) as SearchResponse;
  const cutoff = new Date(thirtyDaysAgo());

  let starCount = 0;
  let forkCount = 0;
  let activityCount = 0;

  for (const item of json.items) {
    starCount += item.stargazers_count;
    forkCount += item.forks_count;
    if (new Date(item.pushed_at) >= cutoff) activityCount++;
  }

  return {
    name: lang,
    slug: toLanguageSlug(lang),
    repositoryCount: json.total_count,
    starCount,
    forkCount,
    activityCount,
  };
}

/** Check GitHub Search API rate limit — returns remaining quota, or null on failure. */
async function checkRateLimit(): Promise<number | null> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      resources: { search: { remaining: number; reset: number } };
    };
    return json.resources.search.remaining;
  } catch {
    return null;
  }
}

/** Run tasks with limited concurrency and a delay between batches to respect GitHub rate limits. */
async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
  batchDelayMs = 0,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);

  for (let start = 0; start < tasks.length; start += limit) {
    const batch = tasks.slice(start, start + limit);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    for (let j = 0; j < batchResults.length; j++) {
      results[start + j] = batchResults[j];
    }
    // Delay between batches to stay under rate limit
    if (batchDelayMs > 0 && start + limit < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, batchDelayMs));
    }
  }

  return results;
}

async function fetchFromGitHub(): Promise<LanguageMetrics[]> {
  if (!process.env.GITHUB_TOKEN) {
    console.warn('[rankings] GITHUB_TOKEN not set — using fallback data');
    return FALLBACK_METRICS;
  }

  // Check remaining rate limit before making 30 calls
  const quota = await checkRateLimit();
  console.log(`[rankings] GitHub Search API remaining quota: ${quota}`);
  if (quota !== null && quota < LANGUAGES.length) {
    console.warn(`[rankings] GitHub rate limit too low (${quota} remaining for ${LANGUAGES.length} languages) — using fallback`);
    return FALLBACK_METRICS;
  }

  // 5 concurrent requests per batch, 2s delay between batches (6 batches × 5 = 30 calls over ~10s)
  const tasks = LANGUAGES.map(lang => () => searchRepos(lang));
  const metrics = await withConcurrency(tasks, 5, 2_000);
  return metrics;
}

// Single in-flight fetch — prevents concurrent duplicate calls
let fetchInFlight: Promise<LanguageMetrics[]> | null = null;

export async function getLanguageMetrics(): Promise<{
  metrics: LanguageMetrics[];
  isStale: boolean;
  rateLimitResetAt?: string;
}> {
  const cached = appCache.get<LanguageMetrics[]>(CACHE_KEY);
  if (cached) return { metrics: cached, isStale: false };

  if (!fetchInFlight) {
    fetchInFlight = fetchFromGitHub().finally(() => {
      fetchInFlight = null;
    });
  }

  try {
    const metrics = await fetchInFlight;
    appCache.set(CACHE_KEY, metrics, CACHE_TTL_MS);
    return { metrics, isStale: false };
  } catch (error) {
    console.error('[rankings] GitHub fetch failed, using fallback:', error);
    const rateLimitResetAt =
      error instanceof RateLimitError ? error.resetAt.toISOString() : undefined;
    return { metrics: FALLBACK_METRICS, isStale: true, rateLimitResetAt };
  }
}

const REPOS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TOP_REPOS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const TOP_REPOS_PER_PAGE = 20;

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

    const res = await fetch(`${GITHUB_API_BASE}/search/repositories?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (res.status === 403 || res.status === 429) return { repos: [], totalCount: 0, hasNextPage: false, isStale: true };
    if (!res.ok) return { repos: [], totalCount: 0, hasNextPage: false, isStale: true };

    const json = (await res.json()) as SearchResponse;
    // GitHub Search API caps accessible results at 1000
    const accessibleTotal = Math.min(json.total_count, 1000);
    const startRank = (page - 1) * TOP_REPOS_PER_PAGE + 1;

    const repos: RepoItem[] = json.items.map((item, i) => ({
      rank: startRank + i,
      fullName: item.full_name,
      htmlUrl: item.html_url,
      description: item.description,
      starCount: item.stargazers_count,
      forkCount: item.forks_count,
      pushedAt: item.pushed_at,
    }));

    const result: TopReposPage = {
      repos,
      totalCount: json.total_count,
      hasNextPage: page * TOP_REPOS_PER_PAGE < accessibleTotal,
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
    const url = `${GITHUB_API_BASE}/search/repositories?q=language:${encodedLang}&sort=stars&order=desc&per_page=100`;

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
