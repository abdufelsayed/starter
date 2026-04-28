# Routes Agent Instructions

These rules apply to `apps/web/src/routes`.

## Route Responsibilities

- Route files own TanStack route configuration: path identity, `validateSearch`, `beforeLoad`,
  `loader`, `head`, route-level error/pending/not-found components, and layout `Outlet`s.
- Route files should stay thin. Move non-trivial UI into `-components` and non-trivial route-local
  hooks into `-hooks`.
- Use pathless layout routes prefixed with `_` for shared auth/layout behavior that should not add a
  URL segment.
- Use directory routes with `route.tsx` when a page needs route-local components, hooks, or helpers.

## Data And Search

- Validate search params with `validateSearch`.
- Use `beforeLoad` for auth gates, redirects, and route-level access checks.
- Use `loader` to ensure critical render data is available before component render.
- Use `context.queryClient.ensureQueryData(...)` for TanStack Query/oRPC/Better Auth data.
- Do not read `window.location` to drive route state. Use typed router params and search APIs.
- Do not duplicate the same preload query in multiple child routes when a parent route can own it.
- Route search params own shareable list/table state such as page, page size, sorting, filters, and
  selected tabs. Feed that state into loader query input instead of duplicating it in component-only
  state.

## Components

- Components only used by one route group go in that group's `-components` folder.
- Files and folders prefixed with `-` are private implementation details and should not be imported
  from unrelated route groups.
- Shared product UI should move to `apps/web/src/components/<domain>` only after a second route needs
  it.
- Route-local tables should use TanStack Table when they need sorting, filtering, pagination,
  selection, column visibility, or column sizing.

## Examples

Small route:

```txt
routes/projects.tsx
```

Larger route:

```txt
routes/projects/
  route.tsx
  -components/
    projects-table.tsx
  -hooks/
    use-project-filters.ts
```

Protected layout:

```txt
routes/_protected.tsx
routes/_protected/dashboard.tsx
```
