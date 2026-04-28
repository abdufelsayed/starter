# @starter/logging

Structured logging and OpenTelemetry instrumentation.

This README is explanatory. The strict implementation contract for agents is
[`packages/logging/AGENTS.md`](./AGENTS.md).

## Stack

- [Pino](https://getpino.io) - JSON logger
- [Axiom](https://axiom.co) - Log ingestion via `@axiomhq/pino`
- [OpenTelemetry](https://opentelemetry.io) - Distributed tracing

## Exports

```ts
import { createLogger } from "@starter/logging";
import { createAxiomExporter, setupGracefulShutdown } from "@starter/logging/instrumentation";
```
