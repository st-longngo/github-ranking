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
  starCount: number;
  forkCount: number;
  pushedAt: string; // ISO string
}
