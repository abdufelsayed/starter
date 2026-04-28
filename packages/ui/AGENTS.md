# UI Package Agent Instructions

These rules apply to `packages/ui`.

## Authority

- Use official shadcn/ui docs for CLI, monorepo, component, and form patterns:
  - https://ui.shadcn.com/docs/monorepo
  - https://ui.shadcn.com/docs/components-json
  - https://ui.shadcn.com/docs/forms/tanstack-form
- Use official TanStack Table docs for data-grid/table behavior:
  - https://tanstack.com/table/v8/docs/framework/react/react-table
  - https://tanstack.com/table/latest/docs/framework/react/guide/table-state
- Use local component APIs and styling conventions before inventing variants.
- When using the shadcn CLI, use this repo's Bun package runner.

## Purpose

`packages/ui` is the reusable design-system package. Components here must be product-agnostic and
safe for any app in the workspace.

## Allowed Here

- shadcn/Base UI primitives and composed primitives.
- Generic layout, overlay, navigation, feedback, form, table, chart, and typography components.
- Generic hooks that do not depend on app domains.
- Logos and icons that are intentionally shared assets.
- The shared Tailwind CSS theme and global styles.

## Not Allowed Here

- Auth, billing, organization, project, or product workflow components.
- Better Auth, oRPC, TanStack Router, or app query logic.
- Database, server env, or app-specific service imports.
- Route-specific empty states, dialogs, filters, or tables.

## Component Rules

- Keep component APIs small and composable.
- Prefer existing variants before adding new props.
- Use semantic theme tokens and CSS variables; do not hard-code product colors.
- Use `cn()` for class merging.
- Use `gap-*`, not `space-x-*` or `space-y-*`.
- Use `size-*` when width and height are equal.
- Preserve accessibility requirements from Base UI/shadcn components.
- Dialog, Sheet, Drawer, and AlertDialog content must include an accessible title.
- Tabs triggers must be inside `TabsList`.
- Menus and selects should preserve their required group/item structure.
- Buttons do not have custom `isLoading` props. Compose `Spinner` plus `disabled`.
- Icons inside components should normally omit manual sizing classes and rely on component CSS.
- TanStack Table components in this package must stay product-agnostic. They may expose controlled
  table state and callbacks, but must not import app routes, oRPC clients, Better Auth clients, or
  domain schemas.

## Adding Or Updating Components

- Check existing components first.
- Use `bunx --bun shadcn@latest` for shadcn CLI operations.
- Do not overwrite locally modified components without explicit approval.
- After adding registry components, read the generated files and fix imports, accessibility, icon
  usage, and local style mismatches.
- Keep `components.json` aliases aligned with workspace package names.
