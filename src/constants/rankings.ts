import type { SortMetric } from '@/types/rankings';

/**
 * Composite score weights — must sum to 1.0.
 * formula: score = repos*0.25 + stars*0.30 + forks*0.20 + activity*0.25
 */
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
  Compiled:    ['C', 'C++', 'Rust', 'Go', 'Swift', 'Kotlin', 'Java', 'C#', 'Haskell', 'Crystal', 'Nim', 'Zig'],
  Interpreted: ['JavaScript', 'TypeScript', 'Python', 'Ruby', 'PHP', 'Perl', 'Lua'],
  Functional:  ['Haskell', 'Elixir', 'Clojure', 'Erlang', 'F#', 'Scala', 'Julia'],
  Systems:     ['C', 'C++', 'Rust', 'Go', 'Zig', 'WebAssembly'],
  Scripting:   ['Shell', 'Python', 'Ruby', 'Perl', 'Lua', 'JavaScript'],
  Mobile:      ['Swift', 'Kotlin', 'Dart', 'Objective-C', 'Java'],
};

/** Minimum repositories required to qualify for rankings (BR-003). */
export const MIN_REPO_THRESHOLD = 100;

/** 30 days in milliseconds — used for activity window calculations. */
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
