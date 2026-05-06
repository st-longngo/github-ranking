/**
 * Centralised server-side environment variables.
 *
 * All process.env reads are collected here so the rest of the codebase
 * never reaches for process.env directly — changes to env var names only
 * need to happen in this one file.
 *
 * Do NOT prefix server-only secrets with NEXT_PUBLIC_ — they would be
 * inlined into the client bundle.
 */
export const env = {
  /** GitHub PAT. Supports comma-separated list for token rotation: "ghp_t1,ghp_t2" */
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? '',

  /** Cron job secret tokens for GitHub API access. Supports comma-separated list: "ghp_t1,ghp_t2" */
  CRON_SECRET: process.env.CRON_SECRET ?? '',

  /** GitHub REST API base URL. Override to point at a proxy or mock server. */
  GITHUB_API_BASE: process.env.GITHUB_API_BASE ?? 'https://api.github.com',

  /** In-memory cache TTL in milliseconds. Defaults to 5 minutes. */
  CACHE_TTL_MS: Number(process.env.CACHE_TTL_MS ?? 300_000),

  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
