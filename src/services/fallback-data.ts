import type { LanguageMetrics } from '@/types/rankings';
import { toLanguageSlug } from '../lib/utils';

// Pre-computed approximate values (GitHub state, early 2025)
// Used as fallback when GitHub API is unavailable or TOKEN is not configured.
const RAW_FALLBACK: Omit<LanguageMetrics, 'slug'>[] = [
  { name: 'JavaScript',  repositoryCount: 12_500_000, starCount: 8_200_000, forkCount: 3_100_000, activityCount: 92 },
  { name: 'Python',      repositoryCount: 10_800_000, starCount: 9_400_000, forkCount: 3_400_000, activityCount: 96 },
  { name: 'TypeScript',  repositoryCount:  5_300_000, starCount: 6_800_000, forkCount: 2_200_000, activityCount: 88 },
  { name: 'Java',        repositoryCount:  8_100_000, starCount: 5_200_000, forkCount: 2_600_000, activityCount: 74 },
  { name: 'C#',          repositoryCount:  4_200_000, starCount: 4_100_000, forkCount: 1_600_000, activityCount: 70 },
  { name: 'C++',         repositoryCount:  4_100_000, starCount: 4_300_000, forkCount: 1_700_000, activityCount: 68 },
  { name: 'Go',          repositoryCount:  3_100_000, starCount: 3_800_000, forkCount: 1_100_000, activityCount: 82 },
  { name: 'PHP',         repositoryCount:  3_600_000, starCount: 2_400_000, forkCount:   960_000, activityCount: 55 },
  { name: 'Ruby',        repositoryCount:  2_100_000, starCount: 2_100_000, forkCount:   820_000, activityCount: 48 },
  { name: 'Rust',        repositoryCount:  1_600_000, starCount: 3_200_000, forkCount:   740_000, activityCount: 85 },
  { name: 'Swift',       repositoryCount:  1_600_000, starCount: 2_200_000, forkCount:   620_000, activityCount: 52 },
  { name: 'Kotlin',      repositoryCount:  1_300_000, starCount: 1_600_000, forkCount:   420_000, activityCount: 60 },
  { name: 'Scala',       repositoryCount:    510_000, starCount: 1_100_000, forkCount:   310_000, activityCount: 38 },
  { name: 'C',           repositoryCount:  2_100_000, starCount: 2_600_000, forkCount:   840_000, activityCount: 45 },
  { name: 'Shell',       repositoryCount:  2_000_000, starCount: 1_600_000, forkCount:   520_000, activityCount: 72 },
  { name: 'Dart',        repositoryCount:    820_000, starCount: 1_100_000, forkCount:   340_000, activityCount: 65 },
  { name: 'R',           repositoryCount:    610_000, starCount:   540_000, forkCount:   210_000, activityCount: 30 },
  { name: 'Lua',         repositoryCount:    320_000, starCount:   440_000, forkCount:   160_000, activityCount: 28 },
  { name: 'Perl',        repositoryCount:    420_000, starCount:   310_000, forkCount:   110_000, activityCount: 18 },
  { name: 'Haskell',     repositoryCount:    210_000, starCount:   520_000, forkCount:   160_000, activityCount: 26 },
  { name: 'Elixir',      repositoryCount:    210_000, starCount:   430_000, forkCount:   110_000, activityCount: 34 },
  { name: 'Clojure',     repositoryCount:    160_000, starCount:   420_000, forkCount:   105_000, activityCount: 22 },
  { name: 'Erlang',      repositoryCount:    110_000, starCount:   310_000, forkCount:    98_000, activityCount: 20 },
  { name: 'Julia',       repositoryCount:    160_000, starCount:   430_000, forkCount:   155_000, activityCount: 32 },
  { name: 'F#',          repositoryCount:    105_000, starCount:   320_000, forkCount:   102_000, activityCount: 24 },
  { name: 'Crystal',     repositoryCount:     52_000, starCount:   220_000, forkCount:    82_000, activityCount: 20 },
  { name: 'Nim',         repositoryCount:     54_000, starCount:   215_000, forkCount:    72_000, activityCount: 18 },
  { name: 'Zig',         repositoryCount:     83_000, starCount:   320_000, forkCount:    64_000, activityCount: 42 },
  { name: 'Objective-C', repositoryCount:    420_000, starCount:   640_000, forkCount:   210_000, activityCount: 15 },
  { name: 'WebAssembly', repositoryCount:    105_000, starCount:   320_000, forkCount:   105_000, activityCount: 28 },
];

export const FALLBACK_METRICS: LanguageMetrics[] = RAW_FALLBACK.map(lang => ({
  ...lang,
  slug: toLanguageSlug(lang.name),
}));
