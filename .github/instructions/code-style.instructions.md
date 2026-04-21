---
applyTo: '**/*.ts,**/*.tsx,**/*.js,**/*.jsx'
description: 'ESLint rules, import ordering, naming conventions, and export patterns'
---

# Code Style

## ESLint
- ESLint 9 flat config with `eslint-config-next` core-web-vitals + typescript
- Run ESLint via `pnpm lint` (ESLint CLI, not `next lint`)
- Fix all lint errors before committing — never disable rules inline without justification

## Import Ordering
1. Node built-ins (`node:fs`, `node:path`)
2. External packages (`next`, `react`, third-party)
3. Internal aliases (`@/lib/`, `@/components/`, `@/hooks/`, `@/types/`)
4. Relative imports (`./`, `../`)
- Separate each group with a blank line
- No unused imports

## Naming Conventions
- **Functions / variables**: `camelCase` (`fetchUsers`, `isActive`)
- **Components**: `PascalCase` (`UserCard`, `SearchBar`)
- **Types / Interfaces**: `PascalCase` (`UserProfile`, `ApiResponse`)
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_RETRIES`, `API_BASE_URL`)
- **Files**: `PascalCase` for components (`UserCard.tsx`), `camelCase` for utilities (`formatDate.ts`)
- **Folders**: `kebab-case` (`user-profile/`, `api-utils/`)
- **Hooks**: `camelCase` prefixed with `use` (`useAuth.ts`, `useDebounce.ts`)
- **Boolean variables**: prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasError`)

## Exports
- Default export for page/layout/route files and single-component files
- Named exports for utilities, hooks, types, and multi-export modules
- No barrel files (`index.ts`) re-exporting entire directories — import directly from the source file

## Code Structure
- One component per file
- Props interface defined above the component in the same file
- Keep files under 200 lines — extract logic into hooks or utilities
- Prefer early returns over deeply nested conditionals
- Use `const` by default — `let` only when reassignment is needed, never `var`
