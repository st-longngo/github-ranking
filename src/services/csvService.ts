import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CsvRepoRecord, LanguageSummary, CsvRankingData, LanguageDetailData } from '@/types/csvRankings';
import { COMPOSITE_WEIGHTS, THIRTY_DAYS_MS } from '@/constants/rankings';
import { DATA_DIR, LATEST_FILE, CSV_HEADER } from '@/constants/paths';
import { toLanguageSlug } from '@/lib/utils';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export function parseCsvRecords(content: string): CsvRepoRecord[] {
  const lines = content.trim().split('\n');
  // Skip header row
  return lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const [rank, item, repoName, stars, forks, language, repoDescription, lastCommit] =
        parseCsvLine(line);
      return {
        rank: parseInt(rank, 10) || 0,
        item: item ?? '',
        repoName: repoName ?? '',
        stars: parseInt(stars, 10) || 0,
        forks: parseInt(forks, 10) || 0,
        language: language ?? '',
        repoDescription: repoDescription ?? '',
        lastCommit: lastCommit ?? '',
      };
    });
}

export async function readLatestCsv(): Promise<{
  records: CsvRepoRecord[];
  dataDate: string;
} | null> {
  try {
    const [content, stat] = await Promise.all([
      fs.readFile(LATEST_FILE, 'utf-8'),
      fs.stat(LATEST_FILE),
    ]);
    const records = parseCsvRecords(content);
    const dataDate = stat.mtime.toISOString().split('T')[0];
    return { records, dataDate };
  } catch {
    return null;
  }
}

export async function writeCsvFile(records: CsvRepoRecord[], date: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const lines = [CSV_HEADER];
  for (const r of records) {
    lines.push(
      [
        r.rank,
        escapeCsvField(r.item),
        escapeCsvField(r.repoName),
        r.stars,
        r.forks,
        escapeCsvField(r.language),
        escapeCsvField(r.repoDescription),
        r.lastCommit,
      ].join(','),
    );
  }

  const content = lines.join('\n');
  const datedFile = path.join(DATA_DIR, `github-ranking-${date}.csv`);

  await fs.writeFile(datedFile, content, 'utf-8');
  await fs.copyFile(datedFile, LATEST_FILE);
}

function minMaxNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 50);
  return values.map(v => ((v - min) / (max - min)) * 100);
}

export function aggregateToLanguageSummaries(
  records: CsvRepoRecord[],
  dataDate: string,
): LanguageSummary[] {
  // Group by language
  const groups = new Map<string, CsvRepoRecord[]>();
  for (const r of records) {
    if (!r.language) continue;
    const existing = groups.get(r.language) ?? [];
    existing.push(r);
    groups.set(r.language, existing);
  }

  const cutoff = Date.now() - THIRTY_DAYS_MS;

  const rawMetrics = Array.from(groups.entries()).map(([language, repos]) => ({
    language,
    slug: toLanguageSlug(language),
    repoCount: repos.length,
    totalStars: repos.reduce((s, r) => s + r.stars, 0),
    totalForks: repos.reduce((s, r) => s + r.forks, 0),
    activityCount: repos.filter(r => new Date(r.lastCommit).getTime() >= cutoff).length,
  }));

  if (rawMetrics.length === 0) return [];

  // Normalize each dimension across all languages
  const repoNorm = minMaxNormalize(rawMetrics.map(m => m.repoCount));
  const starsNorm = minMaxNormalize(rawMetrics.map(m => m.totalStars));
  const forksNorm = minMaxNormalize(rawMetrics.map(m => m.totalForks));
  const activityNorm = minMaxNormalize(rawMetrics.map(m => m.activityCount));

  const scored = rawMetrics.map((m, i) => ({
    ...m,
    dataDate,
    compositeScore:
      Math.round(
        (repoNorm[i] * COMPOSITE_WEIGHTS.repositories +
          starsNorm[i] * COMPOSITE_WEIGHTS.stars +
          forksNorm[i] * COMPOSITE_WEIGHTS.forks +
          activityNorm[i] * COMPOSITE_WEIGHTS.activity) *
          100,
      ) / 100,
    rank: 0,
  }));

  scored.sort((a, b) =>
    b.compositeScore !== a.compositeScore
      ? b.compositeScore - a.compositeScore
      : b.totalStars - a.totalStars,
  );

  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}

export async function getLanguageRankingsFromCsv(): Promise<CsvRankingData | null> {
  const result = await readLatestCsv();
  if (!result) return null;

  const summaries = aggregateToLanguageSummaries(result.records, result.dataDate);
  return { summaries, dataDate: result.dataDate };
}

function computePercentile(value: number, allValues: number[]): number {
  const below = allValues.filter(v => v < value).length;
  return Math.round((below / (allValues.length - 1)) * 100);
}

function computeNorm(value: number, allValues: number[]): number {
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  if (max === min) return 50;
  return Math.round(((value - min) / (max - min)) * 100);
}

/** Euclidean distance between two language summaries across all normalised dimensions. */
function distance(a: LanguageSummary, b: LanguageSummary, all: LanguageSummary[]): number {
  const metrics: (keyof Pick<LanguageSummary, 'compositeScore' | 'totalStars' | 'totalForks' | 'repoCount' | 'activityCount'>)[] = [
    'compositeScore', 'totalStars', 'totalForks', 'repoCount', 'activityCount',
  ];
  return Math.sqrt(
    metrics.reduce((sum, key) => {
      const vals = all.map(s => s[key]);
      const an = computeNorm(a[key], vals);
      const bn = computeNorm(b[key], vals);
      return sum + (an - bn) ** 2;
    }, 0),
  );
}

export async function getLanguageDetail(slug: string): Promise<LanguageDetailData | null> {
  const result = await readLatestCsv();
  if (!result) return null;

  const summaries = aggregateToLanguageSummaries(result.records, result.dataDate);
  const summary = summaries.find(s => s.slug === slug);
  if (!summary) return null;

  const allComposite = summaries.map(s => s.compositeScore);
  const allStars = summaries.map(s => s.totalStars);
  const allForks = summaries.map(s => s.totalForks);
  const allRepos = summaries.map(s => s.repoCount);
  const allActivity = summaries.map(s => s.activityCount);

  const percentiles = {
    compositeScore: computePercentile(summary.compositeScore, allComposite),
    totalStars:     computePercentile(summary.totalStars, allStars),
    totalForks:     computePercentile(summary.totalForks, allForks),
    repoCount:      computePercentile(summary.repoCount, allRepos),
    activityCount:  computePercentile(summary.activityCount, allActivity),
  };

  const normalised = {
    compositeScore: computeNorm(summary.compositeScore, allComposite),
    totalStars:     computeNorm(summary.totalStars, allStars),
    totalForks:     computeNorm(summary.totalForks, allForks),
    repoCount:      computeNorm(summary.repoCount, allRepos),
    activityCount:  computeNorm(summary.activityCount, allActivity),
  };

  // 3–5 closest languages by Euclidean distance across all normalised dimensions
  const related = summaries
    .filter(s => s.slug !== slug)
    .map(s => ({ summary: s, dist: distance(summary, s, summaries) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
    .map(x => x.summary);

  // Top repos for this language from the CSV
  const topRepos = result.records
    .filter(r => r.language === summary.language)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 100);

  return { summary, percentiles, normalised, related, allSummaries: summaries, topRepos };
}
