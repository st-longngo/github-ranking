export interface LanguageMetrics {
  name: string;
  slug: string;
  repositoryCount: number;
  starCount: number;
  forkCount: number;
  activityCount: number;
}

export interface NormalizedMetrics {
  repositories: number; // 0–100
  stars: number; // 0–100
  forks: number; // 0–100
  activity: number; // 0–100
}

export interface LanguageRanking extends LanguageMetrics {
  rank: number;
  compositeScore: number;
  normalized: NormalizedMetrics;
}

export interface RankingResponse {
  rankings: LanguageRanking[];
  fetchedAt: string; // ISO string — safe for serialization across RSC boundary
  isStale: boolean;
  /** ISO string — present when GitHub API rate limit was hit */
  rateLimitResetAt?: string;
}

export type SortMetric = 'composite' | 'repositories' | 'stars' | 'forks' | 'activity';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  metric: SortMetric;
  direction: SortDirection;
}

export const COMPOSITE_WEIGHTS = {
  repositories: 0.25,
  stars: 0.30,
  forks: 0.20,
  activity: 0.25,
} as const;

export const METRIC_LABELS: Record<SortMetric, string> = {
  composite: 'Score',
  repositories: 'Repositories',
  stars: 'Stars',
  forks: 'Forks',
  activity: 'Activity',
};

export const LANGUAGE_CATEGORIES: Record<string, string[]> = {
  Compiled: ['C', 'C++', 'Rust', 'Go', 'Swift', 'Kotlin', 'Java', 'C#', 'Haskell', 'Crystal', 'Nim', 'Zig'],
  Interpreted: ['JavaScript', 'TypeScript', 'Python', 'Ruby', 'PHP', 'Perl', 'Lua'],
  Functional: ['Haskell', 'Elixir', 'Clojure', 'Erlang', 'F#', 'Scala', 'Julia'],
  Systems: ['C', 'C++', 'Rust', 'Go', 'Zig', 'WebAssembly'],
  Scripting: ['Shell', 'Python', 'Ruby', 'Perl', 'Lua', 'JavaScript'],
  Mobile: ['Swift', 'Kotlin', 'Dart', 'Objective-C', 'Java'],
};

// Minimum repositories to qualify for rankings (BR-003)
export const MIN_REPO_THRESHOLD = 100;

export interface RepoItem {
  rank: number;
  fullName: string; // e.g. "vercel/next.js"
  htmlUrl: string;
  description: string | null;
  ownerAvatar?: string;
  starCount: number;
  forkCount: number;
  pushedAt: string; // ISO string
}

export interface TopReposPage {
  repos: RepoItem[];
  totalCount: number;
  hasNextPage: boolean;
  isStale: boolean;
}

// ─── Top Users / Organizations ────────────────────────────────
export interface TopUserItem {
  rank: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  followers: number;
}

export interface TopUsersPage {
  users: TopUserItem[];
  totalCount: number;
  hasNextPage: boolean;
  isStale: boolean;
}

export interface TopOrgItem {
  rank: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  followers: number;
}

export interface TopOrgsPage {
  orgs: TopOrgItem[];
  totalCount: number;
  hasNextPage: boolean;
  isStale: boolean;
}

// ─── Trending Repos (Sidebar) ─────────────────────────────────
export type TrendingMode = 'weekly' | 'all-time' | 'random';

export interface TrendingRepo {
  rank: number;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  starCount: number;
  forkCount: number;
  pushedAt: string;
  ownerAvatar: string;
  weeklyStarDelta: number;
}

export interface TrendingReposResponse {
  repos: TrendingRepo[];
  mode: TrendingMode;
  isStale: boolean;
}

// ─── Repository Releases (Explorer) ──────────────────────────
export interface RepoRelease {
  tagName: string;
  name: string | null;
  publishedAt: string;
  htmlUrl: string;
}

export interface RepoSearchResult {
  fullName: string;
  description: string | null;
  starCount: number;
  ownerAvatar: string;
}

export interface RepoReleasesResponse {
  releases: RepoRelease[];
  repoFullName: string;
}

export interface StarDataPoint {
  date: string;  // "YYYY-MM-DD"
  stars: number; // cumulative star count
}

// ─── Repository Detail Page ───────────────────────────────────
export interface RepoDetailData {
  fullName: string;
  owner: string;
  name: string;
  htmlUrl: string;
  description: string | null;
  ownerAvatar: string;
  starCount: number;
  forkCount: number;
  contributorCount: number;
  language: string | null;
  license: string | null;
  createdAt: string; // ISO string
  pushedAt: string;  // ISO string
  openIssuesCount: number;
  weeklyPushCount: number;
  weeklyIssuesClosed: number;
}

export interface NearbyRepo {
  rank: number;
  fullName: string;
  starCount: number;
  htmlUrl: string;
}
