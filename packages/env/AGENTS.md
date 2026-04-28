# Env Package Agent Instructions

These rules apply to `packages/env`.

## Purpose

`packages/env` owns runtime environment validation and canonical URL construction.

## Rules

- Put server-only variables in `src/server.ts`, browser-exposed variables in `src/web.ts`, and
  truly shared validation helpers in `src/shared.ts`.
- Browser variables must use the `VITE_` prefix.
- Keep URL helpers in this package. Feature code should use `serverUrls` or `webUrls`, not string
  concatenation.
- `API_URL` and `VITE_API_URL` are the canonical backend origins. `SERVER_URL` and
  `VITE_SERVER_URL` are compatibility fallbacks only.
- Do not import app code, database clients, auth runtime objects, or React components.
- Update `.env.example` files when adding or changing required variables.
- Keep optional integrations fake-but-valid for local boot unless the integration is exercised
  locally.
