---
applyTo: '**/app/**'
description: 'App Router conventions, file-based routing, layouts, error handling, and middleware'
---

# Routing Standards

## App Router Conventions
- Use `app/` directory exclusively — no `pages/` directory
- Every route segment is a folder with special files

## Special Files
| File | Purpose |
|------|---------|
| `page.tsx` | Route UI — required for a route to be accessible |
| `layout.tsx` | Shared UI wrapping child routes — persists across navigation |
| `loading.tsx` | Suspense fallback for the route segment |
| `error.tsx` | Error boundary — must be a Client Component (`'use client'`) |
| `not-found.tsx` | UI for `notFound()` calls or unmatched routes |
| `route.ts` | API Route Handler — cannot coexist with `page.tsx` in the same folder |

## Route Patterns
- **Dynamic segments**: `[slug]` — access via `params.slug` (async in Server Components)
- **Catch-all**: `[...slug]` — matches multiple segments
- **Optional catch-all**: `[[...slug]]` — also matches the parent route
- **Route groups**: `(group-name)` — organize routes without affecting URL path
- **Private folders**: `_folder` — excluded from routing

## Layouts
- Root layout (`app/layout.tsx`) must include `<html>` and `<body>` tags
- Layouts receive `children` prop — do NOT re-render when navigating between child routes
- Place shared providers (theme, auth) in layouts, not in individual pages
- Use route groups for different layout structures: `(marketing)/layout.tsx`, `(dashboard)/layout.tsx`

## Middleware
- In Next.js 16, middleware is renamed to `proxy.ts` — place at project root
- Use for auth checks, redirects, rewrites, and header manipulation
- Keep middleware lightweight — it runs on every matched request

## Async APIs
- `params` and `searchParams` are Promises in Server Components — always `await` them
- `cookies()` and `headers()` are async — always `await` them

## Anti-Patterns
- Do NOT nest layouts more than 3 levels deep
- Do NOT use `redirect()` inside try/catch — it throws internally; use `unstable_rethrow` if you must catch
- Do NOT fetch data in layouts that changes per-page — fetch in the page component
