# @starter/web

TanStack Start frontend application.

## Stack

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [TanStack Router](https://tanstack.com/router) - File-based, type-safe routing
- [TanStack Query](https://tanstack.com/query) - Server state management
- [TanStack Form](https://tanstack.com/form) - Form management
- [React 19](https://react.dev) with React Compiler
- [Tailwind CSS v4](https://tailwindcss.com)
- [better-themes](https://www.npmjs.com/package/better-themes) - Theme management
- [oRPC](https://orpc.dev) client for type-safe API calls
- [Sentry](https://sentry.io) + [OpenTelemetry](https://opentelemetry.io) for observability

## Scripts

```bash
bun dev        # Start dev server (port 3000)
bun build      # Production build (Vite + Nitro)
bun preview    # Preview production build
bun start      # Start production server
bun typecheck  # Run type checking
```

## Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8080
VITE_WEB_URL=http://localhost:3000
VITE_SENTRY_DSN=https://public@example.ingest.sentry.io/1
VITE_APP_VERSION=dev
AXIOM_TOKEN=xaat-dev-placeholder-token
AXIOM_ENDPOINT=https://api.axiom.co
AXIOM_DATASET=starter-web
OTEL_SERVICE_NAME=starter-web
OTEL_SERVICE_VERSION=1.0.0
```
