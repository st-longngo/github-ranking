import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { CsvRepoRecord } from '@/types/csvRankings';
import type { GitHubRepoItem, GitHubSearchResponse } from '@/types/github';
import { env } from '@/lib/env';
import { LANGUAGES } from '@/constants/languages';
import { CHECKPOINT_BASE } from '@/constants/paths';

// ---------------------------------------------------------------------------
// Checkpoint helpers — persist per-language results so a re-run on the same
// day resumes where it left off instead of re-fetching already-completed langs.
// Files: data/rankings/checkpoint/<YYYY-MM-DD>/<Language>.json
// ---------------------------------------------------------------------------

function checkpointDir(date: string): string {
  return path.join(CHECKPOINT_BASE, date);
}

function checkpointFile(date: string, lang: string): string {
  return path.join(checkpointDir(date), `${lang}.json`);
}

async function saveCheckpoint(date: string, lang: string, records: CsvRepoRecord[]): Promise<void> {
  await fs.mkdir(checkpointDir(date), { recursive: true });
  await fs.writeFile(checkpointFile(date, lang), JSON.stringify(records), 'utf-8');
}

async function loadCheckpoint(date: string, lang: string): Promise<CsvRepoRecord[] | null> {
  try {
    const raw = await fs.readFile(checkpointFile(date, lang), 'utf-8');
    return JSON.parse(raw) as CsvRepoRecord[];
  } catch {
    return null;
  }
}

async function loadAllCheckpoints(date: string, langs: string[]): Promise<Map<string, CsvRepoRecord[]>> {
  const cached = new Map<string, CsvRepoRecord[]>();
  await Promise.all(
    langs.map(async lang => {
      const records = await loadCheckpoint(date, lang);
      if (records) cached.set(lang, records);
    }),
  );
  return cached;
}


/**
 * Parse CRON_SECRET env var — supports comma-separated list of tokens for rotation.
 * Example: CRON_SECRET=ghp_token1,ghp_token2
 */
function loadTokens(): string[] {
  const raw = env.CRON_SECRET;
  return raw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function buildHeaders(token: string | undefined): HeadersInit {
  const base: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (!token) return base;
  return { ...base, Authorization: `Bearer ${token}` };
}

/**
 * Shared mutable pointer tracking the currently active token index.
 * All concurrent fetch calls share the same reference via object mutation.
 */
interface TokenCursor {
  value: number;
}

/**
 * Fetch top-100 repos for one language with token rotation.
 *
 * Uses compare-and-set on the cursor to avoid race conditions when multiple
 * concurrent requests hit rate-limit at the same time:
 *  - Captures the token index BEFORE the fetch
 *  - Only advances the cursor if it hasn't already been advanced by another request
 *  - Retries with whatever token the cursor now points to
 *
 * Throws only when all tokens are exhausted.
 */
async function fetchReposForLanguage(
  lang: string,
  tokens: string[],
  cursor: TokenCursor,
): Promise<CsvRepoRecord[]> {
  const encodedLang = encodeURIComponent(lang);
  const url = `${env.GITHUB_API_BASE}/search/repositories?q=language:${encodedLang}&sort=stars&order=desc&per_page=100`;
  const maxIndex = Math.max(tokens.length - 1, 0);

  while (cursor.value <= maxIndex) {
    const tokenIndex = cursor.value; // capture index before async gap
    const token = tokens[tokenIndex] as string | undefined;

    const res = await fetch(url, { headers: buildHeaders(token), cache: 'no-store' });

    if (res.status === 403 || res.status === 429) {
      // Compare-and-set: only advance if no other concurrent request already moved past this token.
      // This prevents multiple simultaneous 403 responses from incrementing cursor more than once.
      if (cursor.value === tokenIndex) {
        cursor.value = tokenIndex + 1;
        console.warn(
          `[cronFetcher] Token[${tokenIndex}]${token ? ` (…${token.slice(-6)})` : ' (unauthenticated)'} rate-limited — rotating to token[${cursor.value}]`,
        );
      }
      // Retry with whatever token the cursor points to now (may have been advanced by us or a sibling)
      continue;
    }

    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} for language "${lang}"`);
    }

    const json = (await res.json()) as GitHubSearchResponse<GitHubRepoItem>;
    return json.items.map((item, i) => ({
      rank: i + 1,
      item: item.full_name,
      repoName: item.name,
      stars: item.stargazers_count,
      forks: item.forks_count,
      language: lang,
      repoDescription: item.description ?? '',
      lastCommit: item.pushed_at,
    }));
  }

  throw new Error(
    `All ${Math.max(tokens.length, 1)} token(s) exhausted for language "${lang}"`,
  );
}

/**
 * Fetch raw repo records for all supported languages with automatic token rotation
 * and per-run checkpoint caching.
 *
 * **Checkpoint behaviour** (resumes across invocations on the same day):
 *   - After each language is fetched successfully, its records are persisted to
 *     `data/rankings/checkpoint/<YYYY-MM-DD>/<Language>.json`.
 *   - On startup all existing checkpoint files for today are loaded. Languages that
 *     already have a checkpoint are served from disk — no API call is made.
 *   - Only the remaining (un-cached) languages hit the GitHub API, reducing token
 *     consumption when the cron is re-triggered after a partial failure.
 *
 * GITHUB_TOKEN supports a comma-separated list of PATs for rotation:
 *   GITHUB_TOKEN=ghp_primaryToken,ghp_secondaryToken
 *
 * Requests are processed sequentially (one language at a time) to avoid concurrent
 * rate-limit hits. A 1-second delay between API requests stays well within the
 * 30 req/min GitHub Search API limit.
 */
export async function fetchAllLanguagesRaw(): Promise<{
  records: CsvRepoRecord[];
  errors: string[];
  tokensUsed: number;
  fromCache: number;
}> {
  const tokens = loadTokens();
  const cursor: TokenCursor = { value: 0 };
  const errors: string[] = [];
  const allRecords: CsvRepoRecord[] = [];
  const langs = [...LANGUAGES];

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Load any languages already checkpointed for today's run
  const cached = await loadAllCheckpoints(today, langs);
  const toFetch = langs.filter(l => !cached.has(l));

  console.log(
    `[cronFetcher] Starting for ${langs.length} languages — ` +
    `${cached.size} from cache, ${toFetch.length} to fetch — ` +
    `${Math.max(tokens.length, 1)} token(s)`,
  );

  // Seed allRecords with already-checkpointed data
  for (const [lang, records] of cached) {
    allRecords.push(...records);
    console.log(`[cronFetcher] ⚡ ${lang} — ${records.length} repos (from checkpoint)`);
  }

  // Fetch only the languages that don't have a checkpoint yet
  for (let i = 0; i < toFetch.length; i++) {
    const lang = toFetch[i]!;

    try {
      const records = await fetchReposForLanguage(lang, tokens, cursor);
      allRecords.push(...records);
      // Persist immediately so a subsequent re-run can skip this language
      await saveCheckpoint(today, lang, records);
      console.log(`[cronFetcher] ✓ ${lang} — ${records.length} repos (token[${cursor.value}])`);
    } catch (err) {
      const msg = `Failed to fetch ${lang}: ${
        err instanceof Error ? err.message : String(err)
      }`;
      errors.push(msg);
      console.error(`[cronFetcher] ✗ ${msg}`);
    }

    // 1-second delay between API requests: stays within 30 req/min limit
    if (i < toFetch.length - 1) {
      await new Promise<void>(resolve => setTimeout(resolve, 1_000));
    }
  }

  console.log(
    `[cronFetcher] Done — ${allRecords.length} records, ${errors.length} errors, ` +
    `token cursor ended at index ${cursor.value}`,
  );

  return { records: allRecords, errors, tokensUsed: cursor.value + 1, fromCache: cached.size };
}
