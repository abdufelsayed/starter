# Starter

A modern, production-ready full-stack monorepo boilerplate.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Monorepo:** [Turborepo](https://turbo.build)
- **Frontend:**
  - [TanStack Start](https://tanstack.com/start) - Full-stack React framework
  - [TanStack Router](https://tanstack.com/router) - Type-safe routing
  - [TanStack Query](https://tanstack.com/query) - Data fetching
  - [TanStack Form](https://tanstack.com/form) - Form management
  - [React 19](https://react.dev)
  - [Tailwind CSS v4](https://tailwindcss.com)
  - [better-themes](https://www.npmjs.com/package/better-themes) - Theme management
- **Backend:**
  - [Bun.serve()](https://bun.sh/docs/api/http) - Native HTTP server
  - [oRPC](https://orpc.dev) - End-to-end type-safe APIs
  - [Better Auth](https://better-auth.com) - Authentication
  - [Drizzle ORM](https://orm.drizzle.team) - Type-safe SQL ORM
  - [PostgreSQL](https://postgresql.org)
- **Observability:**
  - [OpenTelemetry](https://opentelemetry.io) - Distributed tracing
  - [Sentry](https://sentry.io) - Error tracking
  - [Pino](https://getpino.io) + [Axiom](https://axiom.co) - Logging
- **Tooling:**
  - [TypeScript 5.9](https://typescriptlang.org)
  - [oxlint](https://oxc-project.github.io) - Linter
  - [oxfmt](https://oxc-project.github.io) - Formatter
  - [Lefthook](https://github.com/evilmartians/lefthook) - Git hooks

## Project Structure

```
starter/
├── apps/
│   ├── web/           # TanStack Start frontend (port 3000)
│   ├── server/        # Bun.serve() backend API (port 8080)
│   └── docs/          # Fumadocs documentation site (port 4000)
├── packages/
│   ├── api/           # oRPC router, middleware, and handlers
│   ├── auth/          # Better Auth config (email/password, Google OAuth, Stripe)
│   ├── db/            # Drizzle ORM schema and migrations
│   ├── email/         # React Email templates + Resend
│   ├── env/           # Type-safe environment config (t3-env)
│   ├── logging/       # Pino logger + OpenTelemetry
│   ├── schemas/       # Shared Zod validation schemas
│   ├── shared/        # Shared utilities (nanoid)
│   └── ui/            # Component library (shadcn/ui)
└── tooling/
    └── tsconfig/      # Shared TypeScript configurations
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3.5+
- [Node.js](https://nodejs.org) 22+
- PostgreSQL

### Setup

```bash
bun install
# configure apps/server/.env.local and apps/web/.env.local
bun db:push
bun dev
```

### Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `bun dev`         | Start all apps               |
| `bun build`       | Build all apps and packages  |
| `bun typecheck`   | Run type checking            |
| `bun lint`        | Lint with oxlint             |
| `bun format`      | Format with oxfmt            |
| `bun test`        | Run tests                    |
| `bun db:generate` | Generate database migrations |
| `bun db:push`     | Push schema to database      |
| `bun db:migrate`  | Run migrations               |
| `bun db:studio`   | Open Drizzle Studio          |

## Documentation

- [Web App](./apps/web/README.md)
- [Server](./apps/server/README.md)
- [Docs Site](./apps/docs/README.md)
- [API](./packages/api/README.md)
- [Auth](./packages/auth/README.md)
- [Database](./packages/db/README.md)
- [Email](./packages/email/README.md)
- [Environment](./packages/env/README.md)
- [Logging](./packages/logging/README.md)
- [Schemas](./packages/schemas/README.md)
- [Shared](./packages/shared/README.md)
- [UI](./packages/ui/README.md)
- [TSConfig](./tooling/tsconfig/README.md)

## License

Apache-2.0
