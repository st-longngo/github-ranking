---
applyTo: '**/*.ts,**/*.tsx'
description: 'TypeScript strict mode, type patterns, generics usage, and anti-patterns'
---

# TypeScript Standards

## Strict Mode
- `strict: true` is enforced in `tsconfig.json` — never weaken it
- Never use `any` — use `unknown` and narrow with type guards
- Never use `@ts-ignore` — use `@ts-expect-error` with an explanation if absolutely necessary

## Types vs Interfaces
- Use `interface` for object shapes and component props — they support declaration merging and are more readable
- Use `type` for unions, intersections, mapped types, and utility types
- Never prefix interfaces with `I` (e.g., `IUser`) — use `User`

## Patterns
- Prefer `unknown` over `any` for catch blocks: `catch (error: unknown)`
- Use `satisfies` for type-safe object literals without widening
- Use `as const` for literal tuples and union-generating objects
- Use discriminated unions for state variants (e.g., `{ status: 'loading' } | { status: 'error'; error: Error }`)
- Prefer `string` union types over `enum` — enums add runtime cost

## Generics
- Name generic params descriptively for complex types: `TData`, `TError`, `TResponse`
- Single-letter generics (`T`, `K`, `V`) are fine for simple utility types
- Constrain generics when possible: `<T extends Record<string, unknown>>`

## Utility Types
- Use `Readonly<T>` for immutable data from APIs
- Use `Pick<T, K>` / `Omit<T, K>` to derive sub-types
- Use `Partial<T>` for update/patch payloads
- Use `NonNullable<T>` to strip null/undefined

## Anti-Patterns
- Do NOT use `Function` type — use specific signatures: `(arg: string) => void`
- Do NOT use `object` type — use `Record<string, unknown>` or a specific interface
- Do NOT use non-null assertion `!` unless you can prove the value exists
- Do NOT export types that are only used internally
