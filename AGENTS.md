<!-- BEGIN:nextjs-agent-rules -->
> **Important**: This app uses Next.js 16.2.4. APIs, conventions, and file structure may differ from
> your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any
> code. Heed deprecation notices. In Next.js 16 `middleware.ts` is renamed to `proxy.ts`. `params`
> and `searchParams` are `Promise`s — always `await` them.
<!-- END:nextjs-agent-rules -->

# Project Overview

GitHub Ranking is a read-only dashboard that ranks 30 programming languages by their GitHub activity.
It fetches live data from the GitHub REST Search API, computes a weighted composite score across four
dimensions (stars, repositories, forks, activity), and presents results through an interactive
Leaderboard Explorer (trending repo sidebar + repository search with star history chart and release
browser), per-language detail views, and a Top Ranking page. The app renders entirely with React
Server Components for fast initial load and uses TanStack Query on the client for background refresh.
When no `GITHUB_TOKEN` is configured it gracefully falls back to static demo data.

## Repository Structure

```
src/
  app/           App Router — pages, layouts, route handlers, loading/error states
    api/         Route Handlers (rankings, language repos, top repos, trending-repos,
                 repo-search, repo-releases, repo-stars, cron refresh)
    language/    Dynamic language-detail page ([slug])
    top-ranking/ Top repositories page
  components/    Reusable UI — Server and Client components, shadcn/ui primitives
    common/      Skeleton loaders (SkeletonTable, SkeletonTopRanking)
    layout/      Header (Client) and Footer (Server)
    ui/          shadcn/ui primitives (button, badge, card, table, …)
  lib/           Business logic and data fetching (no framework imports)
  providers/     QueryProvider wrapping TanStack Query client
  types/         Shared domain types (LanguageMetrics, LanguageRanking, …)
docs/            Architecture, coding standards, folder-structure, tech-stack notes
spec/            Product and feature specifications (epics, user stories)
.github/
  instructions/  Per-domain Copilot instruction files (code-style, routing, security, …)
  skills/        Agent skill files (frontend, backend, database, testing, …)
  prompts/       Reusable agent prompt files
public/          Static assets
```

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server (requires build first)
pnpm start

# Lint (ESLint 9 flat config)
pnpm lint

# TypeScript type-check only (no emit)
pnpm exec tsc --noEmit

# Build without lint (fast iteration)
pnpm exec next build --no-lint

# Clean build
rm -rf .next && pnpm build
```

> **Environment setup**: Copy `.env.local.example` to `.env.local` and set `GITHUB_TOKEN` to a
> GitHub personal access token (read-only, public repos scope). Without it the app renders fallback
> demo data with an amber warning banner.

## Code Style & Conventions

### Formatting & Linting
- ESLint 9 flat config (`eslint.config.mjs`) — `eslint-config-next` core-web-vitals + typescript
- Run via `pnpm lint`; fix all errors before committing — never disable rules inline without comment
- TypeScript strict mode; no `any`, no implicit `as unknown as T` casts

### Naming
| Kind | Convention | Example |
|------|-----------|---------|
| Variables / functions | `camelCase` | `fetchRankings`, `isLoading` |
| Components / types / interfaces | `PascalCase` | `LanguageCard`, `ApiResponse` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `CACHE_TTL_MS` |
| Component files | `PascalCase.tsx` | `RankBadge.tsx` |
| Utility files | `camelCase.ts` | `formatDate.ts` |
| Folders | `kebab-case` | `rank-badge/` |
| Hooks | `use` prefix | `useDebounce.ts` |
| Boolean vars | `is/has/should/can` prefix | `hasError`, `isActive` |

### Import Order
1. Node built-ins (`node:fs`)
2. External packages (`next`, `react`, third-party)
3. Internal aliases (`@/lib/`, `@/components/`, `@/types/`)
4. Relative imports (`./`, `../`)

Separate each group with a blank line; remove unused imports.

### Exports
- Default export for pages, layouts, and single-component files
- Named exports for utilities, hooks, types, and multi-export modules
- No barrel `index.ts` re-exporting entire directories — import directly from the source file

### Commit Messages
Follow conventional commits: `type(scope): description` (imperative, lowercase, ≤72 chars)

```
feat(rankings): add weekly trend column to leaderboard
fix(cache): prevent stale data after TTL expiry
chore(deps): update recharts to 3.9.0
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`

### Branch Naming
`feature/<id>-short-description` · `bugfix/<id>-short-description` · `hotfix/<id>-short-description`

## Architecture Notes

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Next.js Server                             │
│                                                                     │
│  app/**/page.tsx          app/api/**/route.ts                       │
│  (Server Components)      (Route Handlers)                          │
│         │                        │                                  │
│         └──────────┬─────────────┘                                  │
│                    ▼                                                 │
│              lib/ (Business Logic)                                  │
│         github.ts | rankings.ts | cache.ts                          │
│                    │                                                 │
│          ┌─────────┴──────────┐                                     │
│          ▼                    ▼                                      │
│    MemoryCache          GitHub REST API                              │
│  (globalThis, 5min TTL) /search/repositories                        │
│                                                                      │
│  On cache miss: fetch 30 languages × top-100 repos (5 concurrent)  │
│  On no token / error:  lib/fallback-data.ts (static demo)           │
└─────────────────────────────────────────────────────────────────────┘
              │ SSR props
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Bundle                                │
│  LeaderboardExplorerClient                                          │
│    TrendingSidebar (Weekly/All-time/Random tabs)                    │
│    RepoExplorer (search, star history chart, releases)              │
│  TopRankingClient | LanguageReposClient                             │
│  TanStack Query — hydrates from SSR initialData, refetches /api/*  │
└─────────────────────────────────────────────────────────────────────┘
```

**Layer dependency rules** (strictly enforced, no exceptions):

```
types/       ← no imports
   ↑
lib/         ← imports types/ only
   ↑
components/  ← imports lib/ and types/
   ↑
app/         ← imports lib/, types/, components/
```

**Composite score formula**:

```
score = 0.25 × repos_norm + 0.30 × stars_norm + 0.20 × forks_norm + 0.25 × activity_norm
```

All dimensions are min-max normalised to 0–100 across the 30-language set before weighting.

## Testing Strategy

- **Test runner**: Vitest (configured in `vitest.config.ts` — create if absent, mirror tsconfig paths)
- **File naming**: `<module>.test.ts` / `<module>.test.tsx` colocated with source or in `__tests__/`
- **Coverage target**: 80%+ line coverage for `lib/` and `services/`

```bash
# Run all tests
pnpm exec vitest run

# Watch mode
pnpm exec vitest

# Coverage report
pnpm exec vitest run --coverage
```

**What to test by priority**:
1. `lib/rankings.ts` — normalisation, composite score, sort order, slug lookup
2. `lib/github.ts` — concurrency limiter, in-flight deduplication, error mapping
3. `lib/cache.ts` — TTL expiry, globalThis singleton behaviour
4. Route Handlers in `app/api/` — happy path, validation errors, 500 fallback
5. Custom hooks (if any) — with `renderHook` from `@testing-library/react`

**Mocking**: Use `vi.mock()` for `fetch` and external modules; reset in `beforeEach`.  
**CI**: Tests must pass before merge — `pnpm exec vitest run` in the pipeline.

> TODO: set up `vitest.config.ts` and add initial test suite for `lib/rankings.ts`

## Security & Compliance

### Secrets
- `GITHUB_TOKEN` — store in `.env.local`, never commit; validated at startup
- Never prefix secrets with `NEXT_PUBLIC_` (they get inlined into client bundles)
- `.env.local`, `.env.*.local` are in `.gitignore`

### Input Validation
- All Route Handler inputs validated with Zod (path params, query params, body)
- Return `400` with field-level errors on validation failure
- Never use `eval()`, `new Function()`, or template literals with unvalidated user input

### Security Headers
Configure in `next.config.ts` headers:
- `Content-Security-Policy` (restrict `script-src`, `img-src`)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

> TODO: add explicit `headers()` block to `next.config.ts`

### Dependency Scanning
Run `pnpm audit` before merging dependency updates. Do not merge with known high/critical CVEs.

### License
Private repository (`"private": true` in `package.json`). All runtime dependencies are MIT or
Apache-2.0 licensed.

## Agent Guardrails

### Files Never Touched by Automated Agents
- `pnpm-lock.yaml` — never edit manually; always use `pnpm add / pnpm remove`
- `next-env.d.ts` — auto-generated by Next.js; do not modify
- `.github/instructions/*.instructions.md` — source of truth for conventions; propose changes in PR

### Required Human Review
- Any change to `lib/github.ts` (rate-limit and concurrency logic)
- Any change to `lib/cache.ts` (globalThis singleton)
- Any new `app/api/` route (security review required)
- Dependency additions or version bumps

### Agent Boundaries
- Do NOT call own Route Handlers from Server Components — call `lib/` directly
- Do NOT add `'use client'` to a component unless it uses hooks, event handlers, or browser APIs
- Do NOT create `pages/` directory — App Router only
- Do NOT use `npm` or `yarn` — use `pnpm` exclusively
- Do NOT commit `console.log` debug statements
- Do NOT push to `main` directly — open a PR

### Rate Limits
- GitHub Search API: 30 requests/min (unauthenticated), 30/min (authenticated per resource).
  The app batches 30 language fetches with a concurrency cap of 5 to stay within limits.

## Extensibility Hooks

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No (recommended) | GitHub PAT — enables live data; fallback data shown without it |
| `CACHE_TTL_MS` | No | Override default 5-minute cache TTL (milliseconds) |

> TODO: validate all env vars at startup with a Zod schema in `lib/env.ts`

### Adding a New Language
1. Add an entry to the language list in `lib/github.ts`
2. Add slug → display-name mapping in `lib/utils.ts` (`toLanguageSlug` / reverse map)
3. Add fallback metrics to `lib/fallback-data.ts`

### Adding a New Route
1. Create `src/app/<route>/page.tsx` (Server Component) — fetch data via `lib/`
2. Add a `loading.tsx` skeleton
3. Add `error.tsx` if the route can fail meaningfully
4. Register the path in `Header.tsx` nav links

### Feature Flags
> TODO: no feature-flag system is in place yet. Implement via env vars (`NEXT_PUBLIC_FF_*` for
> client-visible flags only; server-side flags via server-only env vars).

## Further Reading

- [Architecture blueprint](docs/architecture.md) — component diagram, data flow, layer rules
- [Coding standards](docs/coding-standards.md) — detailed style guide
- [Folder structure](docs/folder-structure.md) — annotated directory tree
- [Tech stack](docs/tech-stack.md) — dependency rationale and version notes
- [Product spec](spec/product-spec.md) — product vision and feature overview
- [Ranking engine epic](spec/ranking-engine/_epic-e1-ranking-engine.md) — composite score spec
- [Leaderboard epic](spec/leaderboard/_epic-e2-leaderboard.md) — leaderboard and explorer spec
- [Top ranking epic](spec/top-ranking/_epic-e3-top-ranking.md) — top-repos tab spec
- [Responsive shell epic](spec/responsive-shell/_epic-e7-responsive-shell.md) — layout spec
- [API design instructions](.github/instructions/api-design.instructions.md)
- [Component instructions](.github/instructions/component.instructions.md)
- [Security instructions](.github/instructions/security.instructions.md)
- [Testing instructions](.github/instructions/testing.instructions.md)
