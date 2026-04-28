# Schemas Agent Instructions

These rules apply to `packages/schemas`.

## Purpose

`packages/schemas` contains reusable Zod schemas shared by API contracts, forms, and UI code.

## Rules

- Organize schemas by domain: `src/<domain>.ts`.
- Export schemas with explicit names such as `createProjectSchema`, `updateProjectSchema`,
  `projectOutputSchema`, and `projectListInputSchema`.
- Keep schemas runtime-portable. Do not import database clients, server env, API routers, React
  components, or browser globals.
- Put OpenAPI-friendly descriptions or metadata on public API fields when it helps generated docs.
- Prefer strict object schemas for API inputs unless passthrough behavior is explicitly required.
- Use coercion intentionally for URL/query values. Do not hide broad type mismatches behind coercion.
- Derive TypeScript types with `z.infer` near the consumer when possible. Export shared inferred
  types only when multiple packages need the same type name.
- Keep domain constants and enums here when they are shared across API and frontend validation.

## Anti-Patterns

- Do not duplicate schemas separately in frontend forms and API contracts.
- Do not put business logic, database queries, or side effects in schema modules.
- Do not export a large generic `types.ts` file for unrelated domains.
