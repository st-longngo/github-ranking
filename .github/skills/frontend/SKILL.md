---
name: frontend
description: 'Develop React Server/Client Components, hooks, state management, App Router patterns, styling with Tailwind CSS 4'
---

# Frontend Skill

## Trigger
Use this skill when the user asks to:
- Create a new page, layout, or component
- Build interactive UI with event handlers or state
- Implement responsive design with Tailwind CSS
- Set up loading/error states for a route
- Create custom hooks for shared logic
- Work with Next.js App Router patterns

## Inputs
- **Component/page description** (string): what to build
- **Route path** (optional): where in the app hierarchy
- **Server or Client** (optional): component type preference
- **Design reference** (optional): mockup, wireframe, or description

## Outputs
- TypeScript React components (`.tsx` files)
- Route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Custom hooks in `hooks/`
- Shared components in `components/`

## Procedure
1. Determine if Server or Client Component:
   - **Server** (default): data fetching, static content, no interactivity
   - **Client**: hooks, event handlers, browser APIs, animations
2. Create the component following project conventions:
   - Props interface above component
   - Default export
   - `@/` path aliases for imports
3. Apply Tailwind CSS 4 styling:
   - Mobile-first breakpoints (`sm:`, `md:`, `lg:`)
   - Dark mode with `dark:` variant
   - Design tokens from `globals.css`
4. Handle async patterns:
   - `await params` and `await searchParams` in Server Components
   - `await cookies()` and `await headers()` in Server Components
5. Add error/loading boundaries if creating a new route

## Standards
- Server Components by default — `'use client'` only when necessary
- Never use `next/dynamic` with `{ ssr: false }` in Server Components
- Never pass non-serializable props across Server/Client boundary
- Use `next/image` for all images, `next/font` for all fonts
- Semantic HTML with accessibility (ARIA, alt text, roles)
- One component per file, under 200 lines

## Error Handling
- If the user requests a pattern that violates Server/Client boundaries, explain why and suggest the correct approach
- If a component needs both server data and client interactivity, suggest composition pattern

## Dependencies
- `next` (App Router, Image, Font, Link)
- `react` (hooks, context)
- `tailwindcss` (styling)
- `clsx` or `cn()` (conditional classes — suggest installing if needed)

## Example
```
User: Create a user profile page with avatar, name, and editable bio
Skill: Creates app/profile/page.tsx (Server Component fetching user data) → creates components/EditableBio.tsx ('use client' for form state) → applies Tailwind styling
```
