interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

// Persist across HMR reloads in development
const globalWithCache = globalThis as typeof globalThis & { __appCache?: MemoryCache };
export const appCache = globalWithCache.__appCache ?? new MemoryCache();
if (process.env.NODE_ENV !== 'production') globalWithCache.__appCache = appCache;
