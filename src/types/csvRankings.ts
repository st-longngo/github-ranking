/** One repository row as stored in the daily CSV snapshot. */
export interface CsvRepoRecord {
  rank: number;
  item: string;           // "owner/repo"
  repoName: string;
  stars: number;
  forks: number;
  language: string;
  repoDescription: string;
  lastCommit: string;     // ISO-8601
}

/** Aggregated per-language metrics derived from CSV records. */
export interface LanguageSummary {
  language: string;
  slug: string;
  repoCount: number;      // rows in CSV for this language (≤ 100)
  totalStars: number;
  totalForks: number;
  activityCount: number;  // repos with lastCommit >= 30 days ago
  compositeScore: number; // 0–100, weighted same formula as existing rankings
  rank: number;
  dataDate: string;       // YYYY-MM-DD from the CSV snapshot
}

export interface CsvRankingData {
  summaries: LanguageSummary[];
  dataDate: string;
}

export type LanguageSortColumn = 'compositeScore' | 'totalStars' | 'repoCount' | 'totalForks';
export type SortDir = 'asc' | 'desc';

/** Full data payload for a single language detail page. */
export interface LanguageDetailData {
  summary: LanguageSummary;
  /** Percentile rank (0–100) of each metric relative to all languages. */
  percentiles: {
    compositeScore: number;
    totalStars: number;
    totalForks: number;
    repoCount: number;
    activityCount: number;
  };
  /** Normalised 0–100 position of each metric relative to the full language set. */
  normalised: {
    compositeScore: number;
    totalStars: number;
    totalForks: number;
    repoCount: number;
    activityCount: number;
  };
  related: LanguageSummary[];
  allSummaries: LanguageSummary[];
  topRepos: CsvRepoRecord[];
}
