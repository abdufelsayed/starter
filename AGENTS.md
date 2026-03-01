# CLAUDE.md -- Project Conventions

## Project Overview

Modern full-stack TypeScript monorepo using **Bun** as the runtime and package manager, orchestrated with **Turborepo**.

## Monorepo Structure

```
apps/
  server/     -- Bun.serve() API server (oRPC + Better Auth + Drizzle)
  web/        -- TanStack Start frontend (SSR + SPA via Nitro + Vite)
  docs/       -- Documentation site
packages/
  api/        -- oRPC router definitions and procedures
  auth/       -- Better Auth configuration
  db/         -- Drizzle ORM schema, migrations, client
  email/      -- Email templates and sending (Resend)
  env/        -- t3-env environment variable validation
  logging/    -- Pino logger setup
  schemas/    -- Shared Zod schemas (validation, forms, API inputs)
  shared/     -- Shared utilities (nanoid, etc.)
  ui/         -- shadcn/ui + Base UI component library
tooling/
  tsconfig/   -- Shared TypeScript configurations
```

## Tech Stack

- **Runtime/PM**: Bun
- **Backend**: Bun.serve() + oRPC + Drizzle ORM + Better Auth
- **Frontend**: TanStack Start + TanStack Query + TanStack Form
- **UI**: shadcn/ui + Base UI (`@base-ui/react`) + Tailwind CSS v4
- **Validation**: Zod (v4)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Better Auth (Google OAuth, email)
- **Payments**: Stripe (via `@better-auth/stripe`)
- **Observability**: Pino + OpenTelemetry + Sentry + Axiom
- **Linting/Formatting**: oxlint + oxfmt
- **Testing**: Vitest + Testing Library
- **Build**: tsdown (server), Vite + Nitro (web)

## Key Commands

- `bun dev` -- Start all apps in dev mode
- `bun build` -- Build all packages and apps
- `bun typecheck` -- TypeScript check across all packages
- `bun lint` -- Lint with oxlint
- `bun format` -- Format with oxfmt
- `bun db:generate` -- Generate Drizzle migrations
- `bun db:migrate` -- Run Drizzle migrations
- `bun db:studio` -- Open Drizzle Studio

## Import Conventions

- **`@starter/*`** for monorepo packages:
  - `@starter/ui/components/button` -- UI components
  - `@starter/ui/lib/utils` -- UI utilities (cn, etc.)
  - `@starter/ui/hooks/use-mobile` -- UI hooks
  - `@starter/db` -- Database client and schema
  - `@starter/schemas/auth` -- Shared Zod schemas
  - `@starter/env/server`, `@starter/env/web` -- Env vars
  - `@starter/shared` -- Shared utilities
  - `@starter/api` -- oRPC router and types
  - `@starter/auth` -- Auth configuration
  - `@starter/logging` -- Logger
- **`@/*`** for app-local imports in the web app (maps to `./src/*`)
- Never use relative paths across package boundaries

## Architecture: Server vs Client Boundary

- **ALL server-side logic (CRUD, business logic, database access) MUST be implemented as oRPC routes** in `packages/api/src/router/` following the grouped router pattern (see `.claude/skills/orpc-route.md`)
- **NEVER use TanStack Start server functions (`createServerFn`) for data mutations or business logic** -- those are reserved only for auth session checks (`getSessionFn`) and framework-level concerns
- The web app (`apps/web/`) is a **thin client** -- it calls oRPC routes via TanStack Query, never talks to the database directly
- Data flow: **Component → TanStack Query (`orpc.*`) → oRPC RPC endpoint → `packages/api` handler → Drizzle ORM → PostgreSQL**

## Code Style

- TypeScript strict mode, no `any`
- Use `nanoid` from `@starter/shared` for ID generation (not UUIDs) -- 16-char lowercase alphanumeric
- Zod for all validation (API inputs, form validation, env vars)
- No default exports except for route files (oRPC routes, TanStack Router routes)
- Prefer named exports everywhere else
- Use `cn()` from `@starter/ui/lib/utils` for Tailwind class merging
- React Compiler enabled (no manual memoization needed)

## File Naming

- **kebab-case** for all files and folders (e.g., `user-profile.tsx`, `auth-schema.ts`)

## Environment Variables

- Managed via **t3-env** in `@starter/env`
- Server vars: `packages/env/src/server.ts` (DATABASE_URL, API keys, etc.)
- Client vars: `packages/env/src/web.ts` (must have `VITE_` prefix)
- Server `.env.local` lives in `apps/server/.env.local`
- Never hardcode env values; always use the validated env objects (`serverEnv`, `webEnv`)
- Set `SKIP_ENV_VALIDATION=1` to bypass validation during CI/builds

## Skills Reference

See `.claude/skills/` for detailed implementation patterns:

- `orpc-route.md` -- oRPC route definitions, grouped router pattern, procedures, middleware
- `tanstack-query-orpc.md` -- TanStack Query + oRPC integration, optimistic updates, query keys
- `tanstack-start.md` -- TanStack Start routes, search params, server middleware, SSR, SEO
- `tanstack-form.md` -- TanStack Form with Zod validation, shadcn/ui field components
- `shadcn-base-ui.md` -- shadcn/ui + Base UI component wrappers, variants, styling
