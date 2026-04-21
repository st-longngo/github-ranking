---
applyTo: '**/api/**'
description: 'Route Handlers, response format, validation, auth, and runtime selection'
---

# API Design Standards

## Route Handlers
- Place in `app/api/` using `route.ts` convention
- Export async functions named after HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use Web `Request` and `Response` APIs — use `NextRequest`/`NextResponse` for cookies, headers, redirects
- A `route.ts` cannot coexist with `page.tsx` in the same folder

## Response Format
```typescript
// Standard response envelope
interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
  meta?: { page?: number; limit?: number; total?: number };
}

// Success
return Response.json({ data: users, meta: { total: 100 } });

// Error
return Response.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
```

## Status Codes
- `200` — Success (GET, PUT, PATCH)
- `201` — Created (POST)
- `204` — No Content (DELETE)
- `400` — Bad Request (validation failure)
- `401` — Unauthorized (missing/invalid auth)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found
- `429` — Too Many Requests (rate limited)
- `500` — Internal Server Error

## Request Validation
- Validate all input with Zod schemas
- Parse `request.json()` through a Zod schema before use
- Validate path params, query params, and request body separately
- Return `400` with specific field errors on validation failure

## Authentication
- Check auth in every non-public endpoint
- Use cookies for session tokens (httpOnly, secure, sameSite: strict)
- Never trust client-sent user IDs — derive from session

## Runtime
- Default to Node.js runtime
- Use Edge runtime only for geo-routing, simple redirects, or header manipulation
- Declare runtime: `export const runtime = 'edge'`

## Anti-Patterns
- Do NOT call your own Route Handlers from Server Components — extract shared logic into `lib/`
- Do NOT use `req.body` without validation
- Do NOT expose stack traces in error responses
