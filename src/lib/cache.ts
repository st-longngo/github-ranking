interface CacheEntry<T> {
  value: T;
  freshUntil: number;
  staleUntil: number;
}

export type CacheStatus = 'fresh' | 'stale';

export interface CacheResult<T> {
  value: T;
  status: CacheStatus;
}

class MemoryCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly store = new Map<string, CacheEntry<any>>();

  /** Returns value only when still within the fresh window (backward-compatible). */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    const now = Date.now();
    if (now > entry.freshUntil) {
      if (now > entry.staleUntil) this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  /**
   * Returns value + staleness status within the full lifetime window (fresh + stale grace).
   * Returns undefined only when the entry is completely expired.
   */
  getWithStatus<T>(key: string): CacheResult<T> | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    const now = Date.now();
    if (now > entry.staleUntil) {
      this.store.delete(key);
      return undefined;
    }
    const status: CacheStatus = now > entry.freshUntil ? 'stale' : 'fresh';
    return { value: entry.value as T, status };
  }

  /**
   * @param freshTtlMs  — how long the entry is served as "fresh"
   * @param staleTtlMs  — extra window where entry is "stale but usable" (SWR grace); defaults to 0
   */
  set<T>(key: string, value: T, freshTtlMs: number, staleTtlMs = 0): void {
    const now = Date.now();
    this.store.set(key, {
      value,
      freshUntil: now + freshTtlMs,
      staleUntil: now + freshTtlMs + staleTtlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

// Persist across HMR reloads in development
const globalWithCache = globalThis as typeof globalThis & { __appCache?: MemoryCache };
export const appCache = globalWithCache.__appCache ?? new MemoryCache();
if (process.env.NODE_ENV !== 'production') globalWithCache.__appCache = appCache;
