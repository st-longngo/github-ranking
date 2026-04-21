---
applyTo: '**/*.css,**/*.tsx,**/*.jsx'
description: 'Tailwind CSS 4, design tokens, responsive strategy, and dark mode patterns'
---

# Styling Standards

## Tailwind CSS 4
- Tailwind CSS 4 is the primary styling approach — via `@tailwindcss/postcss`
- Import Tailwind in `globals.css` with `@import "tailwindcss"`
- Use `@theme inline` in `globals.css` for custom design tokens
- Do NOT use `tailwind.config.js` — Tailwind 4 uses CSS-based configuration

## Design Tokens
- Colors: use CSS custom properties defined in `globals.css` (`--background`, `--foreground`)
- Reference tokens via `var(--token-name)` in `@theme inline` blocks
- Fonts: `--font-sans` (Geist Sans), `--font-mono` (Geist Mono)

## Responsive Design
- Mobile-first: base styles for mobile, then `sm:`, `md:`, `lg:`, `xl:`, `2xl:` breakpoints
- Use `flex` and `grid` for layout — never use floats
- Use `max-w-*` for content width constraints
- Test at all breakpoints: 320px, 640px, 768px, 1024px, 1280px

## Dark Mode
- Strategy: `prefers-color-scheme` media query (system preference)
- Use `dark:` variant for dark mode overrides
- Define dark mode colors in `@media (prefers-color-scheme: dark)` block in `globals.css`

## Utility-First Rules
- Compose utilities directly in JSX — no separate CSS files for component styles
- Extract repeated utility patterns into components, not CSS classes
- Use `cn()` or `clsx()` for conditional class composition
- Keep class strings readable — break long class lists across multiple lines

## Anti-Patterns
- Do NOT use inline `style={{}}` — use Tailwind utilities
- Do NOT create CSS Modules for styles achievable with Tailwind
- Do NOT use arbitrary values (`[17px]`) when a standard spacing/size token exists
- Do NOT use `@apply` — it defeats the purpose of utility-first CSS
