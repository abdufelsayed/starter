# @starter/server

Bun HTTP backend API server.

## Stack

- [Bun.serve()](https://bun.sh/docs/api/http) - Native HTTP server
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

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=8080
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
AXIOM_TOKEN=
AXIOM_DATASET=starter-server
CORS_ORIGIN=http://localhost:3000
CORS_HOST=http://localhost:3000
API_URL=http://localhost:8080
WEB_APP_URL=http://localhost:3000
```
