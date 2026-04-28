# @starter/schemas

Reusable Zod schemas shared by API contracts, forms, and UI code.

The strict implementation contract for agents is [`packages/schemas/AGENTS.md`](./AGENTS.md).

## Responsibilities

- Define portable domain validation schemas.
- Keep API contracts and frontend forms aligned.
- Export shared enums and constants that are needed by multiple packages.
- Provide OpenAPI-friendly field descriptions where public API docs benefit from them.

## Layout

```txt
src/
  auth.ts
  billing.ts
  projects.ts
```

Use one file per domain. Avoid catch-all `types.ts` or `schemas.ts` files for unrelated domains.

## Naming

Prefer explicit names:

```ts
export const projectSchema = z.object({ ... });
export const createProjectSchema = z.object({ ... });
export const updateProjectSchema = createProjectSchema.partial();
export const projectListInputSchema = z.object({ ... });
```

Derive shared types with `z.infer` only when multiple packages need the same exported type name.

```ts
export type Project = z.infer<typeof projectSchema>;
```

## Boundaries

Schema modules should not import database clients, API routers, React components, server env, or
browser globals. Keep them portable so both backend contracts and frontend forms can depend on them.
