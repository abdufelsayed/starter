# @starter/db

Database layer with Drizzle ORM and PostgreSQL.

## Stack

- [Drizzle ORM](https://orm.drizzle.team) - Type-safe SQL ORM
- [PostgreSQL](https://postgresql.org) via `pg` driver
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) - Migrations and studio

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
import { db } from "@starter/db";
```

Exports the database client and re-exports Drizzle utilities.
