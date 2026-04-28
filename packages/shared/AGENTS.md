# Shared Package Agent Instructions

These rules apply to `packages/shared`.

## Purpose

`packages/shared` owns tiny runtime-agnostic utilities that are safe for server, browser, and
package-level code.

## Rules

- Keep utilities dependency-light and domain-neutral.
- Do not import React, database clients, auth runtime objects, API routers, app code, env modules, or
  server-only APIs.
- Add a new export only when more than one package should reasonably depend on it.
- Keep IDs generated through the existing `nanoid` helper unless a task explicitly changes the ID
  strategy.
