# Starter Project Instructions

## Product Direction

Starter is a reusable SaaS starter, not an agent runtime product. The current target is a
production-oriented full-stack TypeScript template with authentication, billing, API routes,
database access, email flows, observability, docs, and reusable UI components.

Do not implement Tauri, Fly Sprites, Pi agents, bridge servers, project sandboxes, or agent
dashboards unless a new task explicitly asks for that product direction.

## Current Stack

- Runtime/package manager: Bun
- Monorepo: Turborepo
- Backend: Bun.serve, oRPC, Better Auth, Drizzle ORM, PostgreSQL
- Frontend: TanStack Start, TanStack Router, TanStack Query, TanStack Form
- UI: shadcn/ui-style components, Base UI, Tailwind CSS v4
- Validation: Zod v4
- Auth: Better Auth with email/password, magic link, OAuth, 2FA, organizations
- Billing: Stripe through `@better-auth/stripe`
- Observability: Pino, OpenTelemetry, Sentry, Axiom
- Testing: Vitest and Testing Library
- Formatting/linting: oxfmt and oxlint

## Repository Layout

```txt
apps/
  server/     Bun.serve API server for oRPC and Better Auth
  web/        TanStack Start SaaS frontend
  docs/       Fumadocs documentation site
packages/
  api/        oRPC contracts, procedures, middleware, routers
  auth/       Better Auth configuration and React client helpers
  db/         Drizzle client, schema, migrations, DB utilities
  email/      Email sending and React Email templates
  env/        t3-env environment validation
  logging/    Pino and OpenTelemetry helpers
  schemas/    Shared Zod schemas
  shared/     Shared utilities
  ui/         Reusable UI component library
tooling/
  tsconfig/   Shared TypeScript configs
```

## Commands

Use Bun. If `bun` is not on PATH in an automation shell, use `/Users/abdllahdev/.bun/bin/bun`.

- `bun dev` - Start all apps
- `bun build` - Build all packages and apps
- `bun typecheck` - Typecheck all packages and apps
- `bun lint` - Lint with oxlint
- `bun format` - Format with oxfmt
- `bun test` - Run tests
- `bun db:generate` - Generate Drizzle migrations
- `bun db:migrate` - Apply Drizzle migrations
- `bun db:studio` - Open Drizzle Studio

## Architecture Rules

- Put server-side business logic, CRUD, database access, and mutations in oRPC routes under
  `packages/api/src/router/`.
- Keep the web app thin. Web components call Better Auth client helpers or oRPC via TanStack Query.
- Do not access the database from `apps/web`.
- Use TanStack Start server functions only for framework concerns such as request/session plumbing,
  not for product mutations.
- Never use relative imports across package boundaries. Use `@starter/*` package imports.

Expected data flow:

```txt
Component -> TanStack Query/oRPC client -> /rpc -> packages/api -> Drizzle -> PostgreSQL
```

Auth-specific flows may call Better Auth endpoints through `@starter/auth/react`.

URL ownership:

- The backend API origin is `API_URL` on the server and `VITE_API_URL` in the web app.
- `SERVER_URL` and `VITE_SERVER_URL` are deprecated compatibility fallbacks only.
- Use `serverUrls` from `@starter/env/server` and `webUrls` from `@starter/env/web` for URL
  construction. Do not hand-build auth, RPC, billing callback, or app callback URLs in feature code.
- Do not route browser API calls through the TanStack Start/Nitro dev server. Browser and SSR API
  clients should call the configured API origin directly.

## Coding Conventions

- TypeScript strict mode.
- Avoid `any` in application code. Generated route trees and deeply generic wrappers are exceptions.
- Prefer named exports. Default exports are acceptable for route files and router modules that
  follow existing patterns.
- Use Zod for API inputs, form validation, and environment validation.
- Use `cn()` from `@starter/ui/lib/utils` for Tailwind class merging.
- File and folder names use kebab-case.
- React Compiler is enabled. Do not add manual memoization unless profiling or a local pattern
  shows it is needed.

## IDs

Use `nanoid` from `@starter/shared/nanoid` for application-generated IDs. The project standard is
11-character mixed-case alphanumeric IDs to keep indexed text values compact while retaining enough
entropy for this starter.

Do not change this to UUIDs or 16-character lowercase IDs unless the project direction changes.

## Environment

- Server env schema: `packages/env/src/server.ts`
- Web env schema: `packages/env/src/web.ts`
- Shared env schema: `packages/env/src/shared.ts`
- Server example: `apps/server/.env.example`
- Web example: `apps/web/.env.example`

Local development should work after copying the example env files and supplying only infrastructure
that is actually exercised locally, such as a PostgreSQL URL. Fake-but-valid values are acceptable
for optional integrations during local boot.

## Agentic Coding Notes

- Treat this file as the source of truth for future agents.
- Do not recreate the removed root `docs/` planning directory unless explicitly requested.
- Before adding a major feature, inspect existing package boundaries and reuse the local patterns.
- Prefer small, testable oRPC routes and shared Zod schemas over framework-local server actions.
- Add or update focused tests for auth redirects, billing utilities, API middleware, and form
  validation when touching those areas.
