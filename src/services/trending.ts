import type {
  TrendingRepo,
  TrendingReposResponse,
  TrendingMode,
  RepoRelease,
  RepoReleasesResponse,
  RepoSearchResult,
  StarDataPoint,
  RepoDetailData,
} from '@/types/rankings';
import { appCache } from '../lib/cache';

const GITHUB_API_BASE = 'https://api.github.com';
const TRENDING_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
const RELEASES_CACHE_TTL_MS = 15 * 60 * 1000; // 15 min
const MAX_SIDEBAR_REPOS = 20;
const MAX_RELEASES = 10;

function getAuthHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { Accept: 'application/vnd.github+json' };
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function sevenDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

interface GitHubSearchItem {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  owner: { avatar_url: string };
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubSearchItem[];
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

function mapToTrendingRepo(item: GitHubSearchItem, rank: number, weeklyDelta: number): TrendingRepo {
  return {
    rank,
    fullName: item.full_name,
    htmlUrl: item.html_url,
    description: item.description,
    starCount: item.stargazers_count,
    forkCount: item.forks_count,
    pushedAt: item.pushed_at,
    ownerAvatar: item.owner.avatar_url,
    weeklyStarDelta: weeklyDelta,
  };
}

export async function getTrendingRepos(mode: TrendingMode): Promise<TrendingReposResponse> {
  const cacheKey = `trending:${mode}`;

  // Random mode skips cache to ensure fresh random results
  if (mode !== 'random') {
    const cached = appCache.get<TrendingReposResponse>(cacheKey);
    if (cached) return cached;
  }

  if (!process.env.GITHUB_TOKEN) {
    return { repos: [], mode, isStale: true };
  }

  try {
    const params = new URLSearchParams({
      per_page: String(MAX_SIDEBAR_REPOS),
      order: 'desc',
    });

    if (mode === 'weekly') {
      params.set('q', `created:>${sevenDaysAgo()} stars:>10`);
      params.set('sort', 'stars');
    } else if (mode === 'all-time') {
      params.set('q', 'stars:>1000');
      params.set('sort', 'stars');
    } else {
      // Random: fetch a random page of popular repos
      const randomPage = Math.floor(Math.random() * 10) + 1;
      params.set('q', 'stars:>100');
      params.set('sort', 'updated');
      params.set('page', String(randomPage));
    }

    const res = await fetch(`${GITHUB_API_BASE}/search/repositories?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      return { repos: [], mode, isStale: true };
    }

    const json = (await res.json()) as GitHubSearchResponse;

    const repos: TrendingRepo[] = json.items.map((item, i) =>
      mapToTrendingRepo(item, i + 1, mode === 'weekly' ? item.stargazers_count : 0),
    );

    const result: TrendingReposResponse = { repos, mode, isStale: false };

    if (mode !== 'random') {
      appCache.set(cacheKey, result, TRENDING_CACHE_TTL_MS);
    }

    return result;
  } catch {
    return { repos: [], mode, isStale: true };
  }
}

export async function getRepoReleases(owner: string, repo: string): Promise<RepoReleasesResponse> {
  const fullName = `${owner}/${repo}`;
  const cacheKey = `releases:${fullName}`;

  const cached = appCache.get<RepoReleasesResponse>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) {
    return { releases: [], repoFullName: fullName };
  }

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=${MAX_RELEASES}`,
      { headers: getAuthHeaders(), cache: 'no-store' },
    );

    if (!res.ok) {
      return { releases: [], repoFullName: fullName };
    }

    const json = (await res.json()) as GitHubRelease[];

    const releases: RepoRelease[] = json
      .filter(r => !r.draft)
      .slice(0, MAX_RELEASES)
      .map(r => ({
        tagName: r.tag_name,
        name: r.name,
        publishedAt: r.published_at,
        htmlUrl: r.html_url,
      }));

    const result: RepoReleasesResponse = { releases, repoFullName: fullName };
    appCache.set(cacheKey, result, RELEASES_CACHE_TTL_MS);
    return result;
  } catch {
    return { releases: [], repoFullName: fullName };
  }
}

export async function searchRepos(query: string): Promise<RepoSearchResult[]> {
  if (!query || query.length < 2) return [];
  if (!process.env.GITHUB_TOKEN) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      per_page: '5',
      sort: 'stars',
      order: 'desc',
    });

    const res = await fetch(`${GITHUB_API_BASE}/search/repositories?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = (await res.json()) as GitHubSearchResponse;

    return json.items.map(item => ({
      fullName: item.full_name,
      description: item.description,
      starCount: item.stargazers_count,
      ownerAvatar: item.owner.avatar_url,
    }));
  } catch {
    return [];
  }
}

const STAR_HISTORY_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const STAR_HISTORY_PER_PAGE = 100;
const STAR_HISTORY_MAX_SAMPLES = 10;

interface StargazerItem {
  starred_at: string;
}

function getStarHeaders(): Record<string, string> {
  return {
    ...(getAuthHeaders() as Record<string, string>),
    Accept: 'application/vnd.github.star+json',
  };
}

export async function getRepoStarHistory(
  owner: string,
  repo: string,
): Promise<StarDataPoint[]> {
  const fullName = `${owner}/${repo}`;
  const cacheKey = `star-history:${fullName}`;

  const cached = appCache.get<StarDataPoint[]>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) return [];

  try {
    // 1. Fetch repo info to get total star count
    const repoRes = await fetch(
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { headers: getAuthHeaders(), cache: 'no-store' },
    );
    if (!repoRes.ok) return [];

    const repoData = (await repoRes.json()) as { stargazers_count: number };
    const totalStars = repoData.stargazers_count;
    if (totalStars === 0) return [];

    // 2. Select pages to sample evenly across the full history
    const totalPages = Math.ceil(totalStars / STAR_HISTORY_PER_PAGE);
    const pages: number[] = [];
    if (totalPages <= STAR_HISTORY_MAX_SAMPLES) {
      for (let p = 1; p <= totalPages; p++) pages.push(p);
    } else {
      for (let i = 0; i < STAR_HISTORY_MAX_SAMPLES; i++) {
        const page = Math.round(1 + (i / (STAR_HISTORY_MAX_SAMPLES - 1)) * (totalPages - 1));
        pages.push(page);
      }
    }

    // 3. Fetch sampled pages in batches of 5
    const starHeaders = getStarHeaders();
    const points: StarDataPoint[] = [];
    const BATCH = 5;

    for (let i = 0; i < pages.length; i += BATCH) {
      const batch = pages.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map(async (page) => {
          const res = await fetch(
            `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stargazers?per_page=${STAR_HISTORY_PER_PAGE}&page=${page}`,
            { headers: starHeaders, cache: 'no-store' },
          );
          if (!res.ok) return null;
          const items = (await res.json()) as StargazerItem[];
          if (items.length === 0) return null;
          return {
            date: items[items.length - 1].starred_at.split('T')[0],
            stars: Math.min(page * STAR_HISTORY_PER_PAGE, totalStars),
          } satisfies StarDataPoint;
        }),
      );
      for (const r of results) {
        if (r) points.push(r);
      }
    }

    // 4. Sort and ensure last point reflects current total
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (points.length > 0 && points[points.length - 1].stars < totalStars) {
      points.push({ date: new Date().toISOString().split('T')[0], stars: totalStars });
    }

    if (points.length > 0) {
      appCache.set(cacheKey, points, STAR_HISTORY_CACHE_TTL_MS);
    }
    return points;
  } catch {
    return [];
  }
}

const REPO_DETAIL_CACHE_TTL_MS = 15 * 60 * 1000; // 15 min

interface GitHubRepoDetail {
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  created_at: string;
  pushed_at: string;
  owner: { login: string; avatar_url: string };
}

export async function getRepoDetail(owner: string, repo: string): Promise<RepoDetailData | null> {
  const fullName = `${owner}/${repo}`;
  const cacheKey = `repo-detail:${fullName}`;

  const cached = appCache.get<RepoDetailData>(cacheKey);
  if (cached) return cached;

  if (!process.env.GITHUB_TOKEN) return null;

  try {
    const repoRes = await fetch(
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { headers: getAuthHeaders(), cache: 'no-store' },
    );
    if (!repoRes.ok) return null;

    const repoData = (await repoRes.json()) as GitHubRepoDetail;

    // Contributor count via Link header pagination trick
    let contributorCount = 0;
    try {
      const contribRes = await fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=1&anon=true`,
        { headers: getAuthHeaders(), cache: 'no-store' },
      );
      if (contribRes.ok) {
        const linkHeader = contribRes.headers.get('Link');
        if (linkHeader) {
          const match = /page=(\d+)>; rel="last"/.exec(linkHeader);
          if (match) contributorCount = parseInt(match[1], 10);
        } else {
          const body = (await contribRes.json()) as unknown[];
          contributorCount = body.length;
        }
      }
    } catch {
      // contributor count is best-effort
    }

    // Weekly commit count (last 7 days)
    let weeklyPushCount = 0;
    try {
      const since = sevenDaysAgo();
      const commitsRes = await fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?since=${since}T00:00:00Z&per_page=100`,
        { headers: getAuthHeaders(), cache: 'no-store' },
      );
      if (commitsRes.ok) {
        const commits = (await commitsRes.json()) as unknown[];
        weeklyPushCount = commits.length;
      }
    } catch {
      // weekly push count is best-effort
    }

    // Weekly issues closed (last 7 days)
    let weeklyIssuesClosed = 0;
    try {
      const since = sevenDaysAgo();
      const issuesRes = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=repo:${owner}/${repo}+is:issue+is:closed+closed:>${since}&per_page=1`,
        { headers: getAuthHeaders(), cache: 'no-store' },
      );
      if (issuesRes.ok) {
        const issuesData = (await issuesRes.json()) as { total_count: number };
        weeklyIssuesClosed = issuesData.total_count ?? 0;
      }
    } catch {
      // weekly issues closed is best-effort
    }

    const result: RepoDetailData = {
      fullName: repoData.full_name,
      owner: repoData.owner.login,
      name: repoData.name,
      htmlUrl: repoData.html_url,
      description: repoData.description,
      ownerAvatar: repoData.owner.avatar_url,
      starCount: repoData.stargazers_count,
      forkCount: repoData.forks_count,
      contributorCount,
      language: repoData.language,
      license: repoData.license?.spdx_id ?? repoData.license?.name ?? null,
      createdAt: repoData.created_at,
      pushedAt: repoData.pushed_at,
      openIssuesCount: repoData.open_issues_count,
      weeklyPushCount,
      weeklyIssuesClosed,
    };

    appCache.set(cacheKey, result, REPO_DETAIL_CACHE_TTL_MS);
    return result;
  } catch {
    return null;
  }
}
