# Agent Instructions

This file is the repo-wide agent contract. More specific `AGENTS.md` files deeper in the
tree override this file for their subtree.

## Source Of Truth

- Treat existing READMEs and historical planning notes as stale unless they were updated for the
  current task or match the source code and official framework docs.
- For framework behavior, prefer official documentation over local examples. For oRPC, start with
  https://orpc.dev/llms.txt and the linked Markdown docs.
- Use the source code to discover what currently exists, not to assume that every existing pattern is
  correct.
- Ask before changing product direction, swapping core libraries, or introducing a new architectural
  pattern that is not already established in scoped instructions.

## Working Rules

- Keep changes scoped to the domain or package involved in the task.
- Prefer domain-oriented structure over catch-all utility or feature dumping.
- Never use relative imports across workspace package boundaries. Use workspace package imports.
- Do not access database code from frontend apps. Server-side data access belongs behind backend API
  boundaries.
- Use Bun for package commands unless a package clearly documents a different local tool.
- Add or update focused tests when changing behavior, authorization, validation, database queries,
  billing, or user-facing flows.
- Do not make broad refactors while implementing a narrow feature unless the refactor is required for
  correctness.

## Documentation Rules

- Write docs for coding agents first: explicit file locations, required steps, and anti-patterns.
- Put strict implementation rules in the nearest `AGENTS.md`.
- Put explanatory context, examples, and official links in READMEs.
- When local docs and scoped `AGENTS.md` conflict, follow the scoped `AGENTS.md` and update stale docs
  as part of the task when practical.
