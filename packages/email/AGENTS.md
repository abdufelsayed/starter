# Email Package Agent Instructions

These rules apply to `packages/email`.

## Purpose

`packages/email` owns email delivery helpers and React Email templates.

## Rules

- Keep templates portable and renderable in the email preview app.
- Do not import database clients, API routers, app components, or browser-only modules.
- Keep sending behavior in delivery helpers; keep visual/email copy in templates.
- Reuse shared styles from this package for spacing, typography, buttons, and containers.
- Export new templates from `src/templates/index.ts`.
- Keep template props serializable and explicit.
- Use `@starter/env/server` for delivery provider configuration.
