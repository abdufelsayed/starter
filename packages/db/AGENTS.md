# Database Agent Instructions

These rules apply to `packages/db`.

## Purpose

`packages/db` owns the Drizzle client, schema, migrations, and database-only helpers. Application
business behavior should be called from backend APIs, not from frontend apps.

## Schema Rules

- Put tables for a domain in `src/schema/<domain>.ts`.
- Export all schema modules from `src/schema/index.ts`.
- Use explicit indexes for foreign keys, common filters, ownership scopes, and sort keys used by API
  list endpoints.
- Define relations next to the tables they describe.
- Use shared ID helpers for application-generated text IDs when a table is not using serial IDs.
- Keep schema files deterministic. Do not read env, instantiate services, or run queries in schema
  modules.

## Query Helper Rules

- Database helpers may live under `src/utils` only when they are reusable across domains.
- Domain-specific query and mutation orchestration belongs in `packages/api` unless it is a pure
  database primitive.
- Prefer transactions for multi-table writes.
- Prefer cursor pagination for growing datasets. Offset pagination is acceptable for UI data grids
  that require total counts.
- Never build SQL sort columns from unchecked user input. Map allowed sort keys to Drizzle columns.

## Boundary Rules

- Do not import from `apps/*`.
- Do not import React, web-only code, auth UI clients, or API routers.
- Do not run migration generation as part of ordinary code edits unless the task changes schema.
- When schema changes, update or generate the matching migration and call out any migration risk.
