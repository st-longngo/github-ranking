---
name: backend
description: 'Develop API Route handlers, Server Actions, middleware, authentication, services and business logic'
---

# Backend Skill

## Trigger
Use this skill when the user asks to:
- Create an API endpoint (Route Handler)
- Implement a Server Action for form mutations
- Add authentication/authorization logic
- Build a service or business logic module
- Set up middleware/proxy for request handling
- Implement data validation

## Inputs
- **Endpoint/action description** (string): what the API should do
- **HTTP method** (optional): GET, POST, PUT, PATCH, DELETE
- **Auth requirements** (optional): public, authenticated, role-based
- **Request/response shape** (optional): expected data format

## Outputs
- Route Handler files (`app/api/.../route.ts`)
- Server Action files (functions with `'use server'`)
- Service modules in `lib/`
- Zod validation schemas
- Middleware/proxy configuration

## Procedure
1. Determine the appropriate pattern:
   - **Route Handler**: external API consumption, webhooks, file uploads, non-form mutations
   - **Server Action**: form submissions, inline mutations from UI
   - **Service**: reusable business logic called by routes or actions
2. Create Zod schema for request validation
3. Implement the handler/action:
   - Validate input with Zod
   - Check authentication/authorization
   - Call service layer for business logic
   - Return standardized response envelope `{ data, error, meta }`
4. Handle errors with `AppError` hierarchy
5. Add proper HTTP status codes

## Standards
- Standard response envelope: `{ data?: T, error?: { code, message }, meta?: { page, limit, total } }`
- Validate ALL input with Zod — `schema.parse(data)` for typed results
- Auth check at the top of every non-public handler
- Never trust client-sent user IDs — derive from session
- Use parameterized queries — never string interpolation for SQL
- Default to Node.js runtime — Edge only for geo-routing or simple redirects
- Never call Route Handlers from Server Components — share logic via `lib/`

## Error Handling
- Service layer throws `AppError` subclasses (`NotFoundError`, `ValidationError`, `UnauthorizedError`)
- Route Handlers catch and map to HTTP responses
- Server Actions catch and return error objects to the UI
- Never expose stack traces in responses

## Dependencies
- `zod` (validation — suggest installing if not present)
- `next` (NextRequest, NextResponse, cookies, headers)
- Database client (Prisma/Drizzle if configured)

## Example
```
User: Create an API to fetch GitHub repository rankings
Skill: Creates lib/schemas/ranking.ts (Zod schema) → creates lib/services/ranking.ts (business logic) → creates app/api/rankings/route.ts (GET handler with validation, error handling, standard response)
```
