# Coding Standards

> Generated: 2026-04-21

---

## 1. General Principles

- **Clarity over brevity** — prefer explicit, readable code over clever one-liners
- **Small, focused functions** — single responsibility; no side effects in pure logic
- **No dead code** — remove unused imports, variables, and commented-out blocks
- **Server by default** — omit `'use client'`; add it only when strictly required
- **Types everywhere** — leverage TypeScript strict mode; avoid `any` (suppress only where unavoidable with inline comment)

---

## 2. Naming Conventions

| Item | Convention | Examples |
|------|-----------|---------|
| Files (components) | `PascalCase.tsx` | `LeaderboardClient.tsx`, `RankBadge.tsx` |
| Files (lib) | `camelCase.ts` | `github.ts`, `rankings.ts` |
| Files (pages) | Next.js reserved names | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Files (routes) | `route.ts` | `app/api/rankings/route.ts` |
| React components | `PascalCase` function | `LeaderboardClient`, `MetricBar` |
| Hooks | `use` prefix | `useQuery`, `useState` |
| Interfaces / Types | `PascalCase` | `LanguageRanking`, `RankingResponse` |
| Constants | `UPPER_SNAKE_CASE` | `COMPOSITE_WEIGHTS`, `MIN_REPO_THRESHOLD` |
| Functions (lib) | `camelCase` verb+noun | `getRankings`, `searchRepos`, `formatNumber` |
| Local variables | `camelCase` | `totalStars`, `fetchedAt` |
| CSS tokens | `kebab-case` vars | `--color-accent`, `--font-sans` |
| Route folders | `kebab-case` | `language-repos/`, `app/compare/` |
| Dynamic segments | `[camelCase]` | `[slug]` |

---

## 3. Formatting

- **Indentation**: 2 spaces (TypeScript/TSX files)
- **Quotes**: single quotes `'` for TypeScript strings; double quotes `"` in JSX attributes
- **Semicolons**: yes — always terminate statements
- **Trailing commas**: yes — in multiline arrays/objects/params/destructuring
- **Line length**: soft limit ~100 chars; hard limit 120 chars
- **Brace style**: same line for all blocks
- **Arrow functions**: parentheses required on parameters (single or multiple)
- **Object spacing**: `{ key: value }` — spaces inside braces for inline objects

**Enforced by**: ESLint 9 flat config with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

---

## 4. TypeScript Rules

- **Strict mode** is on (`tsconfig.json`): `strict: true`
- Use **interface** for object shapes and component props; use **type** for unions/aliases
- Use **`as const`** for literal constants in objects: `{ repositories: 0.25 } as const`
- Avoid `any` — if unavoidable, add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a comment explaining why
- Return types on exported functions are explicit; inferred for internal helpers
- Use the `satisfies` operator to validate objects against types without widening
- Non-null assertion `!` is allowed when the call site guarantees non-null (e.g. `.find()!` after filtering)
- Generic constraints: `T extends object` > unbounded `T` when the type is used as a map key

---

## 5. Import Ordering

1. Node built-ins (`node:fs`, etc.)
2. External packages (`next/...`, `react`, `@tanstack/...`)
3. Internal `@/` alias imports
4. Relative `./` imports

Groups separated by a blank line. Within each group, sort alphabetically.

```ts
// ✅ Correct
import { useState } from 'react';
import type { Metadata } from 'next';

import type { LanguageRanking } from '@/types/rankings';
import { formatNumber, cn } from '@/lib/utils';

import RankBadge from './RankBadge';
```

---

## 6. Component Patterns

### Server Components (default)
- `async function` with direct `await` data calls
- Export `metadata` object for SEO
- No `'use client'` directive
- Keep JSX focused — extract large sections into sub-components

```tsx
export default async function FeaturePage() {
  const { rankings } = await getRankings();
  return <FeatureClient rankings={rankings} />;
}
```

### Client Components
- `'use client'` as **first line** of file
- Accept all data via typed `Props` interface
- Use `initialData` when using `useQuery` to prevent flash of empty state
- Derive computed state with `useMemo` when the computation is non-trivial

```tsx
'use client';

interface FeatureClientProps {
  rankings: LanguageRanking[];
  isStale: boolean;
}

export default function FeatureClient({ rankings, isStale }: FeatureClientProps) { ... }
```

### Conditional classes
Always use `cn()` (from `@/lib/utils`) for merging Tailwind classes:

```tsx
// ✅
className={cn('base-classes', condition && 'conditional-class')}

// ❌
className={`base-classes ${condition ? 'conditional-class' : ''}`}
```

---

## 7. Styling Rules

- Use **design token classes** — never raw hex, never `var()` inside TSX:
  - `text-foreground`, `text-muted`, `text-accent`, `text-live`, `text-critical`, `text-warning`
  - `bg-background`, `bg-surface`
  - `border-border`
- Use `**dark:**` variants when a color does not auto-switch via CSS vars (e.g. `text-amber-600 dark:text-amber-400`)
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints
- Interactive states: always provide `hover:` and `focus-visible:` variants on interactive elements
- Animation: `live-dot` pulsing animation and `metric-glow` glow are defined in `globals.css — ` use the class names directly

---

## 8. Error Handling

- Throw typed errors from `lib/errors.ts` — never bare `new Error()` in business logic
- Route Handlers: always `try/catch`, log with `console.error('[endpoint] context:', error)`, return `{ error: { code, message } }`
- Server Components: use `notFound()` for missing resources; fall through to `error.tsx` for unexpected failures
- Client Components: surface stale state via `isStale` prop + amber banner; do not let thrown errors reach the user unhandled

```ts
// ✅ Typed error
throw new GitHubApiError(`GitHub API ${res.status} for "${lang}"`);

// ❌ Bare error
throw new Error('something went wrong');
```

---

## 9. Data Fetching Rules

- **Server Components call `lib/` directly** — never `fetch('/api/...')` from a Server Component
- **Client Components use TanStack Query** — always pass `initialData` from the parent Server Component
- **No raw `fetch` in components** — all direct fetch calls live in `lib/github.ts`
- Use `cache: 'no-store'` on GitHub API calls — caching is managed manually via `MemoryCache`

---

## 10. Comments & Documentation

- Comment **why**, not **what** — never paraphrase the code
- Use JSDoc-style `/** */` for exported functions with non-obvious parameters
- Inline comments for business rules: include spec reference if applicable (e.g. `// BR-003`)
- Section dividers in long files: `// ─── Section Name ────────────────────`
- `TODO`, `FIXME`, `NOTE` tags are acceptable with a brief explanation

---

## 11. Git & Code Review

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`
- Subject line: imperative, ≤50 chars (`feat: add language detail page`)
- Body: context and motivation; reference spec/issue numbers when applicable
- One logical change per commit; avoid mixing feature + formatting fixes
- Small, focused PRs — one feature or fix per PR

---

## 12. Detected Inconsistencies

The following minor inconsistencies were found during analysis:

| Location | Issue |
|----------|-------|
| `app/page.tsx` | Mixes single quotes and alignment-padded spacing (`s + r.starCount`) — cosmetic only |
| `components/VisualizationsClient.tsx` | Long inline ternary in `barData` map (lines ~50–56) — consider extracting `getMetricRaw()` helper |
| `lib/utils.ts` | `toLanguageSlug` is a single long chained expression — acceptable, but could be split into intermediate steps for readability |

All other files are consistent in quote style, indentation, and naming.
