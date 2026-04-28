# Auth Package Agent Instructions

These rules apply to `packages/auth`.

## Purpose

`packages/auth` owns Better Auth server configuration, auth plugins, auth email hooks, billing
integration hooks, and the reusable React auth client factory.

## Rules

- Keep the server auth instance in the server export and React client helpers under `src/react`.
- Apps own runtime wiring such as request headers, credentials, and app-specific redirect handling.
- Do not import app routes, app components, or frontend-only UI into server auth configuration.
- Do not import `apps/server` or API routers into auth client code.
- Use `@starter/env` URL helpers for auth, callback, and billing URLs.
- Use `@starter/email` templates for auth email flows instead of embedding email markup in auth
  configuration.
- Keep TanStack Query helper behavior generic and client-safe.
- Add focused tests when changing auth redirects, session behavior, organization flows, billing
  hooks, or query/mutation helper typing.
