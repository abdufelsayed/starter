# App Components Agent Instructions

These rules apply to `apps/web/src/components`.

## Purpose

This folder is for reusable, product-aware frontend components. Components here may know about
auth, billing, organizations, oRPC query utilities, routing, and app workflows.

## Placement

- Use `src/components/<domain>` for domain components such as account settings, billing, or
  organization settings.
- Keep components route-local until they are reused by more than one route group.
- Move only product-agnostic primitives to `packages/ui`.
- Keep domain utilities beside their domain components unless they are reused broadly across the app.

## Data And State

- Use typed Better Auth or oRPC query/mutation options.
- Prefer `useSuspenseQuery` when the route loader preloads the data.
- Prefer `useQuery` for optional or conditionally enabled data.
- Keep URL-relevant state in TanStack Router search params, not component-only state.
- Keep local UI state local when it does not need to survive navigation or deep linking.
- Invalidate targeted query keys after mutations. Do not clear the whole QueryClient unless the user
  session or identity changed.
- Components with shareable table/list controls should receive Router search state from the route or
  update it through typed navigation. Do not keep page, filter, and sort state only in component
  state when it should survive links and reloads.

## Composition

- Compose from `@starter/ui` primitives.
- Do not reimplement design-system primitives with custom `div`s.
- Use `Field` components for forms and full `Card` composition for card surfaces.
- Use `Alert`, `Empty`, `Skeleton`, `Spinner`, `Badge`, `Separator`, and `sonner` instead of custom
  one-off equivalents.
- Use TanStack Table through `@starter/ui` table/data-grid primitives for interactive data grids.
  Keep simple static tables on the plain table primitives.
- Keep app components visually consistent with nearby screens. Avoid creating a new page language for
  a single component.

## Boundaries

- Do not import from `packages/db`, backend-only modules, or route-private `-components` folders.
- Do not call `/rpc` or `/api` with hand-built fetches for app data.
- Do not put generic component variants here if they belong in `packages/ui`.
