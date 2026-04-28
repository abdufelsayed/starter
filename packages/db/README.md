# @starter/db

Database package for the Drizzle client, PostgreSQL schema, migrations, and database-only helpers.

The strict implementation contract for agents is [`packages/db/AGENTS.md`](./AGENTS.md).

## Responsibilities

- Define Drizzle tables, indexes, relations, and schema exports.
- Provide the configured database client.
- Provide reusable database primitives such as cursor pagination.
- Own migration generation and migration metadata.

Application business behavior belongs behind backend API boundaries, not in frontend apps.

## Layout

```txt
src/
  index.ts
  schema/
    index.ts
    auth.ts
    projects.ts
  utils/
    pagination.ts
```

Use one schema file per domain when adding domain data.

## Schema Guidelines

- Add indexes for ownership scopes, common filters, foreign keys, and API sort keys.
- Define relations near the tables they connect.
- Keep schema modules side-effect free.
- Export new schema files from `src/schema/index.ts`.
- Generate migrations when schema changes.

## Scripts

```bash
bun db:generate  # Generate migrations from schema
bun db:migrate   # Run migrations
bun db:push      # Push schema directly to database
bun db:pull      # Pull schema from database
bun db:studio    # Open Drizzle Studio
```

## Exports

```ts
import { db, eq, and, sql } from "@starter/db";
```

The package exports the database client and Drizzle utilities.
