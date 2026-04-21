---
applyTo: '**/*'
description: 'Project tech stack, runtime, package manager, folder layout, and module boundaries'
---

# Project Context

## Tech Stack
- **Framework**: Next.js 16.2.4 (App Router only — no `pages/` directory)
- **UI Library**: React 19.2.4
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Fonts**: Geist Sans + Geist Mono (via `next/font/google`)
- **Linting**: ESLint 9 (flat config) with `eslint-config-next` core-web-vitals + typescript
- **Package Manager**: pnpm (use `pnpm add`, `pnpm install`, never `npm` or `yarn`)
- **Node.js**: 20+

## Folder Layout
```
app/              → App Router: pages, layouts, route handlers, loading/error states
  api/            → Route Handlers (route.ts)
components/       → Shared reusable UI components
lib/              → Shared utilities, API clients, data fetching, business logic
hooks/            → Custom React hooks
types/            → Shared TypeScript type definitions
public/           → Static assets (images, fonts, SVGs)
```

## Module Boundaries
- `app/` owns routing, layouts, pages, and metadata — never import from `app/` in `lib/` or `components/`
- `lib/` owns business logic and data fetching — importable anywhere
- `components/` owns reusable UI — importable in `app/` and other components
- `hooks/` owns custom hooks — importable in client components only
- `types/` owns shared types — importable anywhere

## Path Aliases
- Use `@/*` for root-relative imports (e.g., `@/lib/utils`, `@/components/Button`)
- Never use `../../../` traversals beyond two levels

## Runtime
- Server Components are the default — do NOT add `'use client'` unless the component uses hooks, event handlers, or browser APIs
- Prefer Server Components for data fetching — never call your own Route Handlers from Server Components
