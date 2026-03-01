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
VITE_SERVER_URL=https://api.your-domain.com
VITE_SENTRY_DSN=
AXIOM_TOKEN=
AXIOM_ENDPOINT=https://api.axiom.co
AXIOM_DATASET=starter-web
```
