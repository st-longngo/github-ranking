import path from 'node:path';

/** Root directory for all ranking CSV snapshots. */
export const DATA_DIR = path.join(process.cwd(), 'data', 'rankings');

/** Symlink/copy pointing to the most recent ranking CSV. */
export const LATEST_FILE = path.join(DATA_DIR, 'latest.csv');

/** Root directory for per-language checkpoint files. */
export const CHECKPOINT_BASE = path.join(process.cwd(), 'data', 'rankings', 'checkpoint');

/** Header row for the daily ranking CSV. */
export const CSV_HEADER = 'rank,item,repo_name,stars,forks,language,repo_description,last_commit';
