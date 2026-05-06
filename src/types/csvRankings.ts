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
