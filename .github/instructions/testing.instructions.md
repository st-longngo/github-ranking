---
applyTo: '**/*.test.*,**/*.spec.*,**/tests/**'
description: 'Test runner, file naming, mocking strategy, and coverage targets'
---

# Testing Standards

## Test Runner
- Use Vitest as the primary test runner
- Configure in `vitest.config.ts` with path aliases matching `tsconfig.json`

## File Naming
- Test files: `<module>.test.ts` or `<module>.test.tsx`
- Place tests next to the source file (colocation) or in a `__tests__/` folder
- Test utilities and factories: `tests/helpers/`

## Test Structure
```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should return expected result for valid input', () => {});
    it('should throw for invalid input', () => {});
    it('should handle edge case', () => {});
  });
});
```

## What to Test
- **Must test**: Pure functions, business logic, data transformations, custom hooks, API route handlers, Zod schemas
- **Should test**: Component rendering with critical props, error states
- **Skip**: Static layouts, simple pass-through components, third-party library internals

## Mocking Strategy
- Use `vi.mock()` for module-level mocks (database, external APIs)
- Use `vi.fn()` for function mocks
- Prefer dependency injection over global mocks when possible
- Reset mocks in `beforeEach` or `afterEach`
- Never mock implementation details — mock boundaries (network, database, file system)

## Coverage
- Target 80%+ line coverage for `lib/` and `services/`
- Do NOT chase 100% — focus on meaningful tests over coverage numbers

## Anti-Patterns
- Do NOT write tests that depend on execution order
- Do NOT test implementation details — test behavior and outputs
- Do NOT use `test.only` or `describe.only` in committed code
- Do NOT modify source code to make it easier to test — write better tests
