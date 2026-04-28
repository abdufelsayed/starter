# Web App Agent Instructions

These rules apply to `apps/web`.

## Authority

- Official TanStack docs are the authority for routing, loaders, search params, Start server
  functions, and Query integration:
  - https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts
  - https://tanstack.com/router/latest/docs/guide/code-splitting
  - https://tanstack.com/router/latest/docs/guide/external-data-loading
  - https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
  - https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
  - https://tanstack.com/query/latest/docs/framework/react/overview
  - https://tanstack.com/form/latest/docs/framework/react
  - https://tanstack.com/table/v8/docs/framework/react/react-table
  - https://tanstack.com/table/latest/docs/framework/react/guide/table-state
- Official shadcn/ui docs are the authority for component workspace layout, `components.json`,
  forms, and component composition:
  - https://ui.shadcn.com/docs/monorepo
  - https://ui.shadcn.com/docs/components-json
  - https://ui.shadcn.com/docs/forms/tanstack-form
- Treat local examples as evidence, not proof of correctness. Prefer scoped `AGENTS.md` rules and
  official docs when there is a conflict.

## Package Boundaries

- `apps/web` owns TanStack Start routes, route-local UI, product-aware app components, frontend
  libraries, and browser/SSR integration.
- `packages/ui` owns reusable, product-agnostic UI primitives.
- Do not import database clients, Drizzle schema, or server-only business logic into `apps/web`.
- Do not call API routes with hand-built RPC fetches. Use Better Auth client helpers or typed oRPC
  clients through TanStack Query.
- Use shared schemas from `@starter/schemas` for forms when the same shape is used by API contracts
  or other packages.

## Installed TanStack Stack

- TanStack Router owns routing, URL params, typed search params, route auth gates, loaders,
  navigation, and route-level pending/error/not-found behavior.
- TanStack Start owns the app runtime, SSR integration, middleware, and server functions for
  framework/request concerns.
- TanStack Query owns server state caching, deduping, hydration, preloading, mutations, and
  invalidation. Use oRPC and Better Auth query/mutation option helpers instead of raw query keys
  when those helpers exist.
- `@tanstack/react-router-ssr-query` wires Router and Query together. Do not create a second
  unrelated QueryClient provider or router/query integration in feature code.
- TanStack Form owns interactive form state and validation flow. Use shared Zod schemas when the
  shape is shared with backend contracts or other packages.
- TanStack Table owns complex table state, row models, sorting, filtering, pagination, selection,
  column visibility, and column sizing. Use it for real data grids; do not build a custom table
  state engine in component state.
- TanStack Devtools packages are development diagnostics only. Do not make product behavior depend
  on devtools APIs.
- Do not add new TanStack libraries such as DB, Store, Virtual, Pacer, Hotkeys, or AI unless a task
  explicitly asks for that library and the root package catalog is updated.

## File Placement

- Route files live in `src/routes`.
- Components used only by one route group belong in that route group's private `-components` folder.
- Hooks used only by one route group belong in that route group's private `-hooks` folder.
- Reusable product-aware components belong in `src/components/<domain>`.
- Generic app helpers belong in `src/lib`.
- Do not move product-aware components into `packages/ui`.

Recommended large route shape:

```txt
src/routes/projects/
  route.tsx
  -components/
    projects-table.tsx
    project-filters.tsx
  -hooks/
    use-project-search.ts
```

## Data Loading

- Use route `loader` to preload data needed for the first meaningful render.
- Use `context.queryClient.ensureQueryData(...)` with oRPC or Better Auth query options.
- Components should read preloaded data with `useSuspenseQuery` when the route guarantees the data is
  loaded.
- Use `useQuery` for optional, user-triggered, or conditionally enabled data.
- Use `useMutation` for mutations, then invalidate the smallest useful query keys.
- Do not fetch critical page data only from `useEffect`; that creates waterfalls and loading flashes.
- Keep search params typed with `validateSearch`.

## Tables And Lists

- Use TanStack Table for interactive tables with sorting, filtering, pagination, row selection,
  column visibility, or column sizing.
- Use `@starter/ui` table/data-grid primitives for markup and styling around TanStack Table state.
- Keep shareable table state in typed Router search params.
- Keep server-owned list state in API input and query keys. For server pagination/filter/sort, route
  search params should feed the loader query input.
- Keep purely presentational static tables on `@starter/ui/components/table`; do not introduce
  TanStack Table for a simple two-row details table.

## Server Functions

- Use TanStack Start server functions for framework concerns such as reading request headers,
  setting response headers, redirects, and route/session plumbing.
- Do not implement product CRUD or business mutations in app-local server functions when they belong
  behind the backend API.
- If a server function crosses a network boundary, validate its input.

## Forms

- Use TanStack Form for interactive forms.
- Use Zod schemas from `@starter/schemas` when schemas are shared with API or other UI.
- Build form layout with `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`.
- Set `data-invalid` on `Field` and `aria-invalid` on the control.
- Use `fieldset disabled={mutation.isPending}` for pending form state when the whole form should be
  disabled.
- Show async errors through `toast.error(...)` or field-level errors, not unstructured console output.

## UI Composition

- Use `@starter/ui` components first. Do not recreate Button, Card, Dialog, Sheet, Drawer, Empty,
  Alert, Skeleton, Spinner, Badge, Separator, Field, or Table markup by hand.
- Use full Card composition: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and
  `CardFooter` where applicable.
- Use semantic tokens such as `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`,
  and `ring-ring/50`.
- Use `cn()` for conditional classes.
- Use `gap-*`, not `space-x-*` or `space-y-*`.
- Use `size-*` when width and height are equal.
- Icons inside buttons should rely on component sizing. Add `data-icon="inline-start"` or
  `data-icon="inline-end"` when icon position matters.
- Do not add manual memoization unless profiling shows a need or an existing local pattern requires
  it.

## Testing

- Add focused tests for form validation utilities, auth redirects, query/mutation behavior with user
  impact, and non-trivial UI state machines.
- Prefer Testing Library for user-facing behavior.
- Do not snapshot large component trees unless there is a clear stability benefit.
