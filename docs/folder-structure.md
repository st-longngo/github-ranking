# Folder Structure Blueprint

> Last updated: 2026-04-23

---

## 1. Organizational Principle

**By layer** — code is grouped by responsibility (routing, components, business logic, types), not by feature. This suits a focused single-domain dashboard with a small team.

No monorepo; flat single-package workspace (`pnpm-workspace.yaml` is present but configures only the root package).

---

## 2. Directory Tree

```
github-ranking/
├── src/
│   ├── app/                          # App Router: pages, layouts, route handlers
│   │   ├── globals.css               # Global styles + Tailwind 4 design tokens
│   │   ├── layout.tsx                # Root layout (metadata, fonts, Header, Footer, QueryProvider)
│   │   ├── page.tsx                  # / — Leaderboard
│   │   ├── error.tsx                 # App-wide error boundary ('use client')
│   │   ├── not-found.tsx             # 404 page
│   │   ├── loading.tsx               # Root-level Suspense fallback
│   │   ├── icon.tsx                  # /icon — dynamic favicon (Server Component)
│   │   ├── apple-icon.tsx            # /apple-icon — Apple touch icon (Server Component)
│   │   ├── api/
│   │   │   ├── rankings/
│   │   │   │   └── route.ts          # GET /api/rankings — full language ranking list
│   │   │   ├── language-repos/
│   │   │   │   └── route.ts          # GET /api/language-repos — repos for a language
│   │   │   ├── language/
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts      # GET /api/language/:slug — single language metrics
│   │   │   ├── top-repos/
│   │   │   │   └── route.ts          # GET /api/top-repos — top repos by stars/forks/trending
│   │   │   ├── trending-repos/
│   │   │   │   └── route.ts          # GET /api/trending-repos — weekly/all-time/random repos
│   │   │   ├── repo-search/
│   │   │   │   └── route.ts          # GET /api/repo-search — repo autocomplete search
│   │   │   ├── repo-releases/
│   │   │   │   └── route.ts          # GET /api/repo-releases — latest releases for a repo
│   │   │   ├── repo-stars/
│   │   │   │   └── route.ts          # GET /api/repo-stars — sampled star history for chart
│   │   │   └── cron/
│   │   │       └── refresh-rankings/
│   │   │           └── route.ts      # GET /api/cron/refresh-rankings — cache warm-up (CRON_SECRET)
│   │   ├── language/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # /language/:slug — Language detail
│   │   │       └── loading.tsx
│   │   └── top-ranking/
│   │       ├── page.tsx              # /top-ranking — Top repos by stars/forks/trending
│   │       └── loading.tsx
│   │
│   ├── components/                   # Shared UI components
│   │   ├── LeaderboardExplorerClient.tsx # Two-panel leaderboard orchestrator ('use client')
│   │   ├── TrendingSidebar.tsx       # Weekly/all-time/random trending repos ('use client')
│   │   ├── RepoExplorer.tsx          # Search, star history chart, releases ('use client')
│   │   ├── LanguageReposClient.tsx   # Per-language top repos list ('use client')
│   │   ├── TopRankingClient.tsx      # Top repos tabs by type + pagination ('use client')
│   │   ├── LeaderboardClient.tsx     # Language leaderboard table ('use client')
│   │   ├── common/                   # Reusable loading skeletons
│   │   │   ├── SkeletonTable/
│   │   │   │   ├── SkeletonTable.tsx # Generic table skeleton (Server)
│   │   │   │   └── index.ts          # Barrel export
│   │   │   └── SkeletonTopRanking/
│   │   │       ├── SkeletonTopRanking.tsx
│   │   │       └── index.ts
│   │   ├── layout/                   # App chrome
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx        # Sticky nav ('use client' — uses usePathname)
│   │   │   │   └── index.ts          # Barrel export
│   │   │   └── Footer/
│   │   │       ├── Footer.tsx        # Static footer (Server)
│   │   │       └── index.ts
│   │   └── ui/                       # shadcn/ui primitives
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── MetricBar/            # Normalized metric progress bar (Server)
│   │       │   ├── MetricBar.tsx
│   │       │   └── index.ts
│   │       └── RankBadge/            # Medal / numeric rank badge (Server)
│   │           ├── RankBadge.tsx
│   │           └── index.ts
│   │
│   ├── lib/                          # Business logic, data fetching, utilities
│   │   ├── github.ts                 # GitHub API client, concurrency, in-flight dedup
│   │   ├── rankings.ts               # Normalization, composite score, ranking logic
│   │   ├── trending.ts               # Trending repos, releases, repo search, star history
│   │   ├── cache.ts                  # MemoryCache class + globalThis HMR-safe singleton
│   │   ├── errors.ts                 # AppError hierarchy
│   │   ├── utils.ts                  # cn(), formatNumber(), toLanguageSlug(), etc.
│   │   └── fallback-data.ts          # Static demo metrics (no GITHUB_TOKEN)
│   │
│   ├── providers/                    # React context providers
│   │   └── QueryProvider.tsx         # TanStack Query client singleton ('use client')
│   │
│   └── types/                        # Shared TypeScript type definitions
│       └── rankings.ts               # LanguageMetrics, LanguageRanking, TrendingRepo, StarDataPoint, etc.
│
├── public/                           # Static assets (images, SVGs, favicons)
├── docs/                             # Project documentation
├── spec/                             # Product & feature specifications
├── .github/
│   ├── instructions/                 # Copilot instruction files (.instructions.md)
│   └── skills/                       # Agent skill files
├── .setup/
│   └── prompts/                      # Generator prompt templates
├── next.config.ts
├── tsconfig.json                     # TypeScript strict mode, path alias @/*→src/*
├── eslint.config.mjs                 # ESLint 9 flat config
├── postcss.config.mjs                # Tailwind CSS 4 via @tailwindcss/postcss
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

---

## 3. Key Directory Analysis

### `src/app/` — Pages & Route Handlers

| Concern | Pattern |
|---------|---------|
| Routing structure | Flat at depth 1–2; one dynamic segment `[slug]` for language detail |
| Suspense loading | Every async route has a co-located `loading.tsx` sibling |
| Error boundaries | `error.tsx` must be `'use client'` (Next.js requirement) |
| Route groups | None — all routes are visible in the URL namespace |
| Layouts | Single root `layout.tsx`; no nested layouts |
| API routes | 9 Route Handlers under `app/api/`; all `GET`, no mutations |
| Dynamic icons | `icon.tsx` and `apple-icon.tsx` generate favicons via Server Components |

### `src/components/` — UI Components

- **Three subdirectories** by concern: `common/` (skeletons), `layout/` (chrome), `ui/` (shadcn primitives + custom display atoms)
- **Page-level interactive components** live directly in `components/` root — suffixed `*Client.tsx` to signal `'use client'`
- **Barrel exports** (`index.ts`) are used for all subdirectory components; import via the directory path: `@/components/layout/Header`
- **shadcn/ui primitives** in `components/ui/` are flat `.tsx` files; custom display atoms inside `components/ui/` use subdirectory + barrel pattern

### `src/lib/` — Business Logic

- Flat; each file owns one concern
- Server-only: never imported from `'use client'` components directly (pass data as props instead)
- All modules export named functions; no default exports

### `src/providers/` — Context Providers

- Holds all `'use client'` context providers that wrap the app shell
- Currently: `QueryProvider.tsx` (TanStack Query `QueryClientProvider`)
- Imported in `app/layout.tsx`; children are passed through to keep the layout a Server Component

### `src/types/` — Shared Types

- Single file (`rankings.ts`) holds all domain types and constants
- Importable from any layer via `@/types/rankings`

---

## 4. File Placement Rules

### New page/route
```
src/app/<route-name>/page.tsx       # async Server Component
src/app/<route-name>/loading.tsx    # Suspense skeleton
src/app/<route-name>/error.tsx      # Optional — must be 'use client'
```

### New dynamic route
```
src/app/<segment>/[param]/page.tsx
src/app/<segment>/[param]/loading.tsx
```

### New API endpoint
```
src/app/api/<endpoint-name>/route.ts
```

### New page-level interactive component
```
src/components/<Feature>Client.tsx   # 'use client'; receives serializable props from page
```

### New reusable layout component
```
src/components/layout/<Name>/
  <Name>.tsx
  index.ts                           # export { default } from './<Name>';
```

### New shared skeleton / common component
```
src/components/common/<Name>/
  <Name>.tsx
  index.ts
```

### New UI primitive or display atom
```
src/components/ui/<Name>/
  <Name>.tsx
  index.ts
```
Or, for simple shadcn-generated primitives: `src/components/ui/<name>.tsx` (flat, no subdirectory).

### New lib utility or service
```
src/lib/<concern>.ts    # named exports only; no default export
```

### New context provider
```
src/providers/<Name>Provider.tsx   # 'use client'
```

### New type definitions
```
src/types/<domain>.ts   # importable anywhere via @/types/<domain>
```

### Tests (recommended placement)
```
src/lib/__tests__/<module>.test.ts
src/components/__tests__/<Component>.test.tsx
src/app/__tests__/api/<route>.test.ts
e2e/                                 # Playwright E2E tests
```

---

## 5. Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` | `src/app/compare/page.tsx` |
| Layouts | `layout.tsx` | `src/app/layout.tsx` |
| Loading | `loading.tsx` | `src/app/visualizations/loading.tsx` |
| Error | `error.tsx` | `src/app/error.tsx` |
| Route Handlers | `route.ts` | `src/app/api/rankings/route.ts` |
| Page-level Client component | `PascalCaseClient.tsx` | `LeaderboardClient.tsx` |
| Layout/Common/UI component | `PascalCase.tsx` | `Header.tsx`, `RankBadge.tsx` |
| Barrel export | `index.ts` | `components/layout/Header/index.ts` |
| Lib modules | `camelCase.ts` | `lib/rankings.ts` |
| Type files | `camelCase.ts` | `types/rankings.ts` |
| Providers | `PascalCaseProvider.tsx` | `providers/QueryProvider.tsx` |

### Folders

| Type | Convention | Example |
|------|-----------|---------|
| App routes | `kebab-case` | `app/top-ranking/`, `app/language/` |
| Dynamic segments | `[camelCase]` | `app/language/[slug]/` |
| API routes | `kebab-case` | `app/api/language-repos/` |
| Component subdirs | `PascalCase` | `components/layout/Header/` |

### Imports / Aliasing

- All cross-directory imports use `@/` (resolves to `src/`): `@/lib/utils`, `@/components/layout/Header`, `@/types/rankings`
- Subdirectory components: import from the directory path, which resolves via the `index.ts` barrel — e.g. `import Header from '@/components/layout/Header'`
- Relative imports (`./`) only within the same directory (e.g., within a component folder)
- No `../../../` traversals beyond two levels

---

## 6. Common Workflows

### Adding a new page end-to-end

1. Create `src/app/<route>/page.tsx` — async Server Component
2. Add `export const metadata: Metadata` for SEO
3. Fetch data by calling a `src/lib/` function directly (never call your own Route Handlers from Server Components)
4. If interactivity is needed: create `src/components/<Feature>Client.tsx` with `'use client'` and pass serializable props from the page
5. Create `src/app/<route>/loading.tsx` wrapping the appropriate skeleton component
6. If the route is top-level navigation, add an entry to `NAV_ITEMS` in `src/components/layout/Header/Header.tsx`

### Adding a new API endpoint

1. Create `src/app/api/<name>/route.ts`
2. Export named HTTP verb functions (`GET`, `POST`, etc.)
3. Call `src/lib/` functions only — never import from `src/app/`
4. Return `Response.json({ data: ... })` on success, `{ error: { code, message } }` on failure with a matching HTTP status
5. Add `export const dynamic = 'force-dynamic'` when the response must not be cached by Next.js

### Adding a new reusable UI component

1. Choose the right subdirectory: `common/` for skeletons, `layout/` for chrome, `ui/` for display atoms
2. Create `src/components/<subdir>/<Name>/<Name>.tsx`
3. Create `src/components/<subdir>/<Name>/index.ts` with `export { default } from './<Name>';`
4. Add `'use client'` only if the component uses hooks or event handlers
5. Define a typed `Props` interface; use `cn()` from `@/lib/utils` for conditional classes
6. Use design token classes (`text-muted`, `bg-surface`, `border-border`, etc.) — not raw Tailwind color names

### Adding a new page-level interactive component

1. Create `src/components/<Feature>Client.tsx` at the components root
2. Add `'use client'` at the top
3. Accept serializable props from the Server Component page (no functions, no class instances)
4. Use TanStack Query hooks for subsequent client-side data fetching

### Adding a new lib utility

1. Create `src/lib/<concern>.ts`
2. Export named functions only — no default export for lib modules
3. Import types from `@/types/`
4. Add unit tests under `src/lib/__tests__/<concern>.test.ts`

### Adding a new context provider

1. Create `src/providers/<Name>Provider.tsx` with `'use client'`
2. Wrap children in the provider; expose a custom hook if consumers need context access
3. Import and apply the provider in `src/app/layout.tsx`

---

## 7. Templates

### Server Component page
```tsx
// src/app/<route>/page.tsx
import type { Metadata } from 'next';
import { getRankings } from '@/services/rankings';
import FeatureClient from '@/components/FeatureClient';

export const metadata: Metadata = {
  title: '<Page Title>',
  description: '<Description>',
};

export default async function FeaturePage() {
  const { rankings, isStale } = await getRankings();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FeatureClient rankings={rankings} isStale={isStale} />
    </div>
  );
}
```

### Page-level Client Component
```tsx
// src/components/<Feature>Client.tsx
'use client';

import type { LanguageRanking } from '@/types/rankings';
import { cn } from '@/lib/utils';

interface FeatureClientProps {
  rankings: LanguageRanking[];
  isStale: boolean;
}

export default function FeatureClient({ rankings, isStale }: FeatureClientProps) {
  return <div>{/* interactive content */}</div>;
}
```

### Subdirectory UI component + barrel
```tsx
// src/components/ui/<Name>/<Name>.tsx
import { cn } from '@/lib/utils';

interface NameProps {
  className?: string;
}

export default function Name({ className }: NameProps) {
  return <div className={cn('...', className)} />;
}
```
```ts
// src/components/ui/<Name>/index.ts
export { default } from './<Name>';
```

### Route Handler
```ts
// src/app/api/<name>/route.ts
import { type NextRequest } from 'next/server';
import { someLibFunction } from '@/lib/<module>';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const data = await someLibFunction();
    return Response.json({ data });
  } catch (error) {
    console.error('[api/<name>]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Request failed' } },
      { status: 500 },
    );
  }
}
```

### Lib service module
```ts
// src/lib/<concern>.ts
import type { SomeType } from '@/types/rankings';
import { AppError } from './errors';

export async function doSomething(): Promise<SomeType> {
  // business logic
}
```

### Loading skeleton
```tsx
// src/app/<route>/loading.tsx
import SkeletonTable from '@/components/common/SkeletonTable';

export default function Loading() {
  return <SkeletonTable />;
}
```
