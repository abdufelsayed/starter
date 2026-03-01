# @starter/api

oRPC API router, middleware, and handlers.

## Stack

- [oRPC](https://orpc.dev) - Type-safe RPC framework
- [Zod](https://zod.dev) - Schema validation
- [Drizzle ORM](https://orm.drizzle.team) - Database access
- [Pino](https://getpino.io) - Structured logging
- [Sentry](https://sentry.io) + [OpenTelemetry](https://opentelemetry.io) for observability

## Exports

```ts
import { ... } from "@starter/api"
```

Exports the router type, handler factories (RPC + OpenAPI), and middleware (auth, retry, DB injection, logging).
