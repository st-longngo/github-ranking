---
applyTo: '**/middleware.*,**/proxy.*,**/auth/**,**/api/**'
description: 'OWASP top 10, input validation, auth patterns, secrets management, and security headers'
---

# Security Standards

## OWASP Top 10 Awareness
- A01 Broken Access Control: auth middleware on every non-public endpoint, ownership checks on resources
- A02 Security Misconfiguration: security headers via `next.config.ts`, no debug in production
- A03 Supply Chain: `pnpm audit`, lockfile integrity, review new dependencies
- A04 Cryptographic Failures: TLS everywhere, no secrets in source code
- A05 Injection: parameterized queries, input validation, no raw HTML with user input

## Input Validation
- Validate ALL user input server-side with Zod — client validation is UX only
- Validate path params, query params, request body, and headers separately
- Reject unexpected fields — use `.strict()` in Zod schemas
- Never use `eval()`, `new Function()`, or template literals with user input in SQL/shell

## Authentication & Sessions
- Server Actions: always verify session at the top of every `'use server'` function
- Route Handlers: check auth before processing any request
- Use httpOnly, secure, sameSite strict cookies for session tokens
- Short-lived access tokens (15 min max), refresh token rotation

## Secrets Management
- Store secrets in `.env.local` — never commit to version control
- `.env`, `.env.local`, `.env.*.local` must be in `.gitignore`
- Never prefix secrets with `NEXT_PUBLIC_` — they get inlined into client bundles
- Validate required environment variables at startup with Zod

## Security Headers (next.config.ts)
- Content-Security-Policy: restrict `script-src`, `style-src`, `img-src`
- Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`
- Referrer-Policy: `strict-origin-when-cross-origin`

## React / Next.js Specific
- Never use `dangerouslySetInnerHTML` with unsanitized user input — use DOMPurify
- Never pass database objects directly to Client Components — pick needed fields only
- Middleware/proxy must protect both pages and API routes

## Anti-Patterns
- Do NOT store JWT in localStorage — use httpOnly cookies
- Do NOT trust client-sent user IDs or roles
- Do NOT expose stack traces or SQL errors in API responses
- Do NOT use `*` for CORS with credentials
