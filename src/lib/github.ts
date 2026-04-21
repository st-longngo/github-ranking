import type { LanguageMetrics, RepoItem } from '@/types/rankings';
import { appCache } from './cache';
import { FALLBACK_METRICS } from './fallback-data';
import { GitHubApiError, RateLimitError } from './errors';
import { toLanguageSlug } from './utils';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_KEY = 'github:language-metrics';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

/** Run tasks with limited concurrency to respect GitHub's secondary rate limits. */
async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

async function fetchFromGitHub(): Promise<LanguageMetrics[]> {
  if (!process.env.GITHUB_TOKEN) {
    console.log('vao day chua')
    // Without a token, rate limit is 10 req/min — use fallback data
    console.warn('[rankings] GITHUB_TOKEN not set — using fallback data');
    return FALLBACK_METRICS;
  }

  const tasks = LANGUAGES.map(lang => () => searchRepos(lang));
  const metrics = await withConcurrency(tasks, 5);
  return metrics;
}

// Single in-flight fetch — prevents concurrent duplicate calls
let fetchInFlight: Promise<LanguageMetrics[]> | null = null;

export async function getLanguageMetrics(): Promise<{
  metrics: LanguageMetrics[];
  isStale: boolean;
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
    return { metrics: FALLBACK_METRICS, isStale: true };
  }
}

const REPOS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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
