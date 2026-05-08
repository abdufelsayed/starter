# Server App Agent Instructions

These rules apply to `apps/server`.

## Purpose

`apps/server` owns the Node.js HTTP process and mounts backend integrations. Product behavior belongs in
workspace packages, especially `@starter/api`, `@starter/auth`, `@starter/env`, and
`@starter/logging`.

## Rules

- Keep server entrypoints thin: load env, initialize observability, create handlers, and start the
  h3 server with Node.js.
- Do not implement product CRUD, authorization policy, billing logic, or database queries directly
  in `apps/server`.
- Mount oRPC through `@starter/api` handlers and Better Auth through `@starter/auth`.
- Use `serverEnv` and `serverUrls` from `@starter/env/server`; do not hand-build callback, auth,
  RPC, OpenAPI, billing, or app URLs.
- Keep CORS and cookie behavior aligned with the configured API and web origins.
- Add fetch-level tests only when changing server wiring, CORS, headers, cookies, handler routing,
  or process lifecycle behavior.
