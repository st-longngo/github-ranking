---
name: testing
description: 'Write unit tests for functions, hooks, utilities, and services with proper mocking using Vitest'
---

# Testing Skill

## Trigger
Use this skill when the user asks to:
- Write tests for a function, hook, or service
- Add test coverage for a module
- Create test utilities or mock factories
- Set up Vitest configuration
- Test Zod schemas or validation logic

## Inputs
- **Source file** (string): path to the file to test
- **Test focus** (optional): specific function or scenario to test
- **Mock requirements** (optional): external dependencies to mock

## Outputs
- Test file: `<source>.test.ts` or `<source>.test.tsx` (colocated)
- Test helpers in `tests/helpers/` (if reusable mock factories needed)
- Vitest config (`vitest.config.ts`) if not present

## Procedure
1. Read and analyze the source file
2. Identify all exported functions/components/hooks
3. For each export, determine test cases:
   - **Happy path**: valid input → expected output
   - **Edge cases**: empty input, boundary values, large data
   - **Validation failures**: invalid types, missing fields
   - **Error scenarios**: thrown errors, rejected promises
4. Set up mocks for external dependencies (database, APIs)
5. Write tests using Arrange-Act-Assert pattern
6. Ensure test isolation — no shared mutable state

## Standards
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    it('should [behavior] when [condition]', () => {
      // Arrange
      const input = { /* ... */ };

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

### Mocking Rules
- `vi.mock('@/lib/db')` for database client
- `vi.mock('next/headers')` for cookies/headers
- `vi.fn()` for individual function mocks
- Reset in `beforeEach` — never rely on test execution order
- Mock at boundaries — not internal helpers

### Vitest Config (if needed)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

## Error Handling
- If the source file has no exports, inform the user there's nothing to test
- If external dependencies are complex, create mock factories in `tests/helpers/`
- If the module requires database setup, mock the Prisma client

## Dependencies
- `vitest` (dev dependency — suggest installing if not present)
- `@testing-library/react` (for component tests — suggest if needed)
- `@testing-library/jest-dom` (for DOM assertions — suggest if needed)

## Example
```
User: Write tests for lib/services/ranking.ts
Skill: Reads source → identifies exports → mocks database client → generates lib/services/ranking.test.ts with happy path, edge case, error tests for each exported function
```
