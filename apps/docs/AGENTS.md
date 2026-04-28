# Docs App Agent Instructions

These rules apply to `apps/docs`.

## Purpose

`apps/docs` owns the Fumadocs documentation site. It should document the starter for users, not
encode application business behavior.

## Rules

- Keep docs content and docs routing isolated from product packages.
- Do not import backend runtime clients, database clients, auth server instances, or app-only
  product components.
- Use existing Fumadocs/TanStack Start patterns before adding new docs infrastructure.
- Keep generated route trees and generated MDX outputs out of manual edits.
- When documentation describes implementation rules for coding agents, link to the relevant
  scoped `AGENTS.md` instead of duplicating strict rules.
