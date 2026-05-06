import type { LanguageMetrics, RepoItem, TopReposPage, TopUserItem, TopUsersPage, TopOrgItem, TopOrgsPage } from '@/types/rankings';
import { appCache } from '../lib/cache';
import { FALLBACK_METRICS } from './fallback-data';
import { GitHubApiError, RateLimitError } from '../lib/errors';
import { toLanguageSlug } from '../lib/utils';

const GITHUB_API_BASE = 'https://api.github.com';

// Per-language SWR cache settings
// Fresh window: serve as-is. After freshUntil, serve stale + trigger background refresh.
const LANG_FRESH_TTL_MS = 5 * 60 * 1000;    // 5 min
const LANG_STALE_TTL_MS = 55 * 60 * 1000;   // 55 min grace → 60 min total lifetime

// Rate-limit check is cached briefly to avoid hammering /rate_limit on concurrent cold-starts
const RATE_LIMIT_CACHE_KEY = 'github:rate-limit';
const RATE_LIMIT_CACHE_TTL_MS = 30 * 1000; // 30 seconds

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
  owner: { avatar_url: string };
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
  const cached = appCache.get<number>(RATE_LIMIT_CACHE_KEY);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      resources: { search: { remaining: number; reset: number } };
    };
    const remaining = json.resources.search.remaining;
    appCache.set(RATE_LIMIT_CACHE_KEY, remaining, RATE_LIMIT_CACHE_TTL_MS);
    return remaining;
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
    if (batchDelayMs > 0 && start + limit < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, batchDelayMs));
    }
  }

  return results;
}

/** Cache key for a single language's raw metrics. */
function langCacheKey(name: string): string {
  return `github:lang:${name}`;
}

// Per-language in-flight deduplication — concurrent requests for the same language share one fetch
const langInFlight = new Map<string, Promise<LanguageMetrics>>();

/** Fetch one language from GitHub, deduplicating concurrent calls. */
function fetchLanguage(lang: string): Promise<LanguageMetrics> {
  const existing = langInFlight.get(lang);
  if (existing) return existing;

  const promise = searchRepos(lang).finally(() => langInFlight.delete(lang));
  langInFlight.set(lang, promise);
  return promise;
}

/**
 * Background SWR refresh: re-fetches stale languages, skips any already in-flight.
 * Rate-limit-aware: skips the entire refresh if quota is too low.
 */
async function refreshStaleLangs(langs: string[]): Promise<void> {
  const toRefresh = langs.filter(l => !langInFlight.has(l));
  if (toRefresh.length === 0) return;

  const quota = await checkRateLimit();
  if (quota !== null && quota < toRefresh.length) {
    console.warn(
      `[rankings] Background refresh skipped: quota (${quota}) < stale langs (${toRefresh.length})`,
    );
    return;
  }

  const tasks = toRefresh.map(lang => async () => {
    try {
      const metrics = await fetchLanguage(lang);
      appCache.set(langCacheKey(lang), metrics, LANG_FRESH_TTL_MS, LANG_STALE_TTL_MS);
    } catch (err) {
      console.warn(
        `[rankings] Background refresh failed for ${lang}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  });

  await withConcurrency(tasks, 5, 2_000);
}

/** Order metrics to match LANGUAGES declaration order, ensuring a stable result. */
function orderMetrics(metrics: LanguageMetrics[]): LanguageMetrics[] {
  const byName = new Map(metrics.map(m => [m.name, m]));
  return (LANGUAGES as readonly string[])
    .map(l => byName.get(l))
    .filter((m): m is LanguageMetrics => m !== undefined);
}

export async function getLanguageMetrics(): Promise<{
  metrics: LanguageMetrics[];
  isStale: boolean;
  rateLimitResetAt?: string;
}> {
  // ── Step 1: Categorize all languages by cache freshness ────────────────────
  const freshMetrics: LanguageMetrics[] = [];
  const staleMetrics: LanguageMetrics[] = [];
  const staleLangs: string[] = [];
  const missingLangs: string[] = [];

  for (const lang of LANGUAGES) {
    const result = appCache.getWithStatus<LanguageMetrics>(langCacheKey(lang));
    if (!result) {
      missingLangs.push(lang);
    } else if (result.status === 'fresh') {
      freshMetrics.push(result.value);
    } else {
      staleMetrics.push(result.value);
      staleLangs.push(lang);
    }
  }

  // ── Step 2: Fast path — everything is cached (fresh or stale) ─────────────
  // Serve immediately; trigger background refresh for stale entries (non-blocking)
  if (missingLangs.length === 0) {
    if (staleLangs.length > 0) {
      void refreshStaleLangs(staleLangs);
    }
    return {
      metrics: orderMetrics([...freshMetrics, ...staleMetrics]),
      isStale: false,
    };
  }

  // ── Step 3: No token — use hardcoded fallback for missing languages ─────────
  if (!process.env.GITHUB_TOKEN) {
    console.warn('[rankings] GITHUB_TOKEN not set — using fallback data for missing languages');
    const fallback = missingLangs
      .map(l => FALLBACK_METRICS.find(m => m.name === l))
      .filter((m): m is LanguageMetrics => m !== undefined);
    return {
      metrics: orderMetrics([...freshMetrics, ...staleMetrics, ...fallback]),
      isStale: true,
    };
  }

  // ── Step 4: Fetch missing languages inline (request waits for these) ────────
  const quota = await checkRateLimit();
  console.log(
    `[rankings] Fetching ${missingLangs.length} missing languages (quota: ${quota ?? 'unknown'})`,
  );

  // Only fetch as many as quota permits; fill the rest from hardcoded fallback
  const fetchable = quota === null ? missingLangs : missingLangs.slice(0, quota);
  const unfetchable = quota === null ? [] : missingLangs.slice(quota);

  let rateLimitResetAt: string | undefined;
  const fetchedMetrics: LanguageMetrics[] = [];
  const fallbackMetrics: LanguageMetrics[] = unfetchable
    .map(l => FALLBACK_METRICS.find(m => m.name === l))
    .filter((m): m is LanguageMetrics => m !== undefined);

  if (fetchable.length > 0) {
    const tasks = fetchable.map(lang => async () => {
      try {
        const metrics = await fetchLanguage(lang);
        appCache.set(langCacheKey(lang), metrics, LANG_FRESH_TTL_MS, LANG_STALE_TTL_MS);
        fetchedMetrics.push(metrics);
      } catch (err) {
        if (err instanceof RateLimitError) rateLimitResetAt = err.resetAt.toISOString();
        console.warn(
          `[rankings] Fetch failed for ${lang}:`,
          err instanceof Error ? err.message : String(err),
        );
        const fb = FALLBACK_METRICS.find(m => m.name === lang);
        if (fb) fallbackMetrics.push(fb);
      }
    });

    // 5 concurrent per batch, 2 s delay between batches (GitHub Search: 30 req/min limit)
    await withConcurrency(tasks, 5, 2_000);
  }

  // Trigger background refresh for stale entries (non-blocking)
  if (staleLangs.length > 0) {
    void refreshStaleLangs(staleLangs);
  }

  const isStale = fallbackMetrics.length > 0;
  return {
    metrics: orderMetrics([...freshMetrics, ...staleMetrics, ...fetchedMetrics, ...fallbackMetrics]),
    isStale,
    ...(rateLimitResetAt && { rateLimitResetAt }),
  };
}

const REPOS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TOP_REPOS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const TOP_REPOS_PER_PAGE = 100;

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

// ─── Top Users / Organizations ────────────────────────────────

interface SearchUserItem {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  followers: number;
}

interface SearchUsersResponse {
  total_count: number;
  items: SearchUserItem[];
}

const TOP_USERS_PER_PAGE = 100;

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

    const res = await fetch(`${GITHUB_API_BASE}/search/users?${params}`, {
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

    const res = await fetch(`${GITHUB_API_BASE}/search/users?${params}`, {
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
