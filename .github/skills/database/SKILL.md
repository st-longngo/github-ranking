---
name: database
description: 'Design Prisma schema, build optimized queries, prepare migrations, handle transactions, optimize performance'
---

# Database Skill

## Trigger
Use this skill when the user asks to:
- Design or modify a database schema
- Create a Prisma model or migration
- Optimize database queries
- Handle database transactions
- Set up the database client
- Add indexes or relations

## Inputs
- **Schema/model description** (string): what data to store
- **Relations** (optional): how models connect
- **Query patterns** (optional): how data will be accessed
- **Performance concerns** (optional): specific query optimization needs

## Outputs
- Prisma schema updates (`prisma/schema.prisma`)
- Migration files (via `pnpm prisma migrate dev`)
- Database client singleton (`lib/db.ts`)
- Optimized query functions in `lib/` or `services/`

## Procedure
1. Design the schema following naming conventions:
   - Tables: `snake_case`, plural (`users`, `repositories`)
   - Columns: `snake_case` (`created_at`, `star_count`)
   - Foreign keys: `<table_singular>_id` (`user_id`)
2. Add required fields: `id` (cuid/uuid), `created_at`, `updated_at`
3. Define relations with proper cascade rules
4. Add indexes for foreign keys and frequently queried columns
5. Create the Prisma client singleton if it doesn't exist
6. Write optimized query functions using `select`/`include`

## Standards
- Every table: `id`, `created_at`, `updated_at`
- UUID/CUID for primary keys — not auto-increment
- Soft deletes (`deleted_at`) for user-facing data
- Explicit `select` in queries — never fetch all columns when unnecessary
- `include` for related data — prevent N+1 queries
- `Promise.all()` for independent parallel queries
- `$transaction()` for multi-table writes
- Parameterized queries only — never string interpolation

## Database Client Singleton
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Error Handling
- Wrap database calls in try/catch at the service layer
- Map Prisma errors to `AppError` subclasses:
  - `P2002` (unique constraint) → `ValidationError`
  - `P2025` (not found) → `NotFoundError`
- Never expose raw Prisma errors to the client

## Dependencies
- `prisma` (dev dependency)
- `@prisma/client` (production dependency)
- Suggest installing if not present

## Example
```
User: Create a schema for GitHub repositories with star counts and language
Skill: Updates prisma/schema.prisma → adds Repository model with fields → adds indexes for star_count and language → creates lib/db.ts → generates migration
```
