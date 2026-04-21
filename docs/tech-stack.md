# Technology Stack Blueprint

> Generated: 2026-04-21

---

## Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Meta-framework** | Next.js | 16.2.4 | App Router, SSR, Route Handlers |
| **UI Library** | React | 19.2.4 | Component model, Server/Client Components |
| **Language** | TypeScript | ^5 (strict) | Type safety across all layers |
| **Styling** | Tailwind CSS | ^4 | Utility-first CSS with design tokens |
| **Package Manager** | pnpm | — | Fast, disk-efficient installs |
| **Node.js Runtime** | Node.js | 20+ | Server-side execution |

---

## 1. Frontend Layer

### Framework & Rendering
- **Next.js 16 App Router** — file-based routing under `app/`, Server Components by default
- No `pages/` directory; all routing is App Router only
- **Partial Pre-rendering (PPR)** not explicitly configured; pages use SSR via `async` Server Components

### UI & Components
- **React 19 Server/Client Components** — server components fetch data directly; `'use client'` only where browser APIs or hooks are required
- **TanStack Table v8** (`@tanstack/react-table`) — headless table for the leaderboard with sorting, filtering
- **Recharts v3** — `BarChart`, `PieChart`, `ScatterChart`, `RadarChart` for the Visualizations and Compare pages
- **TanStack Query v5** (`@tanstack/react-query`) — client-side data fetching with 5-minute stale time, initial data seeded from SSR

### Styling
- **Tailwind CSS 4** via `@tailwindcss/postcss` — no separate config file; tokens defined in `app/globals.css`
- **Custom design tokens** via CSS `@theme inline` block:
  - `background`, `foreground`, `surface`, `border`, `muted`, `accent`, `live`, `critical`, `warning`
  - Auto light/dark using `prefers-color-scheme`
- **`clsx` + `tailwind-merge`** — combined via `cn()` utility for conditional class merging

### Fonts
- **Geist Sans** + **Geist Mono** — loaded via `next/font/google`, injected as CSS variables `--font-geist-sans` / `--font-geist-mono`

---

## 2. Backend Layer

### Runtime
- **Next.js Route Handlers** (`app/api/*/route.ts`) — lightweight, no separate Express/Hono server
- `GET /api/rankings` — dynamically rendered (`export const dynamic = 'force-dynamic'`)
- `GET /api/language-repos` — serves top repos for a given language slug

### Data Fetching
- **GitHub REST Search API** (`https://api.github.com/search/repositories`) — primary data source
- No database — data is fetched live from GitHub and cached in-process
- Concurrent fetching with `withConcurrency(tasks, limit = 5)` to respect GitHub secondary rate limits

### Caching
- **Module-level `MemoryCache`** (`lib/cache.ts`): `Map`-backed TTL cache (5-minute default)
- **HMR-safe** — uses `globalThis.__appCache` in development so the cache instance survives hot reloads
- **In-flight deduplication** — `fetchInFlight` mutex in `lib/github.ts` prevents duplicate concurrent API calls

### Authentication / Authorization
- **No user auth** — read-only public dashboard
- GitHub API authenticated via `GITHUB_TOKEN` env var (Bearer token); falls back to unauthenticated (lower rate limits) with stale/fallback data banner

### Error Handling
- Class hierarchy in `lib/errors.ts`: `AppError → GitHubApiError | RateLimitError | NotFoundError`
- Route handlers catch all errors, return structured JSON: `{ error: { code, message } }`
- Server Components call `notFound()` for missing language slugs

---

## 3. External Services

| Service | Usage | Auth |
|---------|-------|------|
| GitHub REST API v3 | Repository search, language metrics | `GITHUB_TOKEN` Bearer |

---

## 4. Dev Tooling

| Tool | Config | Purpose |
|------|--------|---------|
| **ESLint 9** | `eslint.config.mjs` (flat config) | Linting — `eslint-config-next` core-web-vitals + TypeScript |
| **TypeScript** | `tsconfig.json` (strict mode) | Type checking — `noEmit`, `bundler` module resolution |
| **PostCSS** | `postcss.config.mjs` | Tailwind CSS 4 processing |
| **pnpm** | `pnpm-workspace.yaml` | Package management |

---

## 5. Implemented Conventions

### Naming
| Item | Convention | Example |
|------|-----------|---------|
| Pages/Layouts | `PascalCase` function, kebab-case folder | `LeaderboardPage`, `app/language/[slug]/` |
| Components | `PascalCase` | `LeaderboardClient.tsx`, `RankBadge.tsx` |
| Lib files | `camelCase` | `rankings.ts`, `github.ts` |
| Types | `PascalCase` interface/type | `LanguageRanking`, `SortMetric` |
| Constants | `UPPER_SNAKE_CASE` | `COMPOSITE_WEIGHTS`, `MIN_REPO_THRESHOLD` |
| CSS tokens | `kebab-case` CSS vars | `--color-accent`, `--font-sans` |

### Imports
- Root alias `@/*` maps to workspace root
- No `../../../` traversals; all cross-directory imports use `@/`
- Named exports preferred in `lib/` and `types/`; default exports for components and pages

---

## 6. Key Integration Patterns

### Server → Client data handoff
```tsx
// Server Component fetches data, passes as prop
export default async function ComparePage() {
  const { rankings, isStale } = await getRankings();
  return <ComparisonClient rankings={rankings} isStale={isStale} />;
}

// Client Component receives SSR data as initialData for TanStack Query
const { data } = useQuery<RankingResponse>({
  queryKey: ['rankings'],
  queryFn: ...,
  initialData,                    // hydrated immediately, no loading flash
  refetchInterval: 5 * 60 * 1000,
});
```

### Caching pattern
```ts
// lib/cache.ts: check → fetch → store
const cached = appCache.get<CachedMetrics>(CACHE_KEY);
if (cached) return cached;
const fresh = await fetchFromGitHub();
appCache.set(CACHE_KEY, fresh, CACHE_TTL_MS);
```

### Error hierarchy
```ts
throw new RateLimitError(resetAt);   // 429
throw new GitHubApiError(message);   // 503
throw new NotFoundError(resource);   // 404
```

---

## 7. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | No (recommended) | GitHub API authentication — higher rate limits |

Template: `.env.local.example` in repo root.
