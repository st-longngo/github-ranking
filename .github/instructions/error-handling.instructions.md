---
applyTo: '**/*.ts,**/*.tsx,**/*.js,**/*.jsx'
description: 'Error class hierarchy, try/catch placement, error boundaries, and logging rules'
---

# Error Handling Standards

## Error Class Hierarchy
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 'UNAUTHORIZED', 401);
  }
}
```

## Try/Catch Placement
- Catch errors at the service layer — not in individual utility functions
- Route Handlers catch service errors and map to HTTP responses
- Server Components use `error.tsx` boundaries — do NOT wrap renders in try/catch
- Use `unstable_rethrow` in catch blocks that might intercept Next.js internal throws (redirects, notFound)

## Error Boundaries (UI)
- `error.tsx` — catches rendering errors in a route segment (must be `'use client'`)
- `global-error.tsx` — catches errors in root layout
- `not-found.tsx` — renders when `notFound()` is called
- Always provide a "retry" action in error boundaries

## User-Facing vs Internal Errors
- User-facing: generic, helpful messages — "Something went wrong. Please try again."
- Internal: structured, detailed — logged with full context (error code, stack, request ID)
- Never expose stack traces, SQL queries, or internal paths to the client

## Logging
- Use structured logging (JSON format) in production
- Always log: error code, message, stack trace, request context
- Never log: passwords, tokens, PII, full request bodies with sensitive data

## Anti-Patterns
- Do NOT swallow errors with empty catch blocks
- Do NOT use `console.log` for error logging in production — use a structured logger
- Do NOT throw strings — always throw Error instances
- Do NOT catch errors just to re-throw them unchanged
