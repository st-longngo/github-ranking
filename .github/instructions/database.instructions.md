---
applyTo: '**/prisma/**,**/drizzle/**,**/services/**,**/lib/db*'
description: 'ORM patterns, naming conventions, query optimization, and migration strategy'
---

# Database Standards

## ORM
- Use Prisma or Drizzle as the ORM — no raw SQL unless performance-critical
- Place ORM client initialization in `lib/db.ts` — singleton pattern for dev/prod

## Naming Conventions
- Table names: `snake_case`, plural (`users`, `order_items`)
- Column names: `snake_case` (`created_at`, `user_id`)
- Foreign keys: `<referenced_table_singular>_id` (`user_id`, `order_id`)
- Indexes: `idx_<table>_<columns>` (`idx_users_email`)

## Schema Design
- Every table must have `id`, `created_at`, `updated_at`
- Prefer UUID for primary keys — use `cuid()` or `uuid()` default
- Use soft deletes (`deleted_at` timestamp) for user-facing data
- Add database indexes for all foreign keys and frequently queried columns

## Query Optimization
- Always use `select` or `include` with specific fields — never fetch entire rows when you need a subset
- Prevent N+1 queries: use `include` for related data or batch queries
- Use `Promise.all()` for independent parallel queries
- Use transactions for multi-table writes: `prisma.$transaction()`

## Migrations
- Name migrations descriptively: `add_email_to_users`, `create_order_items_table`
- Never edit a migration after it has been applied
- Always review generated SQL before applying

## Anti-Patterns
- Do NOT use string interpolation in SQL — always use parameterized queries
- Do NOT fetch all rows when you need a count — use `count()`
- Do NOT store JSON blobs for relational data — normalize the schema
- Do NOT skip validation before database writes — validate with Zod at the service layer
