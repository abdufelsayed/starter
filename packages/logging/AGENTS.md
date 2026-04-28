# Logging Package Agent Instructions

These rules apply to `packages/logging`.

## Purpose

`packages/logging` owns structured logging and OpenTelemetry helper factories.

## Rules

- Keep this package app-agnostic. Do not import API routers, auth clients, app routes, or database
  schema.
- Logging helpers should accept explicit configuration instead of reading env directly.
- Do not log secrets, tokens, authorization headers, cookies, connection strings, or raw sensitive
  records.
- Preserve trace/span correlation fields in logger output.
- Keep process lifecycle handlers reusable and dependency-injected.
- Add focused tests when changing sampling, exporter configuration, shutdown behavior, or error
  handling.
