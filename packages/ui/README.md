# @starter/ui

Reusable UI component library for workspace apps.

This README is explanatory. The strict implementation contract for agents is [`packages/ui/AGENTS.md`](./AGENTS.md).

## Official References

- [shadcn/ui monorepo](https://ui.shadcn.com/docs/monorepo)
- [components.json](https://ui.shadcn.com/docs/components-json)
- [shadcn/ui TanStack Form](https://ui.shadcn.com/docs/forms/tanstack-form)
- [TanStack Table React adapter](https://tanstack.com/table/v8/docs/framework/react/react-table)
- [TanStack Table state guide](https://tanstack.com/table/latest/docs/framework/react/guide/table-state)

## Purpose

`packages/ui` owns product-agnostic primitives and shared visual infrastructure:

- Base UI/shadcn primitives
- form controls
- overlays
- cards and layout primitives
- tables/data grids
- charts
- shared hooks
- shared logos/icons
- global Tailwind CSS theme

Product-aware components belong in `apps/web/src/components` or route-local `-components` folders.

## Exports

```ts
import { Button } from "@starter/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@starter/ui/components/field";
import { cn } from "@starter/ui/lib/utils";
import { useMobile } from "@starter/ui/hooks/use-mobile";
import "@starter/ui/globals.css";
```

## Component Guidelines

- Compose from existing primitives before adding new components.
- Keep APIs small and slot-friendly.
- Prefer existing variants before adding new props.
- Use semantic tokens and CSS variables.
- Use `cn()` for class merging.
- Preserve accessibility behavior from Base UI primitives.
- Keep components product-agnostic.

## Tables And Data Grids

`packages/ui` may expose generic TanStack Table-powered primitives and data-grid pieces. Keep them
headless/product-agnostic:

- accept data, columns, controlled state, and callbacks as props
- render with shared table, toolbar, filter, pagination, and menu primitives
- do not import app routes, oRPC clients, Better Auth clients, or domain schemas
- do not own URL search params; app routes own URL state and pass it down

Use plain table primitives for static display tables. Use TanStack Table-backed components when a
consumer needs sorting, filtering, pagination, row selection, column visibility, or column sizing.

## Forms

Use the Field component family for forms:

```tsx
<FieldGroup>
  <Field data-invalid={isInvalid}>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" aria-invalid={isInvalid} />
    {isInvalid ? <FieldError errors={errors} /> : null}
  </Field>
</FieldGroup>
```

## shadcn CLI

Run shadcn CLI commands from this package when adding shared primitives:

```bash
bunx --bun shadcn@latest add button
```

For app-level blocks, run the CLI from `apps/web` so generated product components are placed in the
app workspace.

After adding or updating components, inspect generated files for import paths, accessibility, icon
usage, and style consistency.
