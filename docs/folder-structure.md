# Folder Structure Blueprint

> Generated: 2026-04-21

---

## 1. Organizational Principle

**By layer** — code is grouped by responsibility (routing, components, business logic, types), not by feature. This suits a focused single-domain dashboard with a small team.

No monorepo; flat single-package workspace.

---

## 2. Directory Tree

```
github-ranking/
├── app/                        # App Router: pages, layouts, route handlers
│   ├── globals.css             # Global styles + Tailwind 4 design tokens
│   ├── layout.tsx              # Root layout (metadata, fonts, Header, Footer, QueryProvider)
│   ├── page.tsx                # / — Leaderboard
│   ├── error.tsx               # App-wide error boundary
│   ├── not-found.tsx           # 404 page
│   ├── loading.tsx             # Root-level Suspense fallback
│   ├── api/
│   │   ├── rankings/
│   │   │   └── route.ts        # GET /api/rankings
│   │   └── language-repos/
│   │       └── route.ts        # GET /api/language-repos
│   ├── compare/
│   │   ├── page.tsx            # /compare — Language comparison tool
│   │   └── loading.tsx
│   ├── language/
│   │   └── [slug]/
│   │       ├── page.tsx        # /language/:slug — Language detail
│   │       └── loading.tsx
│   └── visualizations/
│       ├── page.tsx            # /visualizations — Charts
│       └── loading.tsx
│
├── components/                 # Shared reusable UI components
│   ├── Header.tsx              # Sticky nav (Client — uses usePathname)
│   ├── Footer.tsx              # Static footer (Server)
│   ├── QueryProvider.tsx       # TanStack Query client singleton (Client)
│   ├── LeaderboardClient.tsx   # Interactive leaderboard table (Client)
│   ├── ComparisonClient.tsx    # Language comparison radar chart (Client)
│   ├── VisualizationsClient.tsx# Tab-based charts: bar / bubble / donut (Client)
│   ├── LanguageReposClient.tsx # Per-language top repos list (Client)
│   ├── RankBadge.tsx           # Medal / numeric rank badge (Server)
│   ├── MetricBar.tsx           # Normalized metric progress bar (Server)
│   └── SkeletonTable.tsx       # Loading skeleton (Server)
│
├── lib/                        # Business logic, data fetching, utilities
│   ├── github.ts               # GitHub API client, concurrency, in-flight dedup, cache
│   ├── rankings.ts             # Normalization, composite score, ranking, related-language logic
│   ├── cache.ts                # MemoryCache class + globalThis HMR-safe singleton
│   ├── errors.ts               # AppError hierarchy
│   ├── utils.ts                # cn(), formatNumber(), formatRelativeTime(), toLanguageSlug()
│   └── fallback-data.ts        # Static demo metrics (no GITHUB_TOKEN)
│
├── types/                      # Shared TypeScript type definitions
│   └── rankings.ts             # LanguageMetrics, LanguageRanking, RankingResponse, constants
│
├── public/                     # Static assets
│   └── (images, SVGs, favicons)
│
├── docs/                       # Project documentation
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── folder-structure.md
│   ├── coding-standards.md
│   └── exemplars.md
│
├── spec/                       # Product & feature specifications
│   ├── product-spec.md
│   └── (epic/) feature specs
│
├── .github/
│   ├── instructions/           # Copilot instruction files
│   └── skills/                 # Agent skill files
│
├── .setup/
│   └── prompts/                # Generator prompt templates
│
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript (strict mode)
├── eslint.config.mjs           # ESLint 9 flat config
├── postcss.config.mjs          # Tailwind CSS 4 PostCSS
├── pnpm-workspace.yaml         # pnpm workspace (single package)
├── package.json
└── pnpm-lock.yaml
```

---

## 3. Key Directory Analysis

### `app/` — Pages & Route Handlers

- **Routing structure**: flat routes at depth 1–2; one dynamic segment `[slug]` for language detail
- **Co-located Suspense**: every route with async data has a sibling `loading.tsx`
- **Route groups**: not used; all routes are in the URL namespace
- **Layouts**: only one layout — the root `layout.tsx`
- **API routes**: two Route Handlers under `app/api/`; both `GET`, no `POST/PUT/DELETE`

### `components/` — UI Components

- **Grouping**: flat, by feature relevance — no subdirectory splitting since the dashboard has few pages
- **Naming suffix pattern**: `*Client.tsx` suffix signals a `'use client'` interactive component

### `lib/` — Business Logic

- Flat; each file owns one concern
- No internal subdirectories; size is small enough that one level is sufficient
- All modules are `import`-able from any layer above

### `types/` — Shared Types

- Single file (`rankings.ts`) holds all domain types and constants
- No barrel `index.ts` needed

---

## 4. File Placement Rules

### New page/route
```
app/<route-name>/page.tsx       # Server Component page
app/<route-name>/loading.tsx    # Suspense skeleton
app/<route-name>/error.tsx      # Optional per-route error boundary
```

### New dynamic route
```
app/<segment>/[param]/page.tsx
app/<segment>/[param]/loading.tsx
```

### New API endpoint
```
app/api/<endpoint-name>/route.ts
```

### New UI component
```
components/<ComponentName>.tsx
components/<ComponentName>Client.tsx   # if 'use client'
```

### New lib utility or service
```
lib/<concern>.ts    # e.g. lib/formatters.ts, lib/notifications.ts
```

### New type definitions
```
types/<domain>.ts   # e.g. types/user.ts — import anywhere via @/types/
```

### Tests (recommended placement)
```
lib/__tests__/<module>.test.ts          # Unit tests for lib functions
components/__tests__/<Component>.test.tsx
app/__tests__/api/<route>.test.ts       # Route Handler integration tests
e2e/                                    # Playwright E2E tests
```

---

## 5. Naming Conventions

### Files

| Type | Convention | Examples |
|------|-----------|---------|
| Pages | `page.tsx` | `app/compare/page.tsx` |
| Layouts | `layout.tsx` | `app/layout.tsx` |
| Loading | `loading.tsx` | `app/visualizations/loading.tsx` |
| Error | `error.tsx` | `app/error.tsx` |
| Route Handlers | `route.ts` | `app/api/rankings/route.ts` |
| UI Components | `PascalCase.tsx` | `components/RankBadge.tsx` |
| Client Components | `PascalCase.tsx` (with `'use client'`) | `components/LeaderboardClient.tsx` |
| Lib modules | `camelCase.ts` | `lib/rankings.ts`, `lib/github.ts` |
| Type files | `camelCase.ts` | `types/rankings.ts` |

### Folders

| Type | Convention | Examples |
|------|-----------|---------|
| Routes | `kebab-case` | `app/compare/`, `app/language/` |
| Dynamic segments | `[camelCase]` | `app/language/[slug]/` |
| API routes | `kebab-case` | `app/api/language-repos/` |

### Imports / Aliasing

- All cross-directory imports use `@/` alias: `@/lib/utils`, `@/components/Header`, `@/types/rankings`
- No barrel `index.ts` files — import directly from the target module
- Relative imports `./` only within the same directory

---

## 6. Common Workflows

### Adding a new page end-to-end

1. Create `app/<route>/page.tsx` — async Server Component
2. Add `export const metadata: Metadata` for SEO
3. Fetch data via `getRankings()` or a new `lib/` function (never via own API)
4. If interactivity needed: create `components/<Feature>Client.tsx` with `'use client'`
5. Create `app/<route>/loading.tsx` with `<SkeletonTable />` or custom skeleton
6. Add nav entry to `components/Header.tsx` `NAV_ITEMS` if top-level

### Adding a new API endpoint

1. Create `app/api/<name>/route.ts`
2. Export `GET` (or other HTTP verbs) as named functions
3. Call `lib/` functions — never import from `app/`
4. Return `Response.json({ data: ... })` on success, `{ error: { code, message } }` on failure
5. Add `export const dynamic = 'force-dynamic'` if the response must never be cached by Next.js

### Adding a new UI component

1. Create `components/<Name>.tsx`
2. Add `'use client'` only if hooks or event handlers are required
3. Define a typed `Props` interface
4. Use `cn()` from `@/lib/utils` for conditional classes
5. Use design token classes (`text-muted`, `bg-surface`, etc.) — not raw Tailwind colors

### Adding a new lib utility

1. Create `lib/<concern>.ts`
2. Export named functions only (no default export for lib modules)
3. Import types from `@/types/`
4. Add unit tests under `lib/__tests__/<concern>.test.ts`

---

## 7. Templates

### Server Component page template
```tsx
// app/<route>/page.tsx
import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';

export const metadata: Metadata = {
  title: '<Page Title>',
  description: '<Description>',
};

export default async function <Route>Page() {
  const { rankings, isStale } = await getRankings();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* content */}
    </div>
  );
}
```

### Client Component template
```tsx
// components/<Feature>Client.tsx
'use client';

import type { LanguageRanking } from '@/types/rankings';
import { cn } from '@/lib/utils';

interface <Feature>ClientProps {
  rankings: LanguageRanking[];
  isStale: boolean;
}

export default function <Feature>Client({ rankings, isStale }: <Feature>ClientProps) {
  return <div>{/* interactive content */}</div>;
}
```

### Route Handler template
```ts
// app/api/<name>/route.ts
import { <fn> } from '@/lib/<module>';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const data = await <fn>();
    return Response.json({ data });
  } catch (error) {
    console.error('[api/<name>] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Request failed' } },
      { status: 500 },
    );
  }
}
```

### Lib service template
```ts
// lib/<service>.ts
import type { <Type> } from '@/types/rankings';
import { AppError } from './errors';

export async function <doThing>(): Promise<<Type>> {
  // business logic
}
```

---

_Last updated: 2026-04-21_
