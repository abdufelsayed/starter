# @starter/server

Node.js h3 backend API server.

This README is explanatory. The strict implementation contract for agents is
[`apps/server/AGENTS.md`](./AGENTS.md).

## Stack

- [h3](https://h3.dev) - Minimal HTTP server framework
- [oRPC](https://orpc.dev) - Type-safe RPC and OpenAPI
- [Better Auth](https://better-auth.com) - Authentication
- [Drizzle ORM](https://orm.drizzle.team) - Database access
- [Sentry](https://sentry.io) + [OpenTelemetry](https://opentelemetry.io) for observability
- [Pino](https://getpino.io) - Structured logging

## Routes

| Path          | Description           |
| ------------- | --------------------- |
| `/health`     | Health check          |
| `/ready`      | Readiness check       |
| `/rpc/*`      | oRPC API endpoints    |
| `/api/auth/*` | Better Auth endpoints |
| `/api/*`      | OpenAPI endpoints     |

## Scripts

```bash
bun dev        # Start dev server with watch (port 8080)
bun build      # Build with tsdown
bun start      # Start production server
bun typecheck  # Run type checking
```

## Environment Variables

Create `.env.local` from the checked-in example:

```bash
cp apps/server/.env.example apps/server/.env.local
```

The backend origin is `API_URL`; `WEB_APP_URL` is the browser app origin used for auth callbacks,
CORS, and product redirects. Keep URL construction in `@starter/env/server` rather than building
callback, auth, RPC, or OpenAPI URLs by hand in feature code.
