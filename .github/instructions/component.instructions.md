---
applyTo: '**/components/**'
description: 'Component structure, composition, Server vs Client boundaries, and reusable API design'
---

# Component Standards

## File Structure
```tsx
// 1. Imports
// 2. Props interface
// 3. Component function
// 4. Export
```

## Server vs Client Components
- Server Components are the default — no directive needed
- Add `'use client'` only when the component uses: hooks, event handlers, browser APIs, or client-only libraries
- Never use `next/dynamic` with `{ ssr: false }` inside Server Components
- Push `'use client'` to the leaf nodes — keep parent components as Server Components
- Never pass non-serializable props (functions, classes, Dates) from Server to Client Components

## Composition Over Prop Drilling
- Use the children pattern to compose Server and Client components
- Extract shared state into context providers — place providers in layouts, not pages
- Prefer composition (slots, render props) over deep prop chains (>3 levels)

## Component API Design
- Props interface must be explicit — no `Record<string, unknown>` or `any`
- Use `React.ComponentPropsWithoutRef<'element'>` to extend native HTML element props
- Destructure props in the function signature
- Provide sensible defaults for optional props
- Prefix event handler props with `on` (`onClick`, `onSubmit`)

## Colocation
- Place component-specific types in the component file, not in `types/`
- Place route-specific components inside the route folder (e.g., `app/dashboard/_components/`)
- Place shared components in `components/`

## Anti-Patterns
- Do NOT create wrapper components that just pass props through
- Do NOT mix data fetching and UI in the same client component — fetch in a Server Component parent
- Do NOT use `useEffect` for data fetching — use Server Components or a data fetching library
- Do NOT create example/demo files — keep the codebase production-focused
