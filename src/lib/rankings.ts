import type { LanguageMetrics, LanguageRanking, RankingResponse, NormalizedMetrics } from '@/types/rankings';
import { COMPOSITE_WEIGHTS, MIN_REPO_THRESHOLD } from '@/types/rankings';
import { getLanguageMetrics } from './github';
import { appCache } from './cache';

const COMPUTED_RANKINGS_CACHE_KEY = 'computed:rankings';
const COMPUTED_RANKINGS_TTL_MS = 30 * 60 * 1000; // match github.ts cache TTL

function minMaxNormalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map(v => ((v - min) / (max - min)) * 100);
}

function computeComposite(n: NormalizedMetrics): number {
  return (
    n.repositories * COMPOSITE_WEIGHTS.repositories +
    n.stars * COMPOSITE_WEIGHTS.stars +
    n.forks * COMPOSITE_WEIGHTS.forks +
    n.activity * COMPOSITE_WEIGHTS.activity
  );
}

function rankMetrics(metrics: LanguageMetrics[]): LanguageRanking[] {
  // Apply minimum repo threshold (BR-003)
  const qualifying = metrics.filter(m => m.repositoryCount >= MIN_REPO_THRESHOLD);

  // Normalize each dimension independently
  const normalizedRepos = minMaxNormalize(qualifying.map(m => m.repositoryCount));
  const normalizedStars = minMaxNormalize(qualifying.map(m => m.starCount));
  const normalizedForks = minMaxNormalize(qualifying.map(m => m.forkCount));
  const normalizedActivity = minMaxNormalize(qualifying.map(m => m.activityCount));

  const scored = qualifying.map((m, i) => {
    const normalized: NormalizedMetrics = {
      repositories: Math.round(normalizedRepos[i] * 100) / 100,
      stars: Math.round(normalizedStars[i] * 100) / 100,
      forks: Math.round(normalizedForks[i] * 100) / 100,
      activity: Math.round(normalizedActivity[i] * 100) / 100,
    };
    return {
      ...m,
      normalized,
      compositeScore: Math.round(computeComposite(normalized) * 100) / 100,
      rank: 0, // assigned below
    };
  });

  // Sort by composite score descending; break ties by star count (BR-002 + spec tie-breaker)
  scored.sort((a, b) =>
    b.compositeScore !== a.compositeScore
      ? b.compositeScore - a.compositeScore
      : b.starCount - a.starCount,
  );

  return scored.map((lang, i) => ({ ...lang, rank: i + 1 }));
}

/**
 * Returns computed LanguageRanking[] from cache when possible.
 * Falls back to fetching raw metrics → rankMetrics() on cache miss.
 * This is the hot path: both getRankings() and getLanguageRanking() use it.
 */
async function getComputedRankings(): Promise<{
  rankings: LanguageRanking[];
  isStale: boolean;
  rateLimitResetAt?: string;
}> {
  const cached = appCache.get<LanguageRanking[]>(COMPUTED_RANKINGS_CACHE_KEY);
  if (cached) return { rankings: cached, isStale: false };

  const { metrics, isStale, rateLimitResetAt } = await getLanguageMetrics();
  const rankings = rankMetrics(metrics);
  appCache.set(COMPUTED_RANKINGS_CACHE_KEY, rankings, COMPUTED_RANKINGS_TTL_MS);
  return { rankings, isStale, rateLimitResetAt };
}

export async function getRankings(): Promise<RankingResponse> {
  const { rankings, isStale, rateLimitResetAt } = await getComputedRankings();

  return {
    rankings,
    fetchedAt: new Date().toISOString(),
    isStale,
    ...(rateLimitResetAt && { rateLimitResetAt }),
  };
}

/**
 * Fetch the ranking for a single language by slug.
 * Uses the computed rankings cache — avoids re-running rankMetrics() on every detail page visit.
 * Also returns all rankings so the page can render related languages without a second fetch.
 */
export async function getLanguageRanking(slug: string): Promise<{
  language: LanguageRanking | null;
  allRankings: LanguageRanking[];
  isStale: boolean;
  rateLimitResetAt?: string;
}> {
  const { rankings, isStale, rateLimitResetAt } = await getComputedRankings();
  const language = rankings.find(r => r.slug === slug) ?? null;
  return { language, allRankings: rankings, isStale, rateLimitResetAt };
}

/** Find a language by slug and provide neighboring languages for "related" suggestions. */
export function findLanguageBySlug(
  rankings: LanguageRanking[],
  slug: string,
): LanguageRanking | undefined {
  return rankings.find(r => r.slug === slug);
}

/** Return languages with similar metric profiles (Euclidean distance in normalized space). */
export function getRelatedLanguages(
  rankings: LanguageRanking[],
  target: LanguageRanking,
  count = 5,
): LanguageRanking[] {
  return rankings
    .filter(r => r.slug !== target.slug)
    .map(r => ({
      ranking: r,
      distance: Math.sqrt(
        Math.pow(r.normalized.repositories - target.normalized.repositories, 2) +
        Math.pow(r.normalized.stars - target.normalized.stars, 2) +
        Math.pow(r.normalized.forks - target.normalized.forks, 2) +
        Math.pow(r.normalized.activity - target.normalized.activity, 2),
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ ranking }) => ranking);
}
